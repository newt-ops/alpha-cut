import { Markup } from 'telegraf';
import { MINI_APP_URL } from '../config/commands.js';
import { sendProposalNotificationTelegram } from './clientAlerts.js';
export const getUnicodeProgressBar = (status) => {
    switch (status) {
        case 'proposal_sent':
            return '[■□□□] 25% (Proposal Sent)';
        case 'in_progress':
            return '[■■□□] 50% (In Progress)';
        case 'delivered':
            return '[■■■□] 85% (Work Delivered)';
        case 'completed':
            return '[■■■■] 100% (Completed)';
        case 'declined':
            return '[□□□□] Declined';
        default:
            return '[■□□□] Pending';
    }
};
export const updateTelegramStatusCard = async (bot, project, clientChatId) => {
    if (!bot || !clientChatId)
        return;
    await sendProposalNotificationTelegram(bot, project, clientChatId);
};
export const updateContractTelegramStatusCard = async (bot, contract, clientChatId, deliveredCount = 0) => {
    if (!bot || !clientChatId)
        return;
    const pct = contract.totalVideosPlanned > 0
        ? Math.round((deliveredCount / contract.totalVideosPlanned) * 100)
        : 0;
    const statusText = `📦 <b>RETAINER CONTRACT STATUS CARD</b>\n\n` +
        `Tier: <b>${contract.packageTier?.toUpperCase()} (${contract.frequency})</b>\n` +
        `Monthly Investment: <b>${contract.monthlyPrice} ${contract.currency}</b>\n` +
        `Progress: <b>${deliveredCount}/${contract.totalVideosPlanned} Videos Delivered (${pct}%)</b>\n` +
        `Status: <b>${contract.status.toUpperCase()}</b>\n\n` +
        `Log into your Mini App to approve video renders or review schedule.`;
    const keyboard = Markup.inlineKeyboard([
        [Markup.button.webApp('🚀 Open Work in Mini App', `${MINI_APP_URL}?startapp=contract_${contract._id}`)],
        [Markup.button.callback('⬅️ Main Menu', 'menu:main')],
    ]);
    if (contract.telegramStatusMessageId) {
        try {
            await bot.telegram.editMessageText(clientChatId, Number(contract.telegramStatusMessageId), undefined, statusText, { parse_mode: 'HTML', ...keyboard });
            return;
        }
        catch (err) {
            console.log('Failed to edit contract status message, sending new card:', err.message);
        }
    }
    try {
        const sentMsg = await bot.telegram.sendMessage(clientChatId, statusText, {
            parse_mode: 'HTML',
            ...keyboard,
        });
        contract.telegramStatusMessageId = sentMsg.message_id.toString();
        await contract.save();
    }
    catch (err) {
        console.error('Failed to send contract status card:', err.message);
    }
};
