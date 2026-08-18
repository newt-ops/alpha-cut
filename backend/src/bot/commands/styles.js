import { EDITING_STYLES } from '../../constants/editingStyles.js';
import { getClientStylesPaginationKeyboard } from '../keyboards/clientKeyboards.js';

export const buildStylesMessage = (pageIdx = 0) => {
  const pageSize = 2;
  const totalPages = Math.ceil(EDITING_STYLES.length / pageSize);
  const safePageIdx = Math.max(0, Math.min(pageIdx, totalPages - 1));
  const currentStyles = EDITING_STYLES.slice(safePageIdx * pageSize, (safePageIdx + 1) * pageSize);

  let msg = `🎬 <b>SIGNATURE EDITING STYLES (${safePageIdx + 1}/${totalPages})</b>\n\n`;

  currentStyles.forEach((s, idx) => {
    msg += `<b>${safePageIdx * pageSize + idx + 1}. ${s.name}</b>\n` +
      `• <b>Format:</b> <code>${s.format || '9:16 Vertical'}</code> | <b>Pacing:</b> <code>${s.pacing || 'Fast / Kinetic'}</code>\n` +
      `• <b>Best For:</b> <i>${s.bestFor || 'Viral shorts, educational breakdowns'}</i>\n` +
      `• <i>"${s.description}"</i>\n\n`;
  });

  msg += `<i>Use the navigation buttons below to explore all editing styles or launch the Mini App.</i>`;
  return { msgText: msg, safePageIdx, totalPages };
};

export const handleStylesCommand = async (ctx) => {
  try {
    await ctx.sendChatAction('typing');
    const { msgText, safePageIdx, totalPages } = buildStylesMessage(0);
    ctx.reply(msgText, { parse_mode: 'HTML', ...getClientStylesPaginationKeyboard(safePageIdx, totalPages) });
  } catch (err) {
    console.error('[BOT STYLES COMMAND ERROR]:', err.message);
  }
};
