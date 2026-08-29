import { Telegraf } from 'telegraf';
import { config } from '../../config/env.js';

const sanitizeUrl = (rawUrl?: string): string => {
  if (!rawUrl) return 'https://alpha-cut.com';
  const trimmed = rawUrl.trim().replace(/\/$/, '');
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

export const CLIENT_URL = sanitizeUrl(config.clientUrl);
export const MINI_APP_URL = process.env.MINI_APP_URL || (CLIENT_URL.includes('alpha-cut.com') ? 'https://app.alpha-cut.com' : `${CLIENT_URL}/app`);

export const botCommands = [
  { command: 'start', description: 'Launch bot & main menu' },
  { command: 'menu', description: 'Open role-based control menu' },
  { command: 'status', description: 'Check live active work status' },
  { command: 'projects', description: 'View all video projects & contracts' },
  { command: 'packages', description: 'View pricing & rate ranges' },
  { command: 'styles', description: 'Browse signature editing styles' },
  { command: 'about', description: 'About Alpha Cut Agency' },
  { command: 'help', description: 'Get help and instructions' },
];

export const registerBotCommands = async (bot: Telegraf | null): Promise<void> => {
  if (!bot) return;
  try {
    await bot.telegram.setMyCommands(botCommands);
    await (bot.telegram as any).setChatMenuButton({
      type: 'web_app',
      text: 'Open Alpha Cut',
      web_app: { url: MINI_APP_URL },
    });
    console.log('[BOT CONFIG] Telegraf commands & WebApp menu button registered.');

    const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET || 'secret';
    const serverUrl = process.env.SERVER_URL || process.env.API_URL || 'https://api.alpha-cut.com';
    const webhookUrl = `${serverUrl.replace(/\/$/, '')}/api/v1/telegram/webhook/${webhookSecret}`;

    try {
      await bot.telegram.setWebhook(webhookUrl);
      console.log(`[BOT CONFIG] Telegram Webhook registered successfully at ${webhookUrl}`);
    } catch (whErr: any) {
      console.warn(`[BOT CONFIG WARN] Could not set webhook (${whErr.message}). Fallback to bot.launch() polling.`);
      bot.launch().catch((e) => console.error('[BOT LAUNCH ERROR]:', e.message));
    }
  } catch (err: any) {
    console.error('[BOT CONFIG ERROR] Failed to set commands/menu button/webhook:', err.message);
  }
};
