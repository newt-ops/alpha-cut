import { Context, Markup } from 'telegraf';
import { User } from '../../models/User.js';
import { Project } from '../../models/Project.js';
import { Contract } from '../../models/Contract.js';
import { getAdminMenuKeyboard } from '../keyboards/adminKeyboards.js';
import { getUnlinkedMenuKeyboard } from '../keyboards/commonKeyboards.js';
import { MINI_APP_URL } from '../config/commands.js';

export const handleProjectsCommand = async (ctx: Context): Promise<any> => {
  try {
    await ctx.sendChatAction('typing');
    const chatId = ctx.chat?.id.toString();
    if (!chatId) return;
    const user = await User.findOne({ telegramChatId: chatId });
    if (!user) return ctx.reply('⚠️ Please link your account first.', getUnlinkedMenuKeyboard());

    if (user.role === 'admin') {
      return ctx.reply('⚡ <b>Use Admin ERP Command Menu to view all client projects and retainers.</b>', {
        parse_mode: 'HTML',
        ...getAdminMenuKeyboard(),
      });
    }

    const projects = await Project.find({ clientId: user._id }).sort({ createdAt: -1 });
    const contracts = await Contract.find({ clientId: user._id }).sort({ createdAt: -1 });

    if (projects.length === 0 && contracts.length === 0) {
      return ctx.reply('ℹ️ You currently have no proposals or retainer contracts created.', {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([
          [Markup.button.webApp('🚀 Request Project in Mini App', MINI_APP_URL)],
          [Markup.button.callback('⬅️ Back to Menu', 'menu:main')],
        ]),
      });
    }

    let msg = `📋 <b>YOUR ACTIVE PROJECTS & RETAINER CONTRACTS (${projects.length + contracts.length})</b>\n\n`;

    if (contracts.length > 0) {
      msg += `<b>📦 RETAINER CONTRACTS:</b>\n`;
      contracts.forEach((c, idx) => {
        msg += `${idx + 1}. <b>${c.packageTier?.toUpperCase()} (${c.frequency})</b>\n` +
          `   Rate: <b>${c.monthlyPrice} ${c.currency}/mo</b> | Status: <b>${c.status.toUpperCase()}</b>\n\n`;
      });
    }

    if (projects.length > 0) {
      msg += `<b>🎬 VIDEO PROJECTS:</b>\n`;
      projects.forEach((p, idx) => {
        msg += `${idx + 1}. <b>${p.editingStyle}</b> [${p.status.toUpperCase()}]\n` +
          `   Rate: <b>${p.price} ${p.currency}</b> | Deadline: ${new Date(p.deadline).toLocaleDateString()}\n\n`;
      });
    }

    ctx.reply(msg, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [Markup.button.webApp('🚀 Open Mini App Workspace', MINI_APP_URL)],
        [Markup.button.callback('⬅️ Back to Menu', 'menu:main')],
      ]),
    });
  } catch (err: any) {
    console.error('[BOT PROJECTS COMMAND ERROR]:', err.message);
  }
};
