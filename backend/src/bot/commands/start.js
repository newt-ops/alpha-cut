import { User } from '../../models/User.js';
import { PendingLink } from '../../models/PendingLink.js';
import { getAdminMenuKeyboard } from '../keyboards/adminKeyboards.js';
import { getClientMenuKeyboard } from '../keyboards/clientKeyboards.js';
import { getUnlinkedMenuKeyboard } from '../keyboards/commonKeyboards.js';

export const handleStartCommand = async (ctx) => {
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
    console.error('[BOT START ERROR]:', err.message);
  }
};
