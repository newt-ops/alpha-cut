import { Markup } from 'telegraf';
import { User } from '../../../models/User.js';
import { Project } from '../../../models/Project.js';
import { Contract } from '../../../models/Contract.js';
import { getUnlinkedMenuKeyboard } from '../../keyboards/commonKeyboards.js';
import { MINI_APP_URL } from '../../config/commands.js';
export const handleProjectsCommand = async (ctx) => {
    try {
        const chatId = ctx.chat?.id.toString();
        if (!chatId)
            return;
        const user = await User.findOne({ telegramChatId: chatId });
        if (!user) {
            return ctx.reply('⚠️ Please link your account first to view your projects.', getUnlinkedMenuKeyboard());
        }
        const isClient = user.role === 'client';
        const filter = isClient ? { clientId: user._id } : {};
        const projects = await Project.find(filter).sort({ createdAt: -1 }).limit(5);
        if (projects.length === 0) {
            return ctx.reply('ℹ️ You have no active video editing projects.', {
                ...Markup.inlineKeyboard([[Markup.button.webApp('🚀 Open Mini App Workspace', MINI_APP_URL)]]),
            });
        }
        let msg = `🎬 <b>YOUR VIDEO PROJECTS (${projects.length}):</b>\n\n`;
        projects.forEach((p, idx) => {
            msg += `${idx + 1}. <b>${p.editingStyle}</b> [${p.status.toUpperCase()}]\n`;
            msg += `   Rate: <b>${p.price} ${p.currency}</b> | Deadline: ${new Date(p.deadline).toLocaleDateString()}\n`;
            if (p.deliverableUrl) {
                msg += `   🎬 Deliverable: ${p.deliverableUrl}\n`;
            }
            msg += `\n`;
        });
        return ctx.reply(msg, {
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard([[Markup.button.webApp('🚀 Open Mini App Workspace', MINI_APP_URL)]]),
        });
    }
    catch (err) {
        console.error('[BOT PROJECTS COMMAND ERROR]:', err.message);
    }
};
export const handleStatusCommand = async (ctx) => {
    try {
        const chatId = ctx.chat?.id.toString();
        if (!chatId)
            return;
        const user = await User.findOne({ telegramChatId: chatId });
        if (!user) {
            return ctx.reply('⚠️ Account not linked. Use <code>/link [code]</code> to connect.', {
                parse_mode: 'HTML',
                ...getUnlinkedMenuKeyboard(),
            });
        }
        const inProgressCount = await Project.countDocuments({
            clientId: user._id,
            status: { $in: ['in_progress', 'revision_requested'] },
        });
        const deliveredCount = await Project.countDocuments({ clientId: user._id, status: 'delivered' });
        const activeContracts = await Contract.countDocuments({ clientId: user._id, status: 'active' });
        const msg = `📊 <b>ACCOUNT STATUS SUMMARY</b>\n\n` +
            `• <b>Client:</b> ${user.name}\n` +
            `• <b>Active In-Progress Edits:</b> ${inProgressCount}\n` +
            `• <b>Renders Ready for Review:</b> ${deliveredCount}\n` +
            `• <b>Active Retainers:</b> ${activeContracts}\n\n` +
            `<i>Tap below to open your native control panel inside Telegram.</i>`;
        return ctx.reply(msg, {
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard([[Markup.button.webApp('⚡ Open Control Panel', MINI_APP_URL)]]),
        });
    }
    catch (err) {
        console.error('[BOT STATUS COMMAND ERROR]:', err.message);
    }
};
