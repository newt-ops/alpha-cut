import express from 'express';
import crypto from 'crypto';
import { requireAuth } from '../middleware/auth.middleware.js';
import { bot } from '../services/telegram.service.js';
import { PendingLink } from '../models/PendingLink.js';
import { config } from '../config/env.js';

const router = express.Router();

router.post('/webhook/:secret', (req, res) => {
  const { secret } = req.params;
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET || 'secret';

  if (secret !== webhookSecret) {
    return res.status(403).json({ success: false, message: 'Forbidden: Secret mismatch' });
  }

  if (bot) {
    bot.handleUpdate(req.body, res);
  } else {
    res.status(200).send('Bot not configured');
  }
});

router.post('/link/code', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user._id;

    await PendingLink.updateMany({ userId, type: 'code', used: false }, { used: true });

    const rawCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

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
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

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

export default router;
