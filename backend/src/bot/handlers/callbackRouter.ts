import { Markup, Context } from 'telegraf';
import { User } from '../../models/User.js';
import { Project } from '../../models/Project.js';
import { Contract } from '../../models/Contract.js';
import { getAdminMenuKeyboard } from '../keyboards/adminKeyboards.js';
import { getClientMenuKeyboard, getClientPackageKeyboard, getClientStylesPaginationKeyboard } from '../keyboards/clientKeyboards.js';
import { getUnlinkedMenuKeyboard, getSupportKeyboard } from '../keyboards/commonKeyboards.js';
import { handleUnlinkCommand } from '../features/onboarding/onboarding.commands.js';
import { buildPackagesMessage, buildStylesMessage } from '../features/packages/packages.commands.js';
import { CLIENT_URL, MINI_APP_URL } from '../config/commands.js';

const safeEditMessageText = async (ctx: Context, text: string, extra?: any): Promise<any> => {
  try {
    return await ctx.editMessageText(text, extra);
  } catch (err: any) {
    if (err.message && err.message.includes('message is not modified')) {
      return;
    }
    throw err;
  }
};

export const handleCallbackQuery = async (ctx: Context): Promise<any> => {
  const cbQuery = ctx.callbackQuery as any;
  const data: string = cbQuery?.data;
  if (!data) return;

  try {
    await ctx.answerCbQuery();
    const chatId = ctx.chat?.id.toString();
    const user = chatId ? await User.findOne({ telegramChatId: chatId }) : null;

    if (data === 'unlink_account') {
      return handleUnlinkCommand(ctx);
    }

    if (data === 'menu:main') {
      const menuKb = user?.role === 'admin' ? getAdminMenuKeyboard() : getClientMenuKeyboard();
      return safeEditMessageText(
        ctx,
        user?.role === 'admin' ? '⚡ <b>Alpha Cut Admin ERP Menu</b>' : '🎬 <b>Alpha Cut Client Control Menu</b>',
        { parse_mode: 'HTML', ...menuKb }
      );
    }

    if (data === 'menu:support') {
      return safeEditMessageText(
        ctx,
        `💬 <b>ALPHA CUT SUPPORT & INQUIRIES</b>\n\n` +
          `Need help with a project or have custom retainer requirements?\n\n` +
          `• <b>Email:</b> <code>alphacutagency@gmail.com</code>\n` +
          `• <b>Founders:</b> Amir & Aymen\n` +
          `• <b>Web Platform:</b> ${CLIENT_URL}`,
        { parse_mode: 'HTML', ...getSupportKeyboard() }
      );
    }

    if (data.startsWith('admin_menu:')) {
      if (!user || user.role !== 'admin') {
        return safeEditMessageText(ctx, '⚠️ <b>Access Denied:</b> This action requires Administrator privileges.', {
          parse_mode: 'HTML',
          ...getUnlinkedMenuKeyboard(),
        });
      }

      if (data === 'admin_menu:proposals') {
        const pendingProposals = await Project.find({ status: 'proposal_sent' }).sort({ createdAt: -1 });
        if (pendingProposals.length === 0) {
          return safeEditMessageText(ctx, 'ℹ️ No pending client proposals currently awaiting review.', {
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back to Admin Menu', 'menu:main')]]),
          });
        }

        let msg = `📋 <b>PENDING PROPOSALS AWAITING CLIENT RESPONSE (${pendingProposals.length}):</b>\n\n`;
        pendingProposals.forEach((p, idx) => {
          msg += `${idx + 1}. <b>${p.editingStyle}</b> (${p.clientName})\n   Rate: <b>${p.price} ${p.currency}</b> | Deadline: ${new Date(p.deadline).toLocaleDateString()}\n\n`;
        });

        return safeEditMessageText(ctx, msg, {
          parse_mode: 'HTML',
          ...Markup.inlineKeyboard([
            [Markup.button.url('🚀 Manage in Admin Portal', `${CLIENT_URL}/admin`)],
            [Markup.button.callback('⬅️ Back to Admin Menu', 'menu:main')],
          ]),
        });
      }

      if (data === 'admin_menu:contracts') {
        const activeContracts = await Contract.find({ status: 'active' }).sort({ createdAt: -1 });
        if (activeContracts.length === 0) {
          return safeEditMessageText(ctx, 'ℹ️ No active retainer contracts currently running.', {
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back to Admin Menu', 'menu:main')]]),
          });
        }

        let msg = `📦 <b>ACTIVE RETAINER CONTRACTS (${activeContracts.length}):</b>\n\n`;
        activeContracts.forEach((c, idx) => {
          msg += `${idx + 1}. <b>${c.clientName}</b> (${c.packageTier?.toUpperCase()})\n   Rate: <b>${c.monthlyPrice} ${c.currency}/mo</b> (${c.frequency})\n\n`;
        });

        return safeEditMessageText(ctx, msg, {
          parse_mode: 'HTML',
          ...Markup.inlineKeyboard([
            [Markup.button.url('🚀 Manage Retainers in Admin Portal', `${CLIENT_URL}/admin`)],
            [Markup.button.callback('⬅️ Back to Admin Menu', 'menu:main')],
          ]),
        });
      }

      if (data === 'admin_menu:stats' || data === 'admin_menu:activity') {
        const totalClients = await User.countDocuments({ role: 'client' });
        const inProgressCount = await Project.countDocuments({ status: 'in_progress' });
        const deliveredCount = await Project.countDocuments({ status: 'delivered' });
        const completedCount = await Project.countDocuments({ status: 'completed' });

        const msg =
          `📊 <b>AGENCY FINANCIAL & OPERATIONAL STATS</b>\n\n` +
          `• <b>Registered Clients:</b> ${totalClients}\n` +
          `• <b>Active In-Progress Edits:</b> ${inProgressCount}\n` +
          `• <b>Renders Delivered:</b> ${deliveredCount}\n` +
          `• <b>Projects Completed:</b> ${completedCount}\n\n` +
          `<i>Open your Web Admin Portal for detailed revenue charts and client CRM.</i>`;

        return safeEditMessageText(ctx, msg, {
          parse_mode: 'HTML',
          ...Markup.inlineKeyboard([
            [Markup.button.url('🚀 Open Admin ERP Dashboard', `${CLIENT_URL}/admin`)],
            [Markup.button.callback('⬅️ Back to Admin Menu', 'menu:main')],
          ]),
        });
      }
    }

    if (data === 'menu:work' || data === 'menu:projects') {
      if (!user) {
        return safeEditMessageText(ctx, '⚠️ Please link your account first to track work.', {
          parse_mode: 'HTML',
          ...getUnlinkedMenuKeyboard(),
        });
      }

      const projects = await Project.find({ clientId: user._id }).sort({ createdAt: -1 });
      const contracts = await Contract.find({ clientId: user._id }).sort({ createdAt: -1 });

      if (projects.length === 0 && contracts.length === 0) {
        return safeEditMessageText(ctx, 'ℹ️ You have no project proposals or retainer contracts yet.', {
          parse_mode: 'HTML',
          ...Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back to Menu', 'menu:main')]]),
        });
      }

      let msg = `📊 <b>Your Active Work & Retainer Contracts:</b>\n\n`;
      contracts.forEach((c) => {
        msg += `📦 <b>Retainer: ${c.packageTier?.toUpperCase()} (${c.frequency})</b>\n   Status: <b>${c.status.toUpperCase()}</b> | Monthly: ${c.monthlyPrice} ${c.currency}\n\n`;
      });

      projects.slice(0, 5).forEach((p) => {
        msg += `🎬 <b>${p.editingStyle}</b> [${p.status.toUpperCase()}]\n   Terms: ${p.price} ${p.currency}\n\n`;
      });

      return safeEditMessageText(ctx, msg, {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([
          [Markup.button.webApp('🚀 Open Mini App Workspace', MINI_APP_URL)],
          [Markup.button.callback('⬅️ Back to Menu', 'menu:main')],
        ]),
      });
    }

    if (data.startsWith('toggle_details_proj_')) {
      const projId = data.replace('toggle_details_proj_', '');
      const project = await Project.findById(projId);
      if (!project) return;

      if (user?.role !== 'admin' && project.clientId.toString() !== user?._id.toString()) {
        return;
      }

      const isShowingBrief = (cbQuery?.message?.text || '').includes('Reference Brief Notes:');
      let updatedText = '';

      if (!isShowingBrief) {
        updatedText =
          `🎬 <b>PROJECT PROPOSAL SUMMARY</b>\n\n` +
          `Style: <b>${project.editingStyle}</b>\n` +
          `Tier: <b>${project.packageTier?.toUpperCase()} (${project.contentLength?.toUpperCase()})</b>\n` +
          `Rate: <b>${project.price} ${project.currency}</b>\n` +
          `Deadline: <b>${new Date(project.deadline).toLocaleDateString()}</b>\n\n` +
          `<b>Reference Brief Notes:</b>\n<i>${project.referenceBrief || 'No specific notes attached.'}</i>`;
      } else {
        updatedText =
          `🎬 <b>NEW PROJECT PROPOSAL RECEIVED</b>\n\n` +
          `Style: <b>${project.editingStyle}</b>\n` +
          `Tier: <b>${project.packageTier?.toUpperCase()} (${project.contentLength?.toUpperCase()})</b>\n` +
          `Rate: <b>${project.price} ${project.currency}</b>\n` +
          `Deadline: <b>${new Date(project.deadline).toLocaleDateString()}</b>`;
      }

      const keyboard = Markup.inlineKeyboard([
        [
          Markup.button.callback(isShowingBrief ? '🔍 See Details' : '🙈 Hide Details', `toggle_details_proj_${project._id}`),
          Markup.button.webApp('🚀 Open & Respond', `${MINI_APP_URL}?startapp=proposal_${project._id}`),
        ],
        [Markup.button.callback('⬅️ Back to Menu', 'menu:main')],
      ]);

      return safeEditMessageText(ctx, updatedText, { parse_mode: 'HTML', ...keyboard });
    }

    if (data.startsWith('menu:packages') || data.startsWith('packages:currency:')) {
      const curr = data.includes('currency:usd') ? 'USD' : 'ETB';
      const msgText = await buildPackagesMessage(curr);
      return safeEditMessageText(ctx, msgText, {
        parse_mode: 'HTML',
        ...getClientPackageKeyboard(curr),
      });
    }

    if (data.startsWith('menu:styles:')) {
      const pageIdx = parseInt(data.split(':')[2] || '0', 10);
      const { msgText, safePageIdx, totalPages } = buildStylesMessage(pageIdx);
      return safeEditMessageText(ctx, msgText, {
        parse_mode: 'HTML',
        ...getClientStylesPaginationKeyboard(safePageIdx, totalPages),
      });
    }

    if (data === 'menu:about') {
      const msg =
        `⚡ <b>ALPHA CUT EXECUTIVE VIDEO AGENCY</b>\n\n` +
        `We partner with tech creators, startup founders, and high-growth brands to deliver high-retention video edits.\n\n` +
        `• <b>Founders:</b> Amir & Aymen\n` +
        `• <b>Email:</b> <code>alphacutagency@gmail.com</code>\n` +
        `• <b>Web Platform:</b> ${CLIENT_URL}`;

      return safeEditMessageText(ctx, msg, {
        parse_mode: 'HTML',
        ...getSupportKeyboard(),
      });
    }
  } catch (err: any) {
    console.error('[BOT CALLBACK ROUTER ERROR]:', err.message);
  }
};
