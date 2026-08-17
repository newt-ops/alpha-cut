import { Telegraf, Markup } from 'telegraf';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { PendingLink } from '../models/PendingLink.js';
import { Project } from '../models/Project.js';
import { PackageConfig } from '../models/PackageConfig.js';
import { EDITING_STYLES } from '../constants/editingStyles.js';

export const bot = config.telegramBotToken ? new Telegraf(config.telegramBotToken) : null;

const CLIENT_URL = process.env.CLIENT_URL || 'https://alpha-cut-nine.vercel.app';
const MINI_APP_URL = `${CLIENT_URL}/app`;

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
const getMainMenuKeyboard = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback('📊 Track My Projects', 'menu:projects')],
    [Markup.button.callback('📦 Packages & Pricing', 'menu:packages')],
    [Markup.button.callback('🎬 Signature Editing Styles', 'menu:styles:0')],
    [Markup.button.callback('⚡ About Alpha Cut', 'menu:about')],
    [Markup.button.webApp('🚀 Open Full Dashboard', MINI_APP_URL)],
    [Markup.button.callback('❌ Disconnect Account', 'unlink_account')],
  ]);
};

const getUnlinkedMenuKeyboard = () => {
  return Markup.inlineKeyboard([
    [Markup.button.webApp('🚀 Open Dashboard & Connect', MINI_APP_URL)],
    [Markup.button.url('🌐 Visit Website', CLIENT_URL)],
  ]);
};

if (bot) {
  // Register Command Menu & Corner Menu Button on Launch
  (async () => {
    try {
      await bot.telegram.setMyCommands([
        { command: 'start', description: 'Launch bot & main menu' },
        { command: 'menu', description: 'Open interactive agency menu' },
        { command: 'status', description: 'Check live project status' },
        { command: 'projects', description: 'View all video projects' },
        { command: 'packages', description: 'View pricing & rate ranges' },
        { command: 'styles', description: 'Browse video editing styles' },
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
            `⚠️ Link Rejected: This Telegram account is already linked to another client (${existingBoundUser.email}).`
          );
        }

        user.telegramChatId = chatId;
        user.telegramLinkedAt = new Date();
        await user.save();

        pending.used = true;
        await pending.save();

        return ctx.reply(
          `🎉 <b>Account Linked Successfully!</b>\n\nWelcome <b>${user.name}</b>. Your Telegram account is now connected to Alpha Cut Agency.`,
          { parse_mode: 'HTML', ...getMainMenuKeyboard() }
        );
      }

      const existingUser = await User.findOne({ telegramChatId: chatId });
      if (existingUser) {
        return ctx.reply(
          `🎬 <b>Welcome back, ${existingUser.name}!</b>\n\nUse the interactive menu below to inspect active projects, packages, or launch the Mini App.`,
          { parse_mode: 'HTML', ...getMainMenuKeyboard() }
        );
      }

      ctx.reply(
        `🎬 <b>Welcome to Alpha Cut Control Center</b>\n\n` +
          `High-impact video editing agency for short-form, viral breakdowns, and long-form content.\n\n` +
          `<b>To link your account:</b>\n` +
          `1. Open our web platform or Mini App\n` +
          `2. Send your 6-digit code using <code>/link 123456</code>`,
        { parse_mode: 'HTML', ...getUnlinkedMenuKeyboard() }
      );
    } catch (err) {
      console.error('Telegram start error:', err.message);
    }
  });

  // Handler: /menu & /status & /projects & /packages & /styles & /about & /help
  bot.command('menu', async (ctx) => {
    await ctx.sendChatAction('typing');
    ctx.reply('🎬 <b>Alpha Cut Agency Main Menu</b>', { parse_mode: 'HTML', ...getMainMenuKeyboard() });
  });

  bot.command('status', async (ctx) => {
    await ctx.sendChatAction('typing');
    const chatId = ctx.chat.id.toString();
    const user = await User.findOne({ telegramChatId: chatId });
    if (!user) return ctx.reply('⚠️ Please link your account first.', getUnlinkedMenuKeyboard());

    const project = await Project.findOne({ clientId: user._id }).sort({ updatedAt: -1 });
    if (!project) return ctx.reply('ℹ️ You currently have no project proposals or edits.', getMainMenuKeyboard());

    const msg = `📊 <b>Latest Project Status:</b>\n\n` +
      `Style: <b>${project.editingStyle}</b>\n` +
      `Progress: <code>${getUnicodeProgressBar(project.status)}</code>\n` +
      `Price: <b>${project.price} ${project.currency}</b>\n` +
      `Deadline: ${new Date(project.deadline).toLocaleDateString()}`;

    ctx.reply(msg, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [Markup.button.webApp('🚀 Open Project in Mini App', MINI_APP_URL)],
        [Markup.button.callback('⬅️ Back to Menu', 'menu:main')],
      ]),
    });
  });

  bot.command('projects', async (ctx) => {
    ctx.reply('📊 <b>Fetching your video projects...</b>', { parse_mode: 'HTML', ...getMainMenuKeyboard() });
  });

  bot.command('packages', async (ctx) => {
    ctx.reply('📦 <b>Fetching package rates...</b>', { parse_mode: 'HTML', ...getMainMenuKeyboard() });
  });

  bot.command('styles', async (ctx) => {
    ctx.reply('🎬 <b>Signature Editing Styles:</b>', { parse_mode: 'HTML', ...getMainMenuKeyboard() });
  });

  bot.command('about', async (ctx) => {
    ctx.reply('⚡ <b>Alpha Cut Agency</b> — Retention-driven video editing.', { parse_mode: 'HTML', ...getMainMenuKeyboard() });
  });

  bot.command('help', async (ctx) => {
    ctx.reply(
      `ℹ️ <b>Alpha Cut Bot Help & Commands:</b>\n\n` +
        `/menu — Main Menu\n` +
        `/status — Active project status card\n` +
        `/projects — List all projects\n` +
        `/packages — Inspect package rates\n` +
        `/styles — Signature editing styles\n` +
        `/unlink — Disconnect account`,
      { parse_mode: 'HTML', ...getMainMenuKeyboard() }
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

      ctx.reply(`🎉 <b>Account Linked Successfully!</b>\n\nConnected to <b>${user.name}</b>.`, {
        parse_mode: 'HTML',
        ...getMainMenuKeyboard(),
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

  // In-Place Screen Router (Callback Queries)
  bot.on('callback_query', async (ctx) => {
    const data = ctx.callbackQuery.data;
    if (!data) return;

    try {
      await ctx.answerCbQuery();
      const chatId = ctx.chat.id.toString();
      const user = await User.findOne({ telegramChatId: chatId });

      if (data === 'menu:main') {
        return ctx.editMessageText('🎬 <b>Alpha Cut Agency Main Menu</b>', {
          parse_mode: 'HTML',
          ...getMainMenuKeyboard(),
        });
      }

      if (data === 'menu:projects') {
        if (!user) {
          return ctx.editMessageText('⚠️ Please link your account first to track projects.', {
            parse_mode: 'HTML',
            ...getUnlinkedMenuKeyboard(),
          });
        }

        const projects = await Project.find({ clientId: user._id }).sort({ createdAt: -1 });
        if (projects.length === 0) {
          return ctx.editMessageText('ℹ️ You have no project proposals or edits yet.', {
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back to Menu', 'menu:main')]]),
          });
        }

        let msg = `📊 <b>Your Projects & Proposals (${projects.length}):</b>\n\n`;
        const buttons = [];
        projects.forEach((p, i) => {
          const statusTag = `[${p.status.replace('_', ' ').toUpperCase()}]`;
          msg += `${i + 1}. <b>${p.editingStyle}</b> ${statusTag}\n   Terms: ${p.price} ${p.currency}\n\n`;
          buttons.push([Markup.button.callback(`inspect ${p.editingStyle}`, `project:${p._id}`)]);
        });

        buttons.push([Markup.button.webApp('🚀 Open Mini App Workspace', MINI_APP_URL)]);
        buttons.push([Markup.button.callback('⬅️ Back to Menu', 'menu:main')]);

        return ctx.editMessageText(msg, { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) });
      }

      if (data.startsWith('project:')) {
        const projId = data.split(':')[1];
        const project = await Project.findById(projId);
        if (!project) {
          return ctx.editMessageText('⚠️ Project not found.', {
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back to Projects', 'menu:projects')]]),
          });
        }

        const msg = `🎬 <b>Project Details: ${project.editingStyle}</b>\n\n` +
          `Status: <code>${getUnicodeProgressBar(project.status)}</code>\n` +
          `Package Tier: <b>${project.packageTier.toUpperCase()} (${project.contentLength.toUpperCase()})</b>\n` +
          `Agreed Rate: <b>${project.price} ${project.currency}</b>\n` +
          `Deadline: <b>${new Date(project.deadline).toLocaleDateString()}</b>\n` +
          (project.referenceBrief ? `Brief / Link: <i>${project.referenceBrief}</i>\n` : '');

        return ctx.editMessageText(msg, {
          parse_mode: 'HTML',
          ...Markup.inlineKeyboard([
            [Markup.button.webApp('🚀 Open & Action in Mini App', MINI_APP_URL)],
            [Markup.button.callback('⬅️ Back to Projects List', 'menu:projects')],
          ]),
        });
      }

      if (data.startsWith('menu:packages') || data.startsWith('packages:currency:')) {
        const curr = data.includes('currency:usd') ? 'USD' : 'ETB';
        const configs = await PackageConfig.find({});
        const basicConfig = configs.find((c) => c.tier === 'basic' && c.currency === 'ETB');
        const premiumConfig = configs.find((c) => c.tier === 'premium' && c.currency === 'ETB');

        const basicMin = basicConfig?.priceMin || 350;
        const basicMax = basicConfig?.priceMax || 400;
        const premMin = premiumConfig?.priceMin || 450;
        const premMax = premiumConfig?.priceMax || 500;

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
            `• Customized per region and project requirements.\n` +
            `• Contact <code>alphacutagency@gmail.com</code> for custom invoice terms.\n\n`;
        }

        return ctx.editMessageText(msg, {
          parse_mode: 'HTML',
          ...Markup.inlineKeyboard([
            [
              Markup.button.callback(curr === 'ETB' ? '▶️ ETB Rates' : 'ETB Rates', 'packages:currency:etb'),
              Markup.button.callback(curr === 'USD' ? '▶️ USD Rates' : 'USD Rates', 'packages:currency:usd'),
            ],
            [Markup.button.webApp('🚀 Open Calculator in Mini App', MINI_APP_URL)],
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
            [Markup.button.webApp('🚀 View Video Previews in Mini App', MINI_APP_URL)],
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
            [Markup.button.webApp('🚀 Open Full Dashboard App', MINI_APP_URL)],
            [Markup.button.callback('⬅️ Back to Menu', 'menu:main')],
          ]),
        });
      }
    } catch (err) {
      console.error('Callback query error:', err.message);
    }
  });
}

// Live-Updating Status Card Function
export const updateTelegramStatusCard = async (project, clientChatId) => {
  if (!bot || !clientChatId) return;

  const statusText = `🎬 <b>PROJECT LIFECYCLE UPDATE</b>\n\n` +
    `Style: <b>${project.editingStyle}</b>\n` +
    `Progress: <code>${getUnicodeProgressBar(project.status)}</code>\n` +
    `Investment: <b>${project.price} ${project.currency}</b> (${project.packageTier?.toUpperCase()})\n` +
    `Deadline: <b>${new Date(project.deadline).toLocaleDateString()}</b>\n\n` +
    `Log into your Mini App to take action or review deliverables.`;

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.webApp('🚀 Open Project in Mini App', MINI_APP_URL)],
    [Markup.button.callback('⬅️ Main Menu', 'menu:main')],
  ]);

  if (project.telegramStatusMessageId) {
    try {
      await bot.telegram.editMessageText(
        clientChatId,
        Number(project.telegramStatusMessageId),
        null,
        statusText,
        { parse_mode: 'HTML', ...keyboard }
      );
      return;
    } catch (err) {
      console.log('Failed to edit existing status message, sending new card:', err.message);
    }
  }

  try {
    const sentMsg = await bot.telegram.sendMessage(clientChatId, statusText, {
      parse_mode: 'HTML',
      ...keyboard,
    });
    project.telegramStatusMessageId = sentMsg.message_id.toString();
    await project.save();
  } catch (err) {
    console.error('Failed to send live status card:', err.message);
  }
};
