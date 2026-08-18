import { config } from '../../config/env.js';

export const CLIENT_URL = process.env.CLIENT_URL || 'https://alpha-cut-nine.vercel.app';
export const MINI_APP_URL = `${CLIENT_URL}/app`;

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

export const registerBotCommands = async (bot) => {
  if (!bot) return;
  try {
    await bot.telegram.setMyCommands(botCommands);
    await bot.telegram.setChatMenuButton({
      type: 'web_app',
      text: 'Open Alpha Cut',
      web_app: { url: MINI_APP_URL },
    });
    console.log('[BOT CONFIG] Telegraf commands & WebApp menu button registered.');
  } catch (err) {
    console.error('[BOT CONFIG ERROR] Failed to set commands/menu button:', err.message);
  }
};
