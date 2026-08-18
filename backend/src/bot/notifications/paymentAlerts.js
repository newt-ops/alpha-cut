import { Markup } from 'telegraf';
import { CLIENT_URL, MINI_APP_URL } from '../config/commands.js';
import { getAdminChatIds } from './adminAlerts.js';

export const sendPaymentReceiptNotificationTelegram = async (bot, { clientChatId, clientName, amount, currency, txRef, title }) => {
  if (!bot) return;

  const dateStr = new Date().toLocaleDateString();

  // Client Receipt Card
  if (clientChatId) {
    const clientText = `💳 <b>PAYMENT CONFIRMED — OFFICIAL RECEIPT</b>\n\n` +
      `Amount Paid: <b>${amount} ${currency}</b>\n` +
      `Transaction Ref: <code>${txRef}</code>\n` +
      `Item: <b>${title || 'Alpha Cut Video Service'}</b>\n` +
      `Payment Gateway: <b>Chapa API</b>\n` +
      `Date: <b>${dateStr}</b>\n\n` +
      `Thank you for your business! Your project is moving forward.`;

    const clientKb = Markup.inlineKeyboard([
      [Markup.button.webApp('🚀 Open Mini App Workspace', MINI_APP_URL)],
      [Markup.button.url('🌐 Open Web Platform', CLIENT_URL)],
    ]);

    try {
      await bot.telegram.sendMessage(clientChatId, clientText, { parse_mode: 'HTML', ...clientKb });
    } catch (err) {
      console.error('Failed to send payment receipt to client:', err.message);
    }
  }

  // Admin Alert Notification
  const adminChatIds = await getAdminChatIds();
  if (adminChatIds.length > 0) {
    const adminText = `💰 <b>NEW PAYMENT CONFIRMED!</b>\n\n` +
      `Client: <b>${clientName || 'Client'}</b>\n` +
      `Amount: <b>${amount} ${currency}</b>\n` +
      `Item: <b>${title || 'Project / Retainer'}</b>\n` +
      `Tx Ref: <code>${txRef}</code>\n` +
      `Date: <b>${dateStr}</b>`;

    const adminKb = Markup.inlineKeyboard([
      [Markup.button.url('🚀 Open Admin ERP Dashboard', `${CLIENT_URL}/admin`)],
    ]);

    for (const chatId of adminChatIds) {
      try {
        await bot.telegram.sendMessage(chatId, adminText, { parse_mode: 'HTML', ...adminKb });
      } catch (err) {
        console.error(`Failed to send payment alert to admin ${chatId}:`, err.message);
      }
    }
  }
};
