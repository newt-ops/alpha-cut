import { User } from '../../models/User.js';
import { getAdminMenuKeyboard } from '../keyboards/adminKeyboards.js';
import { getClientMenuKeyboard } from '../keyboards/clientKeyboards.js';

export const handleMenuCommand = async (ctx) => {
  try {
    await ctx.sendChatAction('typing');
    const chatId = ctx.chat.id.toString();
    const user = await User.findOne({ telegramChatId: chatId });

    if (user?.role === 'admin') {
      return ctx.reply('⚡ <b>Alpha Cut Admin ERP Command Menu</b>', { parse_mode: 'HTML', ...getAdminMenuKeyboard() });
    }

    ctx.reply('🎬 <b>Alpha Cut Client Control Menu</b>', { parse_mode: 'HTML', ...getClientMenuKeyboard() });
  } catch (err) {
    console.error('[BOT MENU ERROR]:', err.message);
  }
};
