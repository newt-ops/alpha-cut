import { Telegraf, Markup } from 'telegraf';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { PendingLink } from '../models/PendingLink.js';
import { Project } from '../models/Project.js';
import { EDITING_STYLES } from '../constants/editingStyles.js';

export const bot = config.telegramBotToken ? new Telegraf(config.telegramBotToken) : null;

// Menu for linked users (NO EMOJIS)
const getLinkedMenu = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback('My Active Projects', 'my_projects')],
    [Markup.button.callback('Pending Proposals', 'my_proposals')],
    [Markup.button.callback('Signature Editing Styles', 'styles_list')],
    [Markup.button.callback('Packages & Rates', 'rates_info')],
    [Markup.button.callback('Contact Agency', 'agency_contact')],
  ]);
};

// Menu for unlinked users (NO EMOJIS)
const getUnlinkedMenu = () => {
  return Markup.inlineKeyboard([
    [Markup.button.url('Register Account on Web Platform', 'https://alpha-cut-nine.vercel.app/signup')],
    [Markup.button.url('Log In to Client Dashboard', 'https://alpha-cut-nine.vercel.app/login')],
  ]);
};

if (bot) {
  // Command /start (Handles both plain /start and deep-link /start <token>)
  bot.command('start', async (ctx) => {
    try {
      const payload = ctx.message.text.split(' ')[1];
      const chatId = ctx.chat.id.toString();

      if (payload) {
        // 1-to-1 unique check: Check if this Telegram account is already linked to another user
        const existingBoundUser = await User.findOne({ telegramChatId: chatId });

        const pending = await PendingLink.findOne({
          token: payload,
          type: 'deep_link',
          used: false,
          expiresAt: { $gt: new Date() },
        });

        if (!pending) {
          return ctx.reply('Link token is invalid or expired. Please generate a new link in your Alpha Cut dashboard.');
        }

        const user = await User.findById(pending.userId);
        if (!user) {
          return ctx.reply('User account not found.');
        }

        if (existingBoundUser && existingBoundUser._id.toString() !== user._id.toString()) {
          return ctx.reply(
            `Link Rejected: This Telegram account is already linked to another client account (${existingBoundUser.email}). A Telegram account can only be bound to one user profile.`
          );
        }

        user.telegramChatId = chatId;
        user.telegramLinkedAt = new Date();
        await user.save();

        pending.used = true;
        await pending.save();

        return ctx.reply(
          `<b>Account Linked Successfully!</b>\n\nWelcome <b>${user.name}</b>. Your Telegram account is now connected to Alpha Cut.\n\nYou will receive real-time status updates when proposals are issued or project milestones advance.`,
          { parse_mode: 'HTML', ...getLinkedMenu() }
        );
      }

      const existingUser = await User.findOne({ telegramChatId: chatId });
      if (existingUser) {
        return ctx.reply(
          `<b>Welcome back, ${existingUser.name}!</b>\n\nUse the interactive menu below to inspect your proposals, active projects, agency rates, or signature editing styles.`,
          { parse_mode: 'HTML', ...getLinkedMenu() }
        );
      }

      ctx.reply(
        `<b>Welcome to Alpha Cut Agency Bot.</b>\n\nAlpha Cut is a high-impact video editing agency specializing in retention-driven short-form, viral breakdowns, and cinematic storytelling.\n\n<b>To connect your account:</b>\n1. Register or Log In on our web platform using the link below.\n2. Click "Connect via Telegram" in your dashboard, OR send your 6-digit code using <code>/link <code></code>.`,
        { parse_mode: 'HTML', ...getUnlinkedMenu() }
      );
    } catch (err) {
      console.error('Telegram start error:', err.message);
      ctx.reply('An error occurred while starting the bot.');
    }
  });

  // Command /link <code>
  bot.command('link', async (ctx) => {
    try {
      const parts = ctx.message.text.split(' ');
      const code = parts[1];
      const chatId = ctx.chat.id.toString();

      if (!code) {
        return ctx.reply('Please provide your 6-digit code. Example: <code>/link 123456</code>', { parse_mode: 'HTML' });
      }

      const existingBoundUser = await User.findOne({ telegramChatId: chatId });

      const pending = await PendingLink.findOne({
        code,
        type: 'code',
        used: false,
        expiresAt: { $gt: new Date() },
      });

      if (!pending) {
        return ctx.reply('Invalid or expired 6-digit code. Please generate a new code in your dashboard.');
      }

      const user = await User.findById(pending.userId);
      if (!user) {
        return ctx.reply('User account not found.');
      }

      if (existingBoundUser && existingBoundUser._id.toString() !== user._id.toString()) {
        return ctx.reply(
          `Link Rejected: This Telegram account is already linked to another client account (${existingBoundUser.email}).`
        );
      }

      user.telegramChatId = chatId;
      user.telegramLinkedAt = new Date();
      await user.save();

      pending.used = true;
      await pending.save();

      ctx.reply(
        `<b>Account Linked Successfully!</b>\n\nConnected to <b>${user.name}</b>. You are now set up for live progress updates.`,
        { parse_mode: 'HTML', ...getLinkedMenu() }
      );
    } catch (err) {
      console.error('Telegram link error:', err.message);
      ctx.reply('An error occurred while linking your account.');
    }
  });

  // Action: My Active Projects
  bot.action('my_projects', async (ctx) => {
    try {
      await ctx.answerCbQuery();
      const chatId = ctx.chat.id.toString();
      const user = await User.findOne({ telegramChatId: chatId });

      if (!user) {
        return ctx.reply('Your Telegram account is not linked yet. Please register or log in on our site to connect.', getUnlinkedMenu());
      }

      const projects = await Project.find({
        clientId: user._id,
        status: { $in: ['in_progress', 'delivered', 'completed'] },
      }).sort({ createdAt: -1 });

      if (projects.length === 0) {
        return ctx.reply('You currently have no active or completed projects.', getLinkedMenu());
      }

      let responseText = `<b>Your Active Video Projects (${projects.length}):</b>\n\n`;
      projects.forEach((p, idx) => {
        const progressPct = p.status === 'in_progress' ? '50%' : p.status === 'delivered' ? '85%' : '100%';
        const progressBar = p.status === 'in_progress' ? '[----|    ]' : p.status === 'delivered' ? '[------|  ]' : '[---------]';

        responseText += `${idx + 1}. <b>${p.editingStyle}</b>\n`;
        responseText += `   Status: <b>${p.status.toUpperCase().replace('_', ' ')}</b> ${progressBar} ${progressPct}\n`;
        responseText += `   Price: <b>${p.price} ${p.currency}</b> (${p.packageTier.toUpperCase()})\n`;
        responseText += `   Deadline: ${new Date(p.deadline).toLocaleDateString()}\n\n`;
      });

      ctx.reply(responseText, { parse_mode: 'HTML', ...getLinkedMenu() });
    } catch (err) {
      console.error('Telegram projects action error:', err.message);
      ctx.reply('Failed to fetch projects.');
    }
  });

  // Action: Pending Proposals
  bot.action('my_proposals', async (ctx) => {
    try {
      await ctx.answerCbQuery();
      const chatId = ctx.chat.id.toString();
      const user = await User.findOne({ telegramChatId: chatId });

      if (!user) {
        return ctx.reply('Your Telegram account is not linked yet.', getUnlinkedMenu());
      }

      const proposals = await Project.find({ clientId: user._id, status: 'proposal_sent' }).sort({ createdAt: -1 });

      if (proposals.length === 0) {
        return ctx.reply('You have no pending proposal offers at this time.', getLinkedMenu());
      }

      let responseText = `<b>Pending Project Proposals (${proposals.length}):</b>\n\n`;
      proposals.forEach((p, idx) => {
        responseText += `${idx + 1}. <b>${p.editingStyle}</b>\n`;
        responseText += `   Package: ${p.packageTier.toUpperCase()} (${p.contentLength.toUpperCase()})\n`;
        responseText += `   Terms: <b>${p.price} ${p.currency}</b>\n`;
        responseText += `   Deadline: ${new Date(p.deadline).toLocaleDateString()}\n`;
        responseText += `   Action: Log into your dashboard to accept or decline proposal.\n\n`;
      });

      ctx.reply(responseText, { parse_mode: 'HTML', ...getLinkedMenu() });
    } catch (err) {
      ctx.reply('Failed to fetch proposals.');
    }
  });

  // Action: Signature Editing Styles
  bot.action('styles_list', async (ctx) => {
    try {
      await ctx.answerCbQuery();
      let responseText = `<b>Alpha Cut — Signature Editing Styles:</b>\n\n`;
      EDITING_STYLES.forEach((s, i) => {
        responseText += `${i + 1}. <b>${s.name}</b>\n   Pacing: ${s.pacing}\n   Format: ${s.format}\n\n`;
      });

      responseText += `Explore interactive previews on our web platform: https://alpha-cut-nine.vercel.app/editing-styles`;

      ctx.reply(responseText, { parse_mode: 'HTML', ...getLinkedMenu() });
    } catch (err) {
      ctx.reply('Failed to fetch styles list.');
    }
  });

  // Action: Rates & Packages
  bot.action('rates_info', async (ctx) => {
    try {
      await ctx.answerCbQuery();
      const responseText = `<b>Alpha Cut — Investment & Package Rates:</b>\n\n` +
        `<b>Basic Short-Form Tier:</b>\n` +
        `• 350 – 400 ETB / video\n` +
        `• Clean captions, basic sound design, color correction, 1 revision.\n\n` +
        `<b>Premium Short-Form Tier:</b>\n` +
        `• 450 – 500 ETB / video\n` +
        `• Kinetic typography, custom b-roll, motion graphics, 2 revisions.\n\n` +
        `<b>Long-Form & USD Rates:</b>\n` +
        `• Custom request state per project brief.\n\n` +
        `Compute monthly package rates on our calculator: https://alpha-cut-nine.vercel.app/packages`;

      ctx.reply(responseText, { parse_mode: 'HTML', ...getLinkedMenu() });
    } catch (err) {
      ctx.reply('Failed to fetch rates.');
    }
  });

  // Action: Agency Contact
  bot.action('agency_contact', async (ctx) => {
    try {
      await ctx.answerCbQuery();
      const responseText = `<b>Alpha Cut Agency Contact & Support:</b>\n\n` +
        `• Official Email: <code>alphacutagency@gmail.com</code>\n` +
        `• Founders: <b>Amir</b> (Video Editor) & <b>Aymen</b> (Full-Stack Dev & Video Editor)\n` +
        `• Web Platform: https://alpha-cut-nine.vercel.app\n` +
        `• Developer Credit: aymen10.netlify.app`;

      ctx.reply(responseText, { parse_mode: 'HTML', ...getLinkedMenu() });
    } catch (err) {
      ctx.reply('Failed to fetch contact details.');
    }
  });
}
