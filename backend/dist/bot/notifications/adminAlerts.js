import { Markup } from 'telegraf';
import { User } from '../../models/User.js';
import { CLIENT_URL } from '../config/commands.js';
export const getAdminChatIds = async () => {
    try {
        const admins = await User.find({ role: 'admin', telegramChatId: { $ne: null } });
        return admins.map((a) => a.telegramChatId).filter(Boolean);
    }
    catch (err) {
        console.error('Failed to fetch admin telegram chat IDs:', err.message);
        return [];
    }
};
export const sendTelegramNotification = async (bot, chatId, text) => {
    if (!bot || !chatId)
        return;
    try {
        await bot.telegram.sendMessage(chatId, text, { parse_mode: 'HTML' });
    }
    catch (err) {
        console.error('Failed to send Telegram notification:', err.message);
    }
};
export const sendRevisionNotificationTelegram = async (bot, project) => {
    if (!bot)
        return;
    const adminChatIds = await getAdminChatIds();
    if (adminChatIds.length === 0)
        return;
    const msgText = `⚠️ <b>PROJECT REVISION REQUESTED BY CLIENT</b>\n\n` +
        `Project: <b>${project.editingStyle}</b>\n` +
        `Client: <b>${project.clientName}</b> (${project.clientEmail || 'N/A'})\n` +
        `Rate: <b>${project.price} ${project.currency}</b>\n` +
        `Status: <b>REVISION REQUESTED</b>\n\n` +
        `<b>Client Revision Notes:</b>\n` +
        `<i>"${project.revisionNotes || 'No detailed instructions provided.'}"</i>`;
    const keyboard = Markup.inlineKeyboard([
        [Markup.button.url('🚀 Manage in Admin Portal', `${CLIENT_URL}/admin`)],
    ]);
    for (const chatId of adminChatIds) {
        try {
            await bot.telegram.sendMessage(chatId, msgText, { parse_mode: 'HTML', ...keyboard });
        }
        catch (err) {
            console.error(`Failed to send revision alert to admin chat ${chatId}:`, err.message);
        }
    }
};
