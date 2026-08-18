import React, { useEffect } from 'react';
import { triggerHapticSelection } from '../../utils/telegramSdk';
import { IconZap, IconFileText, IconSparkles, IconUser } from '@icons/icons';

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
    { id: 'work', label: 'Work', icon: IconZap },
    { id: 'packages', label: 'Rates', icon: IconFileText },
    { id: 'styles', label: 'Styles', icon: IconSparkles },
    { id: 'account', label: 'Profile', icon: IconUser },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg)',
        color: 'var(--ink)',
        paddingBottom: onTabChange ? '80px' : '24px',
        boxSizing: 'border-box',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '16px' }}>
        {children}
      </div>

      {/* Touch-Optimized 4-Tab Navigation Bar */}
      {onTabChange && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'var(--surface)',
            borderTop: '1px solid var(--line)',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            height: '64px',
            zIndex: 100,
            boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.25)',
            backdropFilter: 'blur(12px)',
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
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  background: 'none',
                  color: isActive ? 'var(--accent-gold)' : 'var(--ink-soft)',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '11px',
                  cursor: 'pointer',
                  gap: '4px',
                  transition: 'all 0.2s ease',
                  padding: '6px 0',
                }}
              >
                <Icon size={20} color={isActive ? 'var(--accent-gold)' : 'var(--ink-soft)'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
