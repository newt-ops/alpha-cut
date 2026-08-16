import { Telegraf } from 'telegraf';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { PendingLink } from '../models/PendingLink.js';

export const bot = config.telegramBotToken ? new Telegraf(config.telegramBotToken) : null;

if (bot) {
  bot.command('start', async (ctx) => {
    try {
      const payload = ctx.message.text.split(' ')[1];
      const chatId = ctx.chat.id.toString();

      if (payload) {
        const pending = await PendingLink.findOne({
          token: payload,
          type: 'deep_link',
          used: false,
          expiresAt: { $gt: new Date() },
        });

        if (!pending) {
          return ctx.reply('Link token is invalid or expired. Please generate a new connection link from your Alpha Cut dashboard.');
        }

        const user = await User.findById(pending.userId);
        if (!user) {
          return ctx.reply('User account not found.');
        }

        user.telegramChatId = chatId;
        user.telegramLinkedAt = new Date();
        await user.save();

        pending.used = true;
        await pending.save();

        return ctx.reply(`Account Linked Successfully!\n\nWelcome ${user.name}. Your Telegram account is now connected to Alpha Cut. You will receive real-time project updates and notifications right here.`);
      }

      const existingUser = await User.findOne({ telegramChatId: chatId });
      if (existingUser) {
        return ctx.reply(`Account Already Linked\n\nConnected to: ${existingUser.name} (${existingUser.email}).`);
      }

      ctx.reply(
        `Welcome to Alpha Cut Bot.\n\nTo link your client account:\n1. Click "Connect via Telegram" in your dashboard, OR\n2. Type /link <code> with the 6-digit code shown in your dashboard.`
      );
    } catch (err) {
      console.error('Telegram bot start command error:', err.message);
      ctx.reply('An error occurred while processing your request.');
    }
  });

  bot.command('link', async (ctx) => {
    try {
      const parts = ctx.message.text.split(' ');
      const code = parts[1];
      const chatId = ctx.chat.id.toString();

      if (!code) {
        return ctx.reply('Please provide your 6-digit code. Usage: /link 123456');
      }

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

      user.telegramChatId = chatId;
      user.telegramLinkedAt = new Date();
      await user.save();

      pending.used = true;
      await pending.save();

      ctx.reply(`Account Linked Successfully!\n\nConnected to ${user.name}. You will receive instant notifications for project updates, proposals, and deliverables.`);
    } catch (err) {
      console.error('Telegram bot link command error:', err.message);
      ctx.reply('An error occurred while processing your request.');
    }
  });
}
