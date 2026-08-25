import { Context } from 'telegraf';
import { getClientMenuKeyboard } from '../keyboards/clientKeyboards.js';
import { getSupportKeyboard } from '../keyboards/commonKeyboards.js';

export const handleHelpCommand = async (ctx: Context): Promise<any> => {
  try {
    const msg = `ℹ️ <b>ALPHA CUT BOT COMMANDS & SUPPORT GUIDE</b>\n\n` +
      `<b>⚡ QUICK COMMANDS:</b>\n` +
      `• <code>/menu</code> — Open role-based control menu\n` +
      `• <code>/status</code> — Inspect live active project & retainer progress\n` +
      `• <code>/projects</code> — View full list of active work & contracts\n` +
      `• <code>/packages</code> — Inspect rate cards (ETB / USD)\n` +
      `• <code>/styles</code> — Browse signature editing styles\n` +
      `• <code>/link 123456</code> — Connect Telegram using 6-digit code\n` +
      `• <code>/unlink</code> — Disconnect your Telegram account\n\n` +
      `<b>🚀 TELEGRAM MINI APP:</b>\n` +
      `Click the <b>"Open Alpha Cut"</b> menu button at the bottom-left of the chat window to launch the interactive workspace inside Telegram.\n\n` +
      `<b>💬 DIRECT SUPPORT:</b>\n` +
      `Reach out to agency founders at <code>alphacutagency@gmail.com</code>.`;

    ctx.reply(msg, { parse_mode: 'HTML', ...getClientMenuKeyboard() });
  } catch (err: any) {
    console.error('[BOT HELP COMMAND ERROR]:', err.message);
  }
};

export const handleAboutCommand = async (ctx: Context): Promise<any> => {
  try {
    const msg = `⚡ <b>ALPHA CUT EXECUTIVE VIDEO AGENCY</b>\n\n` +
      `We partner with tech creators, startup founders, and high-growth brands to deliver high-retention video edits.\n\n` +
      `• <b>Founders:</b> Amir & Aymen\n` +
      `• <b>Agency Focus:</b> Retention short-form, kinetic typography, motion graphics, retainer contracts.\n` +
      `• <b>Email:</b> <code>alphacutagency@gmail.com</code>\n` +
      `• <b>Web Platform:</b> https://alpha-cut.com`;

    ctx.reply(msg, { parse_mode: 'HTML', ...getSupportKeyboard() });
  } catch (err: any) {
    console.error('[BOT ABOUT COMMAND ERROR]:', err.message);
  }
};
