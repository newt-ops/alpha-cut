import { PackageConfig } from '../../models/PackageConfig.js';
import { getClientPackageKeyboard } from '../keyboards/clientKeyboards.js';

export const buildPackagesMessage = async (currency = 'ETB') => {
  const configs = await PackageConfig.find({});
  const basicConfig = configs.find((c) => c.tier === 'basic' && c.currency === 'ETB');
  const proConfig = configs.find((c) => c.tier === 'professional' && c.currency === 'ETB');
  const premiumConfig = configs.find((c) => c.tier === 'premium' && c.currency === 'ETB');

  const basicMin = basicConfig?.priceMin || 500;
  const basicMax = basicConfig?.priceMax || 800;
  const proMin = proConfig?.priceMin || 1000;
  const proMax = proConfig?.priceMax || 1500;
  const premMin = premiumConfig?.priceMin || 1600;
  const premMax = premiumConfig?.priceMax || 2400;

  let msg = `📦 <b>ALPHA CUT — PACKAGE PRICING & RATE CARDS</b>\n\n`;

  if (currency === 'ETB') {
    msg += `<b>1. BASIC EDIT TIER</b>\n` +
      `• Rate: <b>${basicMin} – ${basicMax} ETB</b> / video\n` +
      `• Features: Clean subtitles, standard pacing, basic audio polish, 1 revision.\n\n` +
      `<b>2. PROFESSIONAL TIER ⭐ (RECOMMENDED)</b>\n` +
      `• Rate: <b>${proMin} – ${proMax} ETB</b> / video\n` +
      `• Features: Kinetic typography, dynamic b-roll overlays, custom sound effects, 2 revisions.\n\n` +
      `<b>3. PREMIUM EDIT TIER 💎</b>\n` +
      `• Rate: <b>${premMin} – ${premMax} ETB</b> / video\n` +
      `• Features: Custom 2D/3D motion graphics, advanced visual breakdowns, sound design mix, 3 revisions.\n\n` +
      `<i>Rates apply per short-form video render (9:16). Contact us for monthly retainer packages.</i>`;
  } else {
    msg += `<b>INTERNATIONAL USD PRICING ($)</b>\n\n` +
      `• <b>Basic Edit Tier:</b> ~$10 – $15 USD / video\n` +
      `• <b>Professional Tier (Recommended):</b> ~$20 – $30 USD / video\n` +
      `• <b>Premium Edit Tier:</b> ~$35 – $50 USD / video\n\n` +
      `<i>Rates converted live based on official exchange rates. Contact <code>alphacutagency@gmail.com</code> for custom international invoices.</i>`;
  }

  return msg;
};

export const handlePackagesCommand = async (ctx) => {
  try {
    await ctx.sendChatAction('typing');
    const msgText = await buildPackagesMessage('ETB');
    ctx.reply(msgText, { parse_mode: 'HTML', ...getClientPackageKeyboard('ETB') });
  } catch (err) {
    console.error('[BOT PACKAGES COMMAND ERROR]:', err.message);
  }
};
