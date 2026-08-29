import { getClientPackageKeyboard, getClientStylesPaginationKeyboard } from '../../keyboards/clientKeyboards.js';
import { EDITING_STYLES } from '../../../constants/editingStyles.js';
export const buildPackagesMessage = async (currency = 'ETB') => {
    const isUSD = currency === 'USD';
    const symbol = isUSD ? '$' : 'ETB ';
    const tier1Price = isUSD ? '150' : '8,000';
    const tier2Price = isUSD ? '450' : '22,000';
    const tier3Price = isUSD ? '950' : '45,000';
    return (`🎬 <b>ALPHA CUT VIDEO EDITING PACKAGES</b>\n\n` +
        `Select a tier to match your content scale:\n\n` +
        `1️⃣ <b>STARTER REEL (${symbol}${tier1Price})</b>\n` +
        `   • 1 Short-Form Video Edit (30-60s)\n` +
        `   • Basic Sound Design & Motion Graphics\n` +
        `   • 1 Revision Round | Delivery: 48h\n\n` +
        `2️⃣ <b>CREATOR BUNDLE (${symbol}${tier2Price})</b>\n` +
        `   • 5 Short-Form Edits or 1 Long-Form YouTube Edit\n` +
        `   • Advanced Motion Graphics & B-Roll Sourcing\n` +
        `   • 2 Revision Rounds | Priority Queue\n\n` +
        `3️⃣ <b>AGENCY RETAINER (${symbol}${tier3Price}/mo)</b>\n` +
        `   • 12 Short-Form Edits + 2 Long-Form Videos\n` +
        `   • Dedicated Senior Editor & Custom Brand Assets\n` +
        `   • Unlimited Revisions | Dedicated Telegram Channel\n\n` +
        `<i>Currency selected: ${currency}</i>`);
};
export const handlePackagesCommand = async (ctx) => {
    try {
        const msgText = await buildPackagesMessage('ETB');
        return ctx.reply(msgText, {
            parse_mode: 'HTML',
            ...getClientPackageKeyboard('ETB'),
        });
    }
    catch (err) {
        console.error('[BOT PACKAGES COMMAND ERROR]:', err.message);
    }
};
export const buildStylesMessage = (pageIndex = 0) => {
    const total = EDITING_STYLES.length;
    const safeIndex = Math.max(0, Math.min(pageIndex, total - 1));
    const style = EDITING_STYLES[safeIndex];
    const msgText = `🎨 <b>EDITING STYLE ${safeIndex + 1}/${total}: ${style.name.toUpperCase()}</b>\n\n` +
        `<b>Format:</b> ${style.format}\n` +
        `<b>Pacing:</b> ${style.pacing}\n` +
        `<b>Best For:</b> ${style.bestFor || 'Content Creators'}\n\n` +
        `<b>Description:</b>\n${style.description}`;
    return { msgText, safePageIdx: safeIndex, totalPages: total };
};
export const handleStylesCommand = async (ctx) => {
    try {
        const { msgText, safePageIdx, totalPages } = buildStylesMessage(0);
        return ctx.reply(msgText, {
            parse_mode: 'HTML',
            ...getClientStylesPaginationKeyboard(safePageIdx, totalPages),
        });
    }
    catch (err) {
        console.error('[BOT STYLES COMMAND ERROR]:', err.message);
    }
};
