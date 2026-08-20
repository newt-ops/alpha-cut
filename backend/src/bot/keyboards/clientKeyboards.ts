import { Markup } from 'telegraf';
import { MINI_APP_URL } from '../config/commands.js';

export const getClientMenuKeyboard = () => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('📊 Track Active Work', 'menu:work'),
      Markup.button.callback('📦 Rates & Packages', 'menu:packages'),
    ],
    [
      Markup.button.callback('🎬 Signature Styles', 'menu:styles:0'),
      Markup.button.callback('⚡ About Agency', 'menu:about'),
    ],
    [Markup.button.webApp('🚀 Open Mini App Workspace', MINI_APP_URL)],
    [
      Markup.button.callback('💬 Contact Support', 'menu:support'),
      Markup.button.callback('❌ Disconnect Account', 'unlink_account'),
    ],
  ]);
};

export const getClientPackageKeyboard = (activeCurr = 'ETB') => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(activeCurr === 'ETB' ? '▶️ ETB Rates (Br)' : 'ETB Rates (Br)', 'packages:currency:etb'),
      Markup.button.callback(activeCurr === 'USD' ? '▶️ USD Rates ($)' : 'USD Rates ($)', 'packages:currency:usd'),
    ],
    [Markup.button.webApp('🚀 Open Workspace in Mini App', MINI_APP_URL)],
    [Markup.button.callback('⬅️ Back to Menu', 'menu:main')],
  ]);
};

export const getClientStylesPaginationKeyboard = (pageIdx: number, totalPages: number) => {
  const navRow: any[] = [];
  if (pageIdx > 0) navRow.push(Markup.button.callback('◀️ Prev Style', `menu:styles:${pageIdx - 1}`));
  if (pageIdx < totalPages - 1) navRow.push(Markup.button.callback('Next Style ▶️', `menu:styles:${pageIdx + 1}`));

  return Markup.inlineKeyboard([
    ...(navRow.length > 0 ? [navRow] : []),
    [Markup.button.webApp('🚀 Open Mini App Workspace', MINI_APP_URL)],
    [Markup.button.callback('⬅️ Back to Menu', 'menu:main')],
  ]);
};
