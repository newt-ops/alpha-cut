import { Markup } from 'telegraf';
import { CLIENT_URL, MINI_APP_URL } from '../config/commands.js';
export const sendProposalNotificationTelegram = async (bot, project, clientChatId) => {
    if (!bot || !clientChatId)
        return;
    const msgText = `🎬 <b>NEW PROJECT PROPOSAL RECEIVED</b>\n\n` +
        `Style: <b>${project.editingStyle}</b>\n` +
        `Tier: <b>${project.packageTier?.toUpperCase()} (${project.contentLength?.toUpperCase()})</b>\n` +
        `Rate: <b>${project.price} ${project.currency}</b>\n` +
        `Deadline: <b>${new Date(project.deadline).toLocaleDateString()}</b>`;
    const keyboard = Markup.inlineKeyboard([
        [
            Markup.button.callback('🔍 See Details', `toggle_details_proj_${project._id}`),
            Markup.button.webApp('🚀 Open & Respond', `${MINI_APP_URL}?startapp=proposal_${project._id}`),
        ],
        [Markup.button.callback('⬅️ Main Menu', 'menu:main')],
    ]);
    try {
        const sentMsg = await bot.telegram.sendMessage(clientChatId, msgText, { parse_mode: 'HTML', ...keyboard });
        project.telegramStatusMessageId = sentMsg.message_id.toString();
        await project.save();
    }
    catch (err) {
        console.error('Failed to send proposal notification:', err.message);
    }
};
export const sendDeliveryNotificationTelegram = async (bot, project, clientChatId) => {
    if (!bot || !clientChatId)
        return;
    const msgText = `🎉 <b>YOUR VIDEO EDIT IS DELIVERED & READY!</b>\n\n` +
        `Style: <b>${project.editingStyle}</b>\n` +
        `Rate: <b>${project.price} ${project.currency}</b>\n\n` +
        `Click below to launch your Mini App or visit the web platform to confirm delivery.`;
    const keyboard = Markup.inlineKeyboard([
        [Markup.button.webApp('🚀 Open App to Confirm', `${MINI_APP_URL}?startapp=delivery_${project._id}`)],
        [Markup.button.url('🌐 Open Web Platform', CLIENT_URL)],
    ]);
    try {
        await bot.telegram.sendMessage(clientChatId, msgText, { parse_mode: 'HTML', ...keyboard });
    }
    catch (err) {
        console.error('Failed to send delivery notification:', err.message);
    }
};
