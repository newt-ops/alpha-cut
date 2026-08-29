import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { requireAuth } from '../middleware/auth.middleware.js';
import { bot } from '../services/telegram.service.js';
import { PendingLink } from '../models/PendingLink.js';
import { User } from '../models/User.js';
import { config } from '../config/env.js';
import { generateTokens, setRefreshCookie } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/webhook/:secret', async (req: Request, res: Response): Promise<any> => {
  const { secret } = req.params;
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET || 'secret';

  if (secret !== webhookSecret) {
    return res.status(403).json({ success: false, message: 'Forbidden: Secret mismatch' });
  }

  if (bot) {
    try {
      if (req.body) {
        console.log(`[TELEGRAM WEBHOOK] Received update keys: ${Object.keys(req.body).join(', ')}`);
      }
      await bot.handleUpdate(req.body);
      if (!res.headersSent) {
        res.status(200).send('OK');
      }
    } catch (err: any) {
      console.error('Telegram handleUpdate error:', err.message);
      if (!res.headersSent) {
        res.status(200).send('OK');
      }
    }
  } else {
    res.status(200).send('Bot not configured');
  }
});

export const validateInitData = (initData: string, botToken: string): boolean => {
  if (!initData || !botToken) return false;
  try {
    const cleanToken = botToken.trim();
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    if (!hash) return false;

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(cleanToken).digest();

    // Method A: Raw unescaped URL query string pairs split by '&'
    const rawPairs = initData.split('&').filter((p) => p && !p.startsWith('hash='));
    rawPairs.sort((a, b) => a.split('=')[0].localeCompare(b.split('=')[0]));
    const dataCheckStringRaw = rawPairs.join('\n');
    const hashRaw = crypto.createHmac('sha256', secretKey).update(dataCheckStringRaw).digest('hex');
    if (hashRaw.toLowerCase() === hash.toLowerCase()) return true;

    // Method B: decodeURIComponent on raw pairs
    const decodedPairs = rawPairs.map((p) => {
      const eqIdx = p.indexOf('=');
      if (eqIdx === -1) return p;
      const k = p.substring(0, eqIdx);
      const v = decodeURIComponent(p.substring(eqIdx + 1));
      return `${k}=${v}`;
    });
    decodedPairs.sort((a, b) => a.split('=')[0].localeCompare(b.split('=')[0]));
    const dataCheckStringDecoded = decodedPairs.join('\n');
    const hashDecoded = crypto.createHmac('sha256', secretKey).update(dataCheckStringDecoded).digest('hex');
    if (hashDecoded.toLowerCase() === hash.toLowerCase()) return true;

    // Method C: URLSearchParams parsed pairs
    const searchPairs: string[] = [];
    urlParams.forEach((val, key) => {
      if (key !== 'hash') searchPairs.push(`${key}=${val}`);
    });
    searchPairs.sort();
    const dataCheckStringSearch = searchPairs.join('\n');
    const hashSearch = crypto.createHmac('sha256', secretKey).update(dataCheckStringSearch).digest('hex');
    if (hashSearch.toLowerCase() === hash.toLowerCase()) return true;

    return false;
  } catch (e) {
    return false;
  }
};

// Telegram WebApp InitData Signature Authentication Bridge
router.post('/webapp/auth', async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { initData } = req.body;
    if (!initData) {
      return res.status(400).json({ success: false, message: 'initData parameter is required' });
    }

    const urlParams = new URLSearchParams(initData);
    const userParam = urlParams.get('user');
    if (!userParam) {
      return res.status(400).json({ success: false, message: 'User payload missing in initData' });
    }

    let telegramUser: any = {};
    try {
      telegramUser = JSON.parse(userParam);
    } catch (e) {
      return res.status(400).json({ success: false, message: 'Invalid user JSON in initData' });
    }

    const chatId = telegramUser.id ? telegramUser.id.toString() : null;
    if (!chatId) {
      return res.status(400).json({ success: false, message: 'Invalid Telegram User ID' });
    }

    // 1. FAST PATH: Look up user ALREADY linked by telegramChatId in MongoDB
    let user = await User.findOne({
      $or: [
        { telegramChatId: chatId },
        { telegramChatId: Number(chatId) },
        { telegramChatId: String(chatId) },
      ],
    });

    // 2. If not bound by chatId yet, validate Telegram initData HMAC signature before allowing binding
    if (!user && config.telegramBotToken) {
      const isValid = validateInitData(initData, config.telegramBotToken);
      if (!isValid) {
        console.warn(`[TELEGRAM AUTH WARN] initData HMAC signature verification failed for unlinked chatId ${chatId}`);
        return res.status(403).json({ success: false, message: 'Telegram authentication signature check failed.' });
      }
    }

    // 3. Fallback: Match via Web JWT Authorization header if present
    if (!user && req.headers.authorization) {
      try {
        const token = req.headers.authorization.replace('Bearer ', '');
        const jwt = (await import('jsonwebtoken')).default;
        const decoded: any = jwt.verify(token, config.jwtAccessSecret);
        if (decoded?.userId) {
          const authUser = await User.findById(decoded.userId);
          if (authUser) {
            authUser.telegramChatId = chatId;
            authUser.telegramLinkedAt = new Date();
            await authUser.save();
            user = authUser;
          }
        }
      } catch (err) {}
    }

    // 4. If account is not linked to any user in MongoDB
    if (!user) {
      console.log(`[TELEGRAM AUTH] Account unlinked for chatId=${chatId} (${telegramUser.username || telegramUser.first_name})`);
      return res.status(200).json({
        success: false,
        unlinked: true,
        telegramUser,
        message: 'Telegram account is not linked to any registered Alpha Cut user profile.',
      });
    }

    console.log(`[TELEGRAM AUTH SUCCESS] Authenticated ${user.email} (chatId=${chatId})`);

    const { accessToken, refreshToken } = generateTokens(user);
    setRefreshCookie(res, refreshToken);

    return res.status(200).json({
      success: true,
      accessToken,
      user,
    });
  } catch (err) {
    next(err);
  }
});

// Link 6-Digit Code directly inside Telegram Mini App
router.post('/webapp/link-code', async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { code, initData } = req.body;

    let chatId: string | null = null;
    let telegramUser: any = null;
    if (initData) {
      try {
        const urlParams = new URLSearchParams(initData);
        const userParam = urlParams.get('user');
        if (userParam) {
          telegramUser = JSON.parse(userParam);
          chatId = telegramUser.id ? telegramUser.id.toString() : null;
        }
      } catch (e) {}
    }

    if (chatId) {
      const alreadyLinkedUser = await User.findOne({
        $or: [
          { telegramChatId: chatId },
          { telegramChatId: Number(chatId) },
          { telegramChatId: String(chatId) },
        ],
      });

      if (alreadyLinkedUser) {
        const { accessToken, refreshToken } = generateTokens(alreadyLinkedUser);
        setRefreshCookie(res, refreshToken);

        return res.status(200).json({
          success: true,
          accessToken,
          user: alreadyLinkedUser,
        });
      }
    }

    if (!code) {
      return res.status(400).json({ success: false, message: '6-digit code is required' });
    }

    let pending = await PendingLink.findOne({
      code: (code as string).trim(),
      type: 'code',
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!pending) {
      pending = await PendingLink.findOne({
        code: (code as string).trim(),
        type: 'code',
      }).sort({ createdAt: -1 });
    }

    if (!pending) {
      return res.status(400).json({ success: false, message: 'Invalid 6-digit code. Generate a new code in your dashboard.' });
    }

    const user = await User.findById(pending.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    if (chatId) {
      user.telegramChatId = chatId;
      user.telegramLinkedAt = new Date();
      await user.save();
    }

    pending.used = true;
    await pending.save();

    const { accessToken, refreshToken } = generateTokens(user);
    setRefreshCookie(res, refreshToken);

    return res.status(200).json({
      success: true,
      accessToken,
      user,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/link/code', requireAuth, async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!._id;

    await PendingLink.updateMany({ userId, type: 'code', used: false }, { used: true });

    const rawCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    const pending = await PendingLink.create({
      userId,
      code: rawCode,
      type: 'code',
      expiresAt,
    });

    res.status(200).json({
      success: true,
      code: pending.code,
      expiresAt: pending.expiresAt,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/link/token', requireAuth, async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!._id;

    await PendingLink.updateMany({ userId, type: 'deep_link', used: false }, { used: true });

    const token = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await PendingLink.create({
      userId,
      token,
      type: 'deep_link',
      expiresAt,
    });

    const botUsername = (config.telegramBotUsername || '@alpha_cut_bot').replace('@', '');
    const deepLinkUrl = `https://t.me/${botUsername}?start=${token}`;

    res.status(200).json({
      success: true,
      deepLinkUrl,
      expiresAt,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/unlink', requireAuth, async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    user.telegramChatId = null;
    user.telegramLinkedAt = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Telegram account disconnected successfully. You can now link to another account.',
      user,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
