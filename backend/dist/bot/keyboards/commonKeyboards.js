import { Markup } from 'telegraf';
import { CLIENT_URL, MINI_APP_URL } from '../config/commands.js';
export const getUnlinkedMenuKeyboard = () => {
    return Markup.inlineKeyboard([
        [Markup.button.webApp('🚀 Open Workspace & Connect', MINI_APP_URL)],
        [Markup.button.url('🌐 Visit Agency Website', CLIENT_URL)],
    ]);
};
export const getBackButton = (target = 'menu:main') => {
    return Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back to Main Menu', target)]]);
};
export const getSupportKeyboard = () => {
    return Markup.inlineKeyboard([
        [Markup.button.webApp('🚀 Open Mini App Workspace', MINI_APP_URL)],
        [Markup.button.url('🌐 Open Web Platform', CLIENT_URL)],
        [Markup.button.callback('⬅️ Back to Menu', 'menu:main')],
    ]);
};
