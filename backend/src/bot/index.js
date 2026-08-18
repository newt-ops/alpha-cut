import { Telegraf } from 'telegraf';
import { config } from '../config/env.js';
import { registerBotCommands } from './config/commands.js';
import { handleStartCommand } from './commands/start.js';
import { handleMenuCommand } from './commands/menu.js';
import { handleStatusCommand } from './commands/status.js';
import { handleProjectsCommand } from './commands/projects.js';
import { handlePackagesCommand } from './commands/packages.js';
import { handleStylesCommand } from './commands/styles.js';
import { handleHelpCommand, handleAboutCommand } from './commands/help.js';
import { handleLinkCommand, handleUnlinkCommand } from './commands/link.js';
import { handleCallbackQuery } from './handlers/callbackRouter.js';

import {
  getAdminChatIds,
  sendTelegramNotification as rawSendTelegramNotification,
  sendRevisionNotificationTelegram as rawSendRevisionNotificationTelegram,
} from './notifications/adminAlerts.js';

import {
  sendProposalNotificationTelegram as rawSendProposalNotificationTelegram,
  sendDeliveryNotificationTelegram as rawSendDeliveryNotificationTelegram,
} from './notifications/clientAlerts.js';

import { sendPaymentReceiptNotificationTelegram as rawSendPaymentReceiptNotificationTelegram } from './notifications/paymentAlerts.js';

import {
  getUnicodeProgressBar,
  updateTelegramStatusCard as rawUpdateTelegramStatusCard,
  updateContractTelegramStatusCard as rawUpdateContractTelegramStatusCard,
} from './notifications/statusCards.js';

export const bot = config.telegramBotToken ? new Telegraf(config.telegramBotToken) : null;

if (bot) {
  registerBotCommands(bot);

  // Bind Commands
  bot.command('start', handleStartCommand);
  bot.command('menu', handleMenuCommand);
  bot.command('status', handleStatusCommand);
  bot.command('projects', handleProjectsCommand);
  bot.command('packages', handlePackagesCommand);
  bot.command('styles', handleStylesCommand);
  bot.command('about', handleAboutCommand);
  bot.command('help', handleHelpCommand);
  bot.command('link', handleLinkCommand);
  bot.command('unlink', handleUnlinkCommand);

  // Bind Callback Router
  bot.on('callback_query', handleCallbackQuery);
}

// Notification Helper Bindings
export const sendTelegramNotification = (chatId, text) => rawSendTelegramNotification(bot, chatId, text);
export const sendRevisionNotificationTelegram = (project) => rawSendRevisionNotificationTelegram(bot, project);
export const sendProposalNotificationTelegram = (project, clientChatId) => rawSendProposalNotificationTelegram(bot, project, clientChatId);
export const sendDeliveryNotificationTelegram = (project, clientChatId) => rawSendDeliveryNotificationTelegram(bot, project, clientChatId);
export const sendPaymentReceiptNotificationTelegram = (data) => rawSendPaymentReceiptNotificationTelegram(bot, data);
export const updateTelegramStatusCard = (project, clientChatId) => rawUpdateTelegramStatusCard(bot, project, clientChatId);
export const updateContractTelegramStatusCard = (contract, clientChatId, count) => rawUpdateContractTelegramStatusCard(bot, contract, clientChatId, count);

export { getAdminChatIds, getUnicodeProgressBar };
