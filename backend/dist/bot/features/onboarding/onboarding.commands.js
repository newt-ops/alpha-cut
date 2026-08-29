import { User } from '../../../models/User.js';
import { PendingLink } from '../../../models/PendingLink.js';
import { getAdminMenuKeyboard } from '../../keyboards/adminKeyboards.js';
import { getClientMenuKeyboard } from '../../keyboards/clientKeyboards.js';
import { getUnlinkedMenuKeyboard } from '../../keyboards/commonKeyboards.js';
export const handleStartCommand = async (ctx) => {
    try {
        const message = ctx.message;
        const parts = (message?.text || '').split(' ');
        const startPayload = parts[1]; // Deep link parameter if present
        const chatId = ctx.chat?.id.toString();
        if (!chatId)
            return;
        // Fast Path: Check if account is ALREADY linked by telegramChatId
        let user = await User.findOne({ telegramChatId: chatId });
        // Handle deep-link token binding (e.g. /start <token>)
        if (startPayload && startPayload.length >= 10) {
            const pending = await PendingLink.findOne({
                token: startPayload,
                type: 'deep_link',
                used: false,
                expiresAt: { $gt: new Date() },
            });
            if (pending) {
                const boundUser = await User.findById(pending.userId);
                if (boundUser) {
                    boundUser.telegramChatId = chatId;
                    boundUser.telegramLinkedAt = new Date();
                    await boundUser.save();
                    pending.used = true;
                    await pending.save();
                    user = boundUser;
                }
            }
        }
        if (user) {
            const menuKb = user.role === 'admin' ? getAdminMenuKeyboard() : getClientMenuKeyboard();
            return ctx.reply(`🎉 <b>Account Connected!</b>\n\nWelcome back, <b>${user.name}</b> (${user.role.toUpperCase()}).\nYour Telegram account is active with Alpha Cut.`, { parse_mode: 'HTML', ...menuKb });
        }
        // Unlinked user welcome screen
        return ctx.reply(`🎬 <b>Welcome to Alpha Cut Bot!</b>\n\n` +
            `Track video editing projects, review proposals, and receive instant status alerts.\n\n` +
            `<b>To Connect Your Workspace:</b>\n` +
            `1. Log into your account on <code>alpha-cut.com</code>\n` +
            `2. Go to Settings → Connect Telegram to get your 6-digit code\n` +
            `3. Send <code>/link 123456</code> here`, { parse_mode: 'HTML', ...getUnlinkedMenuKeyboard() });
    }
    catch (err) {
        console.error('[BOT START ERROR]:', err.message);
    }
};
export const handleHelpCommand = async (ctx) => {
    try {
        return ctx.reply(`💡 <b>ALPHA CUT TELEGRAM BOT COMMANDS</b>\n\n` +
            `• <b>/start</b> — Initialize bot & view workspace status\n` +
            `• <b>/menu</b> — Main navigation control panel\n` +
            `• <b>/projects</b> — View active video edit status & deliverables\n` +
            `• <b>/packages</b> — Video editing pricing tiers & features\n` +
            `• <b>/styles</b> — Explore video editing visual styles\n` +
            `• <b>/link [code]</b> — Link your Telegram to Alpha Cut account\n` +
            `• <b>/unlink</b> — Disconnect Telegram account`, { parse_mode: 'HTML' });
    }
    catch (err) {
        console.error('[BOT HELP ERROR]:', err.message);
    }
};
export const handleLinkCommand = async (ctx) => {
    try {
        const message = ctx.message;
        const parts = (message?.text || '').split(' ');
        const code = parts[1];
        const chatId = ctx.chat?.id.toString();
        if (!chatId)
            return;
        if (!code) {
            return ctx.reply('Please provide your 6-digit code. Example: <code>/link 123456</code>', { parse_mode: 'HTML' });
        }
        const existingBoundUser = await User.findOne({ telegramChatId: chatId });
        const pending = await PendingLink.findOne({ code, type: 'code', used: false, expiresAt: { $gt: new Date() } });
        if (!pending) {
            return ctx.reply('⚠️ Invalid or expired code. Generate a new code in your dashboard.');
        }
        const user = await User.findById(pending.userId);
        if (!user)
            return ctx.reply('⚠️ User account not found.');
        if (existingBoundUser && existingBoundUser._id.toString() !== user._id.toString()) {
            return ctx.reply(`⚠️ Link Rejected: Account already linked to ${existingBoundUser.email}.`);
        }
        user.telegramChatId = chatId;
        user.telegramLinkedAt = new Date();
        await user.save();
        pending.used = true;
        await pending.save();
        const menuKb = user.role === 'admin' ? getAdminMenuKeyboard() : getClientMenuKeyboard();
        ctx.reply(`🎉 <b>Account Linked Successfully!</b>\n\nConnected to <b>${user.name}</b> (${user.role.toUpperCase()}).`, {
            parse_mode: 'HTML',
            ...menuKb,
        });
    }
    catch (err) {
        console.error('[BOT LINK ERROR]:', err.message);
    }
};
export const handleUnlinkCommand = async (ctx) => {
    try {
        const chatId = ctx.chat?.id.toString();
        if (!chatId)
            return;
        const user = await User.findOne({ telegramChatId: chatId });
        if (!user)
            return ctx.reply('⚠️ Account is not linked.', getUnlinkedMenuKeyboard());
        user.telegramChatId = null;
        user.telegramLinkedAt = null;
        await user.save();
        ctx.reply('ℹ️ <b>Telegram Account Disconnected.</b>', { parse_mode: 'HTML', ...getUnlinkedMenuKeyboard() });
    }
    catch (err) {
        console.error('[BOT UNLINK ERROR]:', err.message);
    }
};
