import express from 'express';
import crypto from 'crypto';
import { requireAuth } from '../middleware/auth.middleware.js';
import { bot } from '../services/telegram.service.js';
import { PendingLink } from '../models/PendingLink.js';
import { User } from '../models/User.js';
import { config } from '../config/env.js';
import { generateTokens, setRefreshCookie } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/webhook/:secret', async (req, res) => {
  const { secret } = req.params;
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET || 'secret';

  if (secret !== webhookSecret) {
    return res.status(403).json({ success: false, message: 'Forbidden: Secret mismatch' });
  }

  if (bot) {
    try {
      await bot.handleUpdate(req.body, res);
    } catch (err) {
      console.error('Telegram handleUpdate error:', err.message);
      if (!res.headersSent) {
        res.status(200).send('OK');
      }
    }
  } else {
    res.status(200).send('Bot not configured');
  }
});

// Telegram WebApp InitData Signature Authentication Bridge
router.post('/webapp/auth', async (req, res, next) => {
  try {
    const { initData } = req.body;
    if (!initData) {
      return res.status(400).json({ success: false, message: 'initData parameter is required' });
    }

    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');

    if (!hash) {
      return res.status(400).json({ success: false, message: 'Hash parameter missing in initData' });
    }

    // Sort parameters alphabetically
    const dataCheckArr = [];
    urlParams.sort();
    for (const [key, value] of urlParams.entries()) {
      dataCheckArr.push(`${key}=${value}`);
    }
    const dataCheckString = dataCheckArr.join('\n');

    // HMAC-SHA256 verification: secret_key = HMAC-SHA256("WebAppData", bot_token)
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(config.telegramBotToken || '')
      .digest();

    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (calculatedHash !== hash) {
      return res.status(401).json({ success: false, message: 'Invalid WebApp initData signature' });
    }

    // Check auth_date freshness (< 24h)
    const authDate = Number(urlParams.get('auth_date') || 0);
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 86400) {
      return res.status(401).json({ success: false, message: 'Stale authentication data (older than 24h)' });
    }

    const userParam = urlParams.get('user');
    if (!userParam) {
      return res.status(400).json({ success: false, message: 'User payload missing in initData' });
    }

    const telegramUser = JSON.parse(userParam);
    const chatId = telegramUser.id ? telegramUser.id.toString() : null;

    if (!chatId) {
      return res.status(400).json({ success: false, message: 'Invalid Telegram User ID' });
    }

    const user = await User.findOne({ telegramChatId: chatId });
    if (!user) {
      return res.status(200).json({
        success: false,
        unlinked: true,
        telegramUser,
        message: 'Telegram account is not linked to any registered Alpha Cut user profile.',
      });
    }

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

router.post('/link/code', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user._id;

    await PendingLink.updateMany({ userId, type: 'code', used: false }, { used: true });

    const rawCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // Valid for 1 hour

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

router.post('/link/token', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user._id;

    await PendingLink.updateMany({ userId, type: 'deep_link', used: false }, { used: true });

    const token = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // Valid for 1 hour

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

// Unlink / Disconnect Telegram Account
router.post('/unlink', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
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
