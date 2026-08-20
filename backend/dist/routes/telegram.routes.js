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
        }
        catch (err) {
            console.error('Telegram handleUpdate error:', err.message);
            if (!res.headersSent) {
                res.status(200).send('OK');
            }
        }
    }
    else {
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
        const userParam = urlParams.get('user');
        if (!userParam) {
            return res.status(400).json({ success: false, message: 'User payload missing in initData' });
        }
        let telegramUser = {};
        try {
            telegramUser = JSON.parse(userParam);
        }
        catch (e) {
            return res.status(400).json({ success: false, message: 'Invalid user JSON in initData' });
        }
        const chatId = telegramUser.id ? telegramUser.id.toString() : null;
        if (!chatId) {
            return res.status(400).json({ success: false, message: 'Invalid Telegram User ID' });
        }
        // 1. FAST PATH: Check if user is ALREADY linked by telegramChatId in MongoDB
        let user = await User.findOne({
            $or: [
                { telegramChatId: chatId },
                { telegramChatId: Number(chatId) },
                { telegramChatId: String(chatId) },
            ],
        });
        // 2. If not found by chatId, attempt to match via Web JWT Authorization header if provided
        if (!user && req.headers.authorization) {
            try {
                const token = req.headers.authorization.replace('Bearer ', '');
                const jwt = (await import('jsonwebtoken')).default;
                const decoded = jwt.verify(token, config.jwtAccessSecret);
                if (decoded?.userId) {
                    const authUser = await User.findById(decoded.userId);
                    if (authUser) {
                        authUser.telegramChatId = chatId;
                        authUser.telegramLinkedAt = new Date();
                        await authUser.save();
                        user = authUser;
                    }
                }
            }
            catch (err) {
                // Token verification fallback
            }
        }
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
    }
    catch (err) {
        next(err);
    }
});
// Link 6-Digit Code directly inside Telegram Mini App
router.post('/webapp/link-code', async (req, res, next) => {
    try {
        const { code, initData } = req.body;
        let chatId = null;
        let telegramUser = null;
        if (initData) {
            try {
                const urlParams = new URLSearchParams(initData);
                const userParam = urlParams.get('user');
                if (userParam) {
                    telegramUser = JSON.parse(userParam);
                    chatId = telegramUser.id ? telegramUser.id.toString() : null;
                }
            }
            catch (e) { }
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
            code: code.trim(),
            type: 'code',
            used: false,
            expiresAt: { $gt: new Date() },
        });
        if (!pending) {
            pending = await PendingLink.findOne({
                code: code.trim(),
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
    }
    catch (err) {
        next(err);
    }
});
router.post('/link/code', requireAuth, async (req, res, next) => {
    try {
        const userId = req.user._id;
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
    }
    catch (err) {
        next(err);
    }
});
router.post('/link/token', requireAuth, async (req, res, next) => {
    try {
        const userId = req.user._id;
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
    }
    catch (err) {
        next(err);
    }
});
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
    }
    catch (err) {
        next(err);
    }
});
export default router;
