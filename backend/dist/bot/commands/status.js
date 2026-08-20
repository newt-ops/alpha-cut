import { Markup } from 'telegraf';
import { User } from '../../models/User.js';
import { Project } from '../../models/Project.js';
import { Contract } from '../../models/Contract.js';
import { getAdminMenuKeyboard } from '../keyboards/adminKeyboards.js';
import { getClientMenuKeyboard } from '../keyboards/clientKeyboards.js';
import { getUnlinkedMenuKeyboard } from '../keyboards/commonKeyboards.js';
import { getUnicodeProgressBar } from '../notifications/statusCards.js';
import { MINI_APP_URL } from '../config/commands.js';
export const handleStatusCommand = async (ctx) => {
    try {
        await ctx.sendChatAction('typing');
        const chatId = ctx.chat?.id.toString();
        if (!chatId)
            return;
        const user = await User.findOne({ telegramChatId: chatId });
        if (!user)
            return ctx.reply('⚠️ Please link your account first to check status.', getUnlinkedMenuKeyboard());
        if (user.role === 'admin') {
            const activeProposals = await Project.countDocuments({ status: 'proposal_sent' });
            const activeProjects = await Project.countDocuments({ status: 'in_progress' });
            const activeContracts = await Contract.countDocuments({ status: 'active' });
            return ctx.reply(`⚡ <b>AGENCY OVERVIEW SNAPSHOT:</b>\n\n` +
                `• Pending Client Proposals: <b>${activeProposals}</b>\n` +
                `• In-Progress Edits: <b>${activeProjects}</b>\n` +
                `• Active Retainer Contracts: <b>${activeContracts}</b>`, { parse_mode: 'HTML', ...getAdminMenuKeyboard() });
        }
        const project = await Project.findOne({ clientId: user._id }).sort({ updatedAt: -1 });
        const contract = await Contract.findOne({ clientId: user._id }).sort({ updatedAt: -1 });
        if (!project && !contract) {
            return ctx.reply('ℹ️ You currently have no active video projects or retainer contracts.', getClientMenuKeyboard());
        }
        let msg = `📊 <b>LIVE ACTION STATUS DASHBOARD</b>\n\n`;
        if (contract) {
            const contractObj = contract;
            const approvedCount = contractObj.deliverables?.filter((d) => d.status === 'approved').length || 0;
            const totalCount = contract.totalVideosPlanned || contractObj.deliverables?.length || 0;
            const pct = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;
            msg += `📦 <b>RETAINER CONTRACT:</b>\n` +
                `• Tier: <b>${contract.packageTier?.toUpperCase()} (${contract.frequency})</b>\n` +
                `• Investment: <b>${contract.monthlyPrice} ${contract.currency} / month</b>\n` +
                `• Progress: <code>[${approvedCount}/${totalCount} Approved - ${pct}%]</code>\n` +
                `• Status: <b>${contract.status.toUpperCase()}</b>\n\n`;
        }
        if (project) {
            const deadlineDate = project.deadline ? new Date(project.deadline) : null;
            const daysLeft = deadlineDate ? Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
            msg += `🎬 <b>LATEST PROJECT EDIT:</b>\n` +
                `• Style: <b>${project.editingStyle}</b>\n` +
                `• Tier: <b>${project.packageTier?.toUpperCase()} (${project.contentLength?.toUpperCase()})</b>\n` +
                `• Status Progress: <code>${getUnicodeProgressBar(project.status)}</code>\n` +
                `• Price: <b>${project.price} ${project.currency}</b>\n` +
                `• Deadline: <b>${deadlineDate ? deadlineDate.toLocaleDateString() : 'TBD'}</b> ${daysLeft !== null ? `(${daysLeft > 0 ? `${daysLeft} days remaining` : 'Due today/overdue'})` : ''}\n` +
                `• Revisions: <b>${project.revisionCount || 0} requested</b>\n\n`;
        }
        const actionParam = project ? `proposal_${project._id}` : `contract_${contract._id}`;
        ctx.reply(msg, {
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard([
                [Markup.button.webApp('🚀 Launch Mini App Workspace', `${MINI_APP_URL}?startapp=${actionParam}`)],
                [Markup.button.callback('⬅️ Back to Menu', 'menu:main')],
            ]),
        });
    }
    catch (err) {
        console.error('[BOT STATUS COMMAND ERROR]:', err.message);
    }
};
