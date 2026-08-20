import { User } from '../../models/User.js';
import { PendingLink } from '../../models/PendingLink.js';
import { getAdminMenuKeyboard } from '../keyboards/adminKeyboards.js';
import { getClientMenuKeyboard } from '../keyboards/clientKeyboards.js';
import { getUnlinkedMenuKeyboard } from '../keyboards/commonKeyboards.js';
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
