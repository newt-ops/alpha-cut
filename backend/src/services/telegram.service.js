import { Telegraf, Markup } from 'telegraf';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { PendingLink } from '../models/PendingLink.js';
import { Project } from '../models/Project.js';
import { Contract } from '../models/Contract.js';
import { Deliverable } from '../models/Deliverable.js';
import { PackageConfig } from '../models/PackageConfig.js';
import { EDITING_STYLES } from '../constants/editingStyles.js';

export const bot = config.telegramBotToken ? new Telegraf(config.telegramBotToken) : null;

const CLIENT_URL = process.env.CLIENT_URL || 'https://alpha-cut-nine.vercel.app';
const MINI_APP_URL = `${CLIENT_URL}/app`;

export const sendTelegramNotification = async (chatId, text) => {
  if (!bot || !chatId) return;
  try {
    await bot.telegram.sendMessage(chatId, text, { parse_mode: 'HTML' });
  } catch (err) {
    console.error('Failed to send Telegram notification:', err.message);
  }
};

// Format Progress Bar using Unicode Blocks
export const getUnicodeProgressBar = (status) => {
  switch (status) {
    case 'proposal_sent':
      return '[■□□□] 25% (Proposal Sent)';
    case 'in_progress':
      return '[■■□□] 50% (In Progress)';
    case 'delivered':
      return '[■■■□] 85% (Work Delivered)';
    case 'completed':
      return '[■■■■] 100% (Completed)';
    case 'declined':
      return '[□□□□] Declined';
    default:
      return '[■□□□] Pending';
  }
};

// Inline Keyboards
export const getAdminMenuKeyboard = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback('📋 Pending Proposals', 'admin_menu:proposals')],
    [Markup.button.callback('📦 Active Retainer Contracts', 'admin_menu:contracts')],
    [Markup.button.callback('🔔 Recent Agency Activity', 'admin_menu:activity')],
    [Markup.button.url('🚀 Open Admin ERP Portal', `${CLIENT_URL}/admin`)],
    [Markup.button.callback('❌ Disconnect Account', 'unlink_account')],
  ]);
};

export const getClientMenuKeyboard = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback('📊 Track My Work', 'menu:work')],
    [Markup.button.callback('📦 Packages & Pricing', 'menu:packages')],
    [Markup.button.callback('🎬 Signature Editing Styles', 'menu:styles:0')],
    [Markup.button.callback('⚡ About Alpha Cut', 'menu:about')],
    [Markup.button.webApp('🚀 Open Mini App Workspace', MINI_APP_URL)],
    [Markup.button.callback('❌ Disconnect Account', 'unlink_account')],
  ]);
};

export const getUnlinkedMenuKeyboard = () => {
  return Markup.inlineKeyboard([
    [Markup.button.webApp('🚀 Open Workspace & Connect', MINI_APP_URL)],
    [Markup.button.url('🌐 Visit Website', CLIENT_URL)],
  ]);
};

if (bot) {
  // Register Command Menu & Corner Menu Button on Launch
  (async () => {
    try {
      await bot.telegram.setMyCommands([
        { command: 'start', description: 'Launch bot & main menu' },
        { command: 'menu', description: 'Open role-based control menu' },
        { command: 'status', description: 'Check live active work status' },
        { command: 'projects', description: 'View all video projects & contracts' },
        { command: 'packages', description: 'View pricing & rate ranges' },
        { command: 'styles', description: 'Browse signature editing styles' },
        { command: 'about', description: 'About Alpha Cut Agency' },
        { command: 'help', description: 'Get help and instructions' },
      ]);

      await bot.telegram.setChatMenuButton({
        type: 'web_app',
        text: 'Open Alpha Cut',
        web_app: { url: MINI_APP_URL },
      });
      console.log('Telegraf bot commands and WebApp menu button initialized.');
    } catch (err) {
      console.error('Failed to set Telegraf commands/menu button:', err.message);
    }
  })();

  // Handler: /start
  bot.command('start', async (ctx) => {
    try {
      await ctx.sendChatAction('typing');
      const payload = ctx.message.text.split(' ')[1];
      const chatId = ctx.chat.id.toString();

      if (payload) {
        const existingBoundUser = await User.findOne({ telegramChatId: chatId });

        const pending = await PendingLink.findOne({
          token: payload,
          type: 'deep_link',
          used: false,
          expiresAt: { $gt: new Date() },
        });

        if (!pending) {
          return ctx.reply('⚠️ Link token is invalid or expired. Please generate a new link in your Alpha Cut dashboard.');
        }

        const user = await User.findById(pending.userId);
        if (!user) {
          return ctx.reply('⚠️ User account not found.');
        }

        if (existingBoundUser && existingBoundUser._id.toString() !== user._id.toString()) {
          return ctx.reply(
            `⚠️ Link Rejected: This Telegram account is already linked to another user (${existingBoundUser.email}).`
          );
        }

        user.telegramChatId = chatId;
        user.telegramLinkedAt = new Date();
        await user.save();

        pending.used = true;
        await pending.save();

        const menuKb = user.role === 'admin' ? getAdminMenuKeyboard() : getClientMenuKeyboard();
        return ctx.reply(
          `🎉 <b>Account Linked Successfully!</b>\n\nWelcome <b>${user.name}</b> (${user.role.toUpperCase()}). Your Telegram account is connected to Alpha Cut Executive ERP.`,
          { parse_mode: 'HTML', ...menuKb }
        );
      }

      const existingUser = await User.findOne({ telegramChatId: chatId });
      if (existingUser) {
        const menuKb = existingUser.role === 'admin' ? getAdminMenuKeyboard() : getClientMenuKeyboard();
        return ctx.reply(
          `🎬 <b>Welcome back, ${existingUser.name}!</b>\n\nUse your role-based menu below to manage projects, review work, or launch the Mini App.`,
          { parse_mode: 'HTML', ...menuKb }
        );
      }

      ctx.reply(
        `🎬 <b>Welcome to Alpha Cut Control Center</b>\n\n` +
          `High-impact video editing agency for short-form, viral breakdowns, and retainer contracts.\n\n` +
          `<b>To link your account:</b>\n` +
          `1. Open our web platform or Mini App\n` +
          `2. Enter your 6-digit code using <code>/link 123456</code>`,
        { parse_mode: 'HTML', ...getUnlinkedMenuKeyboard() }
      );
    } catch (err) {
      console.error('Telegram start error:', err.message);
    }
  });

  // Handler: /menu — Role-Based Menu Branching
  bot.command('menu', async (ctx) => {
    await ctx.sendChatAction('typing');
    const chatId = ctx.chat.id.toString();
    const user = await User.findOne({ telegramChatId: chatId });

    if (user?.role === 'admin') {
      return ctx.reply('⚡ <b>Alpha Cut Admin ERP Command Menu</b>', { parse_mode: 'HTML', ...getAdminMenuKeyboard() });
    }

    ctx.reply('🎬 <b>Alpha Cut Client Control Menu</b>', { parse_mode: 'HTML', ...getClientMenuKeyboard() });
  });

  // Handler: /status
  bot.command('status', async (ctx) => {
    await ctx.sendChatAction('typing');
    const chatId = ctx.chat.id.toString();
    const user = await User.findOne({ telegramChatId: chatId });
    if (!user) return ctx.reply('⚠️ Please link your account first.', getUnlinkedMenuKeyboard());

    if (user.role === 'admin') {
      const activeProposals = await Project.countDocuments({ status: 'proposal_sent' });
      const activeContracts = await Contract.countDocuments({ status: 'active' });
      return ctx.reply(
        `⚡ <b>AGENCY OVERVIEW SNAPSHOT:</b>\n\n` +
          `• Pending Client Proposals: <b>${activeProposals}</b>\n` +
          `• Active Retainer Contracts: <b>${activeContracts}</b>`,
        { parse_mode: 'HTML', ...getAdminMenuKeyboard() }
      );
    }

    const project = await Project.findOne({ clientId: user._id }).sort({ updatedAt: -1 });
    if (!project) return ctx.reply('ℹ️ You currently have no active video projects.', getClientMenuKeyboard());

    const msg = `📊 <b>Latest Project Status:</b>\n\n` +
      `Style: <b>${project.editingStyle}</b>\n` +
      `Progress: <code>${getUnicodeProgressBar(project.status)}</code>\n` +
      `Price: <b>${project.price} ${project.currency}</b>\n` +
      `Deadline: ${new Date(project.deadline).toLocaleDateString()}`;

    ctx.reply(msg, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [Markup.button.webApp('🚀 Open App to Review', `${MINI_APP_URL}?startapp=proposal_${project._id}`)],
        [Markup.button.callback('⬅️ Back to Menu', 'menu:main')],
      ]),
    });
  });

  // Handler: /projects
  bot.command('projects', async (ctx) => {
    const chatId = ctx.chat.id.toString();
    const user = await User.findOne({ telegramChatId: chatId });
    const menuKb = user?.role === 'admin' ? getAdminMenuKeyboard() : getClientMenuKeyboard();
    ctx.reply('📊 <b>Fetching active work and retainer contracts...</b>', { parse_mode: 'HTML', ...menuKb });
  });

  bot.command('packages', async (ctx) => {
    ctx.reply('📦 <b>Fetching package rates...</b>', { parse_mode: 'HTML', ...getClientMenuKeyboard() });
  });

  bot.command('styles', async (ctx) => {
    ctx.reply('🎬 <b>Signature Editing Styles:</b>', { parse_mode: 'HTML', ...getClientMenuKeyboard() });
  });

  bot.command('about', async (ctx) => {
    ctx.reply('⚡ <b>Alpha Cut Agency</b> — Retention-driven video editing.', { parse_mode: 'HTML', ...getClientMenuKeyboard() });
  });

  bot.command('help', async (ctx) => {
    ctx.reply(
      `ℹ️ <b>Alpha Cut Bot Help & Commands:</b>\n\n` +
        `/menu — Role-Based Control Menu\n` +
        `/status — Active work status card\n` +
        `/projects — List projects & retainer contracts\n` +
        `/packages — Inspect package rates\n` +
        `/styles — Signature editing styles\n` +
        `/unlink — Disconnect account`,
      { parse_mode: 'HTML', ...getClientMenuKeyboard() }
    );
  });

  // Handler: /link <code>
  bot.command('link', async (ctx) => {
    try {
      const parts = ctx.message.text.split(' ');
      const code = parts[1];
      const chatId = ctx.chat.id.toString();

      if (!code) {
        return ctx.reply('Please provide your 6-digit code. Example: <code>/link 123456</code>', { parse_mode: 'HTML' });
      }

      const existingBoundUser = await User.findOne({ telegramChatId: chatId });
      const pending = await PendingLink.findOne({ code, type: 'code', used: false, expiresAt: { $gt: new Date() } });

      if (!pending) {
        return ctx.reply('⚠️ Invalid or expired code. Generate a new code in your dashboard.');
      }

      const user = await User.findById(pending.userId);
      if (!user) return ctx.reply('⚠️ User account not found.');

      if (existingBoundUser && existingBoundUser._id.toString() !== user._id.toString()) {
        return ctx.reply(`⚠️ Link Rejected: Account already linked to ${existingBoundUser.email}.`);
      }

      user.telegramChatId = chatId;
      user.telegramLinkedAt = new Date();
      await user.save();

      pending.used = true;
      await pending.save();

      const menuKb = user.role === 'admin' ? getAdminMenuKeyboard() : getClientMenuKeyboard();
      ctx.reply(`🎉 <b>Account Linked Successfully!</b>\n\nConnected to <b>${user.name}</b> (${user.role.toUpperCase()}).`, {
        parse_mode: 'HTML',
        ...menuKb,
      });
    } catch (err) {
      console.error('Telegram link error:', err.message);
    }
  });

  // Handler: /unlink & Action: unlink_account
  const handleUnlink = async (ctx) => {
    try {
      const chatId = ctx.chat.id.toString();
      const user = await User.findOne({ telegramChatId: chatId });
      if (!user) return ctx.reply('⚠️ Account is not linked.', getUnlinkedMenuKeyboard());

      user.telegramChatId = null;
      user.telegramLinkedAt = null;
      await user.save();

      ctx.reply('ℹ️ <b>Telegram Account Disconnected.</b>', { parse_mode: 'HTML', ...getUnlinkedMenuKeyboard() });
    } catch (err) {
      console.error('Telegram unlink error:', err.message);
    }
  };

  bot.command('unlink', handleUnlink);
  bot.action('unlink_account', async (ctx) => {
    await ctx.answerCbQuery();
    await handleUnlink(ctx);
  });

  // Callback Query Handling
  bot.on('callback_query', async (ctx) => {
    const data = ctx.callbackQuery.data;
    if (!data) return;

    try {
      await ctx.answerCbQuery();
      const chatId = ctx.chat.id.toString();
      const user = await User.findOne({ telegramChatId: chatId });

      if (data === 'menu:main') {
        const menuKb = user?.role === 'admin' ? getAdminMenuKeyboard() : getClientMenuKeyboard();
        return ctx.editMessageText(
          user?.role === 'admin' ? '⚡ <b>Alpha Cut Admin ERP Menu</b>' : '🎬 <b>Alpha Cut Client Control Menu</b>',
          { parse_mode: 'HTML', ...menuKb }
        );
      }

      // Admin Callback Router
      if (data === 'admin_menu:proposals') {
        const pendingProposals = await Project.find({ status: 'proposal_sent' }).sort({ createdAt: -1 });
        if (pendingProposals.length === 0) {
          return ctx.editMessageText('ℹ️ No pending client proposals currently awaiting review.', {
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back to Admin Menu', 'menu:main')]]),
          });
        }

        let msg = `📋 <b>PENDING PROPOSALS AWAITING CLIENT RESPONSE (${pendingProposals.length}):</b>\n\n`;
        pendingProposals.forEach((p, idx) => {
          msg += `${idx + 1}. <b>${p.editingStyle}</b> (${p.clientName})\n   Rate: <b>${p.price} ${p.currency}</b> | Deadline: ${new Date(p.deadline).toLocaleDateString()}\n\n`;
        });

        return ctx.editMessageText(msg, {
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
          return ctx.editMessageText('ℹ️ No active retainer contracts currently running.', {
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back to Admin Menu', 'menu:main')]]),
          });
        }

        let msg = `📦 <b>ACTIVE RETAINER CONTRACTS (${activeContracts.length}):</b>\n\n`;
        activeContracts.forEach((c, idx) => {
          msg += `${idx + 1}. <b>${c.clientName}</b> (${c.packageTier?.toUpperCase()})\n   Rate: <b>${c.monthlyPrice} ${c.currency}/mo</b> (${c.frequency})\n\n`;
        });

        return ctx.editMessageText(msg, {
          parse_mode: 'HTML',
          ...Markup.inlineKeyboard([
            [Markup.button.url('🚀 Manage Retainers in Admin Portal', `${CLIENT_URL}/admin`)],
            [Markup.button.callback('⬅️ Back to Admin Menu', 'menu:main')],
          ]),
        });
      }

      // Client Track Work Router
      if (data === 'menu:work' || data === 'menu:projects') {
        if (!user) {
          return ctx.editMessageText('⚠️ Please link your account first to track work.', {
            parse_mode: 'HTML',
            ...getUnlinkedMenuKeyboard(),
          });
        }

        const projects = await Project.find({ clientId: user._id }).sort({ createdAt: -1 });
        const contracts = await Contract.find({ clientId: user._id }).sort({ createdAt: -1 });

        if (projects.length === 0 && contracts.length === 0) {
          return ctx.editMessageText('ℹ️ You have no project proposals or retainer contracts yet.', {
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

        return ctx.editMessageText(msg, {
          parse_mode: 'HTML',
          ...Markup.inlineKeyboard([
            [Markup.button.webApp('🚀 Open Mini App Workspace', MINI_APP_URL)],
            [Markup.button.callback('⬅️ Back to Menu', 'menu:main')],
          ]),
        });
      }

      // Toggle In-Place Message Brief Details
      if (data.startsWith('toggle_details_proj_')) {
        const projId = data.replace('toggle_details_proj_', '');
        const project = await Project.findById(projId);
        if (!project) return;

        const isShowingBrief = ctx.callbackQuery.message.text.includes('Reference Brief:');
        let updatedText = '';

        if (!isShowingBrief) {
          updatedText = `🎬 <b>PROJECT PROPOSAL SUMMARY</b>\n\n` +
            `Style: <b>${project.editingStyle}</b>\n` +
            `Tier: <b>${project.packageTier?.toUpperCase()} (${project.contentLength?.toUpperCase()})</b>\n` +
            `Rate: <b>${project.price} ${project.currency}</b>\n` +
            `Deadline: <b>${new Date(project.deadline).toLocaleDateString()}</b>\n\n` +
            `<b>Reference Brief Notes:</b>\n<i>${project.referenceBrief || 'No specific notes attached.'}</i>`;
        } else {
          updatedText = `🎬 <b>NEW PROJECT PROPOSAL RECEIVED</b>\n\n` +
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

        return ctx.editMessageText(updatedText, { parse_mode: 'HTML', ...keyboard });
      }

      if (data.startsWith('menu:packages') || data.startsWith('packages:currency:')) {
        const curr = data.includes('currency:usd') ? 'USD' : 'ETB';
        const configs = await PackageConfig.find({});
        const basicConfig = configs.find((c) => c.tier === 'basic' && c.currency === 'ETB');
        const premiumConfig = configs.find((c) => c.tier === 'premium' && c.currency === 'ETB');

        const basicMin = basicConfig?.priceMin || 500;
        const basicMax = basicConfig?.priceMax || 800;
        const premMin = premiumConfig?.priceMin || 1600;
        const premMax = premiumConfig?.priceMax || 2400;

        let msg = `📦 <b>Alpha Cut — Package Pricing & Rates:</b>\n\n`;
        if (curr === 'ETB') {
          msg += `💎 <b>Basic Short-Form Tier:</b>\n` +
            `• Rate: <b>${basicMin} – ${basicMax} ETB</b> / video\n` +
            `• Clean captions, basic sound design, 1 revision.\n\n` +
            `💎 <b>Premium Short-Form Tier (Recommended):</b>\n` +
            `• Rate: <b>${premMin} – ${premMax} ETB</b> / video\n` +
            `• Kinetic typography, custom b-roll, motion graphics, 2 revisions.\n\n`;
        } else {
          msg += `💎 <b>International USD Rates:</b>\n` +
            `• Converted dynamically from live market rates.\n` +
            `• Contact <code>alphacutagency@gmail.com</code> for custom terms.\n\n`;
        }

        return ctx.editMessageText(msg, {
          parse_mode: 'HTML',
          ...Markup.inlineKeyboard([
            [
              Markup.button.callback(curr === 'ETB' ? '▶️ ETB Rates' : 'ETB Rates', 'packages:currency:etb'),
              Markup.button.callback(curr === 'USD' ? '▶️ USD Rates' : 'USD Rates', 'packages:currency:usd'),
            ],
            [Markup.button.webApp('🚀 Open Workspace in Mini App', MINI_APP_URL)],
            [Markup.button.callback('⬅️ Back to Menu', 'menu:main')],
          ]),
        });
      }

      if (data.startsWith('menu:styles:')) {
        const pageIdx = parseInt(data.split(':')[2] || '0', 10);
        const pageSize = 2;
        const totalPages = Math.ceil(EDITING_STYLES.length / pageSize);
        const currentStyles = EDITING_STYLES.slice(pageIdx * pageSize, (pageIdx + 1) * pageSize);

        let msg = `🎬 <b>Signature Editing Styles (${pageIdx + 1}/${totalPages}):</b>\n\n`;
        currentStyles.forEach((s) => {
          msg += `💎 <b>${s.name}</b>\n   Pacing: ${s.pacing} | Format: ${s.format}\n   <i>${s.description}</i>\n\n`;
        });

        const navRow = [];
        if (pageIdx > 0) navRow.push(Markup.button.callback('◀️ Prev', `menu:styles:${pageIdx - 1}`));
        if (pageIdx < totalPages - 1) navRow.push(Markup.button.callback('Next ▶️', `menu:styles:${pageIdx + 1}`));

        return ctx.editMessageText(msg, {
          parse_mode: 'HTML',
          ...Markup.inlineKeyboard([
            ...(navRow.length > 0 ? [navRow] : []),
            [Markup.button.webApp('🚀 Open Mini App Workspace', MINI_APP_URL)],
            [Markup.button.callback('⬅️ Back to Menu', 'menu:main')],
          ]),
        });
      }

      if (data === 'menu:about') {
        const msg = `⚡ <b>Alpha Cut Executive Video Agency</b>\n\n` +
          `We partner with tech creators, startup founders, and high-growth brands to deliver high-retention video edits.\n\n` +
          `• <b>Founders:</b> Amir & Aymen\n` +
          `• <b>Email:</b> <code>alphacutagency@gmail.com</code>\n` +
          `• <b>Web Platform:</b> ${CLIENT_URL}`;

        return ctx.editMessageText(msg, {
          parse_mode: 'HTML',
          ...Markup.inlineKeyboard([
            [Markup.button.webApp('🚀 Open Mini App Workspace', MINI_APP_URL)],
            [Markup.button.callback('⬅️ Back to Menu', 'menu:main')],
          ]),
        });
      }
    } catch (err) {
      console.error('Callback query error:', err.message);
    }
  });
}

// Live-Updating Status Card & Notification Helpers
export const sendProposalNotificationTelegram = async (project, clientChatId) => {
  if (!bot || !clientChatId) return;

  const msgText = `🎬 <b>NEW PROJECT PROPOSAL RECEIVED</b>\n\n` +
    `Style: <b>${project.editingStyle}</b>\n` +
    `Tier: <b>${project.packageTier?.toUpperCase()} (${project.contentLength?.toUpperCase()})</b>\n` +
    `Rate: <b>${project.price} ${project.currency}</b>\n` +
    `Deadline: <b>${new Date(project.deadline).toLocaleDateString()}</b>`;

  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.callback('🔍 See Details', `toggle_details_proj_${project._id}`),
      Markup.button.webApp('🚀 Open & Respond', `${MINI_APP_URL}?startapp=proposal_${project._id}`),
    ],
    [Markup.button.callback('⬅️ Main Menu', 'menu:main')],
  ]);

  try {
    const sentMsg = await bot.telegram.sendMessage(clientChatId, msgText, { parse_mode: 'HTML', ...keyboard });
    project.telegramStatusMessageId = sentMsg.message_id.toString();
    await project.save();
  } catch (err) {
    console.error('Failed to send proposal notification:', err.message);
  }
};

export const sendDeliveryNotificationTelegram = async (project, clientChatId) => {
  if (!bot || !clientChatId) return;

  const msgText = `🎉 <b>YOUR VIDEO EDIT IS DELIVERED & READY!</b>\n\n` +
    `Style: <b>${project.editingStyle}</b>\n` +
    `Rate: <b>${project.price} ${project.currency}</b>\n\n` +
    `Click below to launch your Mini App or visit the web platform to confirm delivery.`;

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.webApp('🚀 Open App to Confirm', `${MINI_APP_URL}?startapp=delivery_${project._id}`)],
    [Markup.button.url('🌐 Open Web Platform', CLIENT_URL)],
  ]);

  try {
    await bot.telegram.sendMessage(clientChatId, msgText, { parse_mode: 'HTML', ...keyboard });
  } catch (err) {
    console.error('Failed to send delivery notification:', err.message);
  }
};

export const updateTelegramStatusCard = async (project, clientChatId) => {
  if (!bot || !clientChatId) return;
  await sendProposalNotificationTelegram(project, clientChatId);
};

export const updateContractTelegramStatusCard = async (contract, clientChatId, deliveredCount = 0) => {
  if (!bot || !clientChatId) return;

  const pct = contract.totalVideosPlanned > 0
    ? Math.round((deliveredCount / contract.totalVideosPlanned) * 100)
    : 0;

  const statusText = `📦 <b>RETAINER CONTRACT STATUS CARD</b>\n\n` +
    `Tier: <b>${contract.packageTier?.toUpperCase()} (${contract.frequency})</b>\n` +
    `Monthly Investment: <b>${contract.monthlyPrice} ${contract.currency}</b>\n` +
    `Progress: <b>${deliveredCount}/${contract.totalVideosPlanned} Videos Delivered (${pct}%)</b>\n` +
    `Status: <b>${contract.status.toUpperCase()}</b>\n\n` +
    `Log into your Mini App to approve video renders or review schedule.`;

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.webApp('🚀 Open Work in Mini App', `${MINI_APP_URL}?startapp=contract_${contract._id}`)],
    [Markup.button.callback('⬅️ Main Menu', 'menu:main')],
  ]);

  if (contract.telegramStatusMessageId) {
    try {
      await bot.telegram.editMessageText(
        clientChatId,
        Number(contract.telegramStatusMessageId),
        null,
        statusText,
        { parse_mode: 'HTML', ...keyboard }
      );
      return;
    } catch (err) {
      console.log('Failed to edit contract status message, sending new card:', err.message);
    }
  }

  try {
    const sentMsg = await bot.telegram.sendMessage(clientChatId, statusText, {
      parse_mode: 'HTML',
      ...keyboard,
    });
    contract.telegramStatusMessageId = sentMsg.message_id.toString();
    await contract.save();
  } catch (err) {
    console.error('Failed to send contract status card:', err.message);
  }
};
