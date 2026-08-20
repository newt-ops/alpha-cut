import { Markup } from 'telegraf';
import { CLIENT_URL } from '../config/commands.js';
export const getAdminMenuKeyboard = () => {
    return Markup.inlineKeyboard([
        [
            Markup.button.callback('📋 Pending Proposals', 'admin_menu:proposals'),
            Markup.button.callback('📦 Active Retainers', 'admin_menu:contracts'),
        ],
        [
            Markup.button.callback('📊 Financial Stats', 'admin_menu:stats'),
            Markup.button.callback('🔄 Refresh Overview', 'menu:main'),
        ],
        [Markup.button.url('🚀 Open Admin ERP Portal', `${CLIENT_URL}/admin`)],
        [Markup.button.callback('❌ Disconnect Account', 'unlink_account')],
    ]);
};
export const getAdminProposalActionKeyboard = (projectId) => {
    return Markup.inlineKeyboard([
        [Markup.button.url('🚀 Manage in Admin Portal', `${CLIENT_URL}/admin`)],
        [Markup.button.callback('⬅️ Back to Admin Menu', 'menu:main')],
    ]);
};
