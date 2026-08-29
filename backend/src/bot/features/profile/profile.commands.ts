import { Context } from 'telegraf';
import { User } from '../../../models/User.js';
import { getAdminMenuKeyboard } from '../../keyboards/adminKeyboards.js';
import { getClientMenuKeyboard } from '../../keyboards/clientKeyboards.js';
import { getUnlinkedMenuKeyboard } from '../../keyboards/commonKeyboards.js';

export const handleMenuCommand = async (ctx: Context): Promise<any> => {
  try {
    const chatId = ctx.chat?.id.toString();
    if (!chatId) return;

    const user = await User.findOne({ telegramChatId: chatId });
    if (!user) {
      return ctx.reply('⚠️ Account not linked. Link your account to access your menu.', getUnlinkedMenuKeyboard());
    }

    const menuKb = user.role === 'admin' ? getAdminMenuKeyboard() : getClientMenuKeyboard();
    return ctx.reply(
      user.role === 'admin' ? '⚡ <b>Alpha Cut Admin ERP Menu</b>' : '🎬 <b>Alpha Cut Client Control Menu</b>',
      { parse_mode: 'HTML', ...menuKb }
    );
  } catch (err: any) {
    console.error('[BOT MENU COMMAND ERROR]:', err.message);
  }
};
