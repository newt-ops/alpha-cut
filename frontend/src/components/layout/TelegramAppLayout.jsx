import React, { useEffect } from 'react';
import { triggerHapticSelection } from '../../utils/telegramSdk';
import { IconZap, IconUser } from '@icons/icons';

export const TELEGRAM_BLUE = '#24A1DE';

export const TelegramAppLayout = ({ children, activeTab = 'work', onTabChange }) => {
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      try {
        if (tg.setHeaderColor) tg.setHeaderColor('secondary_bg_color');
        if (tg.setBottomBarColor) tg.setBottomBarColor('secondary_bg_color');
      } catch (e) {}

      // Map Telegram theme params onto design tokens
      if (tg.themeParams) {
        const root = document.documentElement;
        if (tg.themeParams.bg_color) root.style.setProperty('--bg', tg.themeParams.bg_color);
        if (tg.themeParams.secondary_bg_color) root.style.setProperty('--surface', tg.themeParams.secondary_bg_color);
        if (tg.themeParams.text_color) root.style.setProperty('--ink', tg.themeParams.text_color);
        if (tg.themeParams.hint_color) root.style.setProperty('--ink-soft', tg.themeParams.hint_color);
      }
    }
  }, []);

  const handleTabClick = (tabId) => {
    triggerHapticSelection();
    if (onTabChange) onTabChange(tabId);
  };

  const navItems = [
    { id: 'work', label: 'Proposals & Work', icon: IconZap },
    { id: 'profile', label: 'Profile', icon: IconUser },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg)',
        color: 'var(--ink)',
        paddingBottom: onTabChange ? '96px' : '24px',
        boxSizing: 'border-box',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px' }}>
        {children}
      </div>

      {/* Floating Glassmorphic 2-Tab Navigation Bar */}
      {onTabChange && (
        <div
          style={{
            position: 'fixed',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 32px)',
            maxWidth: '480px',
            backgroundColor: 'rgba(18, 22, 28, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            height: '60px',
            zIndex: 100,
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45)',
            padding: '4px',
            boxSizing: 'border-box',
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabClick(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  borderRadius: '20px',
                  backgroundColor: isActive ? 'rgba(36, 161, 222, 0.18)' : 'transparent',
                  color: isActive ? TELEGRAM_BLUE : 'var(--ink-soft)',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '13px',
                  cursor: 'pointer',
                  gap: '8px',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <Icon size={18} color={isActive ? TELEGRAM_BLUE : 'var(--ink-soft)'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
