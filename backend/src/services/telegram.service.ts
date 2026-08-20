// Clean re-export facade pointing to modular backend/src/bot/ architecture
export {
  bot,
  getAdminChatIds,
  sendTelegramNotification,
  sendRevisionNotificationTelegram,
  sendProposalNotificationTelegram,
  sendDeliveryNotificationTelegram,
  sendPaymentReceiptNotificationTelegram,
  updateTelegramStatusCard,
  updateContractTelegramStatusCard,
  getUnicodeProgressBar,
} from '../bot/index.js';
