import React, { useEffect, ReactNode } from 'react';
import { triggerHapticSelection } from '../../utils/telegramSdk';
import { IconFilm, IconZap, IconUser } from '@icons/icons';

interface TelegramAppLayoutProps {
  children: ReactNode;
  activeTab?: 'projects' | 'contracts' | 'profile' | string;
  onTabChange?: (tabId: string) => void;
}

export const TelegramAppLayout: React.FC<TelegramAppLayoutProps> = ({
  children,
  activeTab = 'projects',
  onTabChange,
}) => {
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      tg.ready();
      tg.expand();

      const applyTheme = () => {
        try {
          if (tg.setHeaderColor) tg.setHeaderColor('secondary_bg_color');
          if (tg.setBottomBarColor) tg.setBottomBarColor('secondary_bg_color');
        } catch (e) {}

        if (tg.themeParams) {
          const root = document.documentElement;
          if (tg.themeParams.bg_color) {
            root.style.setProperty('--tg-bg', tg.themeParams.bg_color);
          }
          if (tg.themeParams.secondary_bg_color) {
            root.style.setProperty('--tg-secondary-bg', tg.themeParams.secondary_bg_color);
          }
          if (tg.themeParams.text_color) {
            root.style.setProperty('--tg-text', tg.themeParams.text_color);
          }
          if (tg.themeParams.hint_color) {
            root.style.setProperty('--tg-hint', tg.themeParams.hint_color);
          }
          if (tg.themeParams.link_color) {
            root.style.setProperty('--tg-link', tg.themeParams.link_color);
          }
          if (tg.themeParams.button_color) {
            root.style.setProperty('--tg-button', tg.themeParams.button_color);
          }
          if (tg.themeParams.button_text_color) {
            root.style.setProperty('--tg-button-text', tg.themeParams.button_text_color);
          }
        }
      };

      applyTheme();

      if (tg.onEvent) {
        tg.onEvent('themeChanged', applyTheme);
      }

      return () => {
        if (tg.offEvent) {
          tg.offEvent('themeChanged', applyTheme);
        }
      };
    }
  }, []);

  const handleTabClick = (tabId: string) => {
    triggerHapticSelection();
    if (onTabChange) onTabChange(tabId);
  };

  const navItems = [
    { id: 'projects', label: 'Projects', icon: IconFilm },
    { id: 'contracts', label: 'Retainers', icon: IconZap },
    { id: 'profile', label: 'Account', icon: IconUser },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--tg-theme-bg-color, var(--tg-bg, #17212b))',
        color: 'var(--tg-theme-text-color, var(--tg-text, #ffffff))',
        paddingTop: 'calc(12px + env(safe-area-inset-top, 0px))',
        paddingBottom: onTabChange
          ? 'calc(84px + env(safe-area-inset-bottom, 0px))'
          : 'calc(24px + env(safe-area-inset-bottom, 0px))',
        boxSizing: 'border-box',
        WebkitTapHighlightColor: 'transparent',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: '540px', margin: '0 auto', padding: '0 16px' }}>
        {children}
      </div>

      {/* Telegram Native Bottom Tab Bar */}
      {onTabChange && (
        <div
          style={{
            position: 'fixed',
            bottom: '0',
            left: '0',
            right: '0',
            backgroundColor: 'var(--tg-theme-secondary-bg-color, var(--tg-secondary-bg, #232e3c))',
            borderTop: '1px solid rgba(120, 120, 128, 0.15)',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            height: 'calc(56px + env(safe-area-inset-bottom, 0px))',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            zIndex: 100,
            boxSizing: 'border-box',
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const activeColor = 'var(--tg-theme-button-color, var(--tg-button, var(--tg-theme-link-color, #64b5ef)))';
            const inactiveColor = 'var(--tg-theme-hint-color, var(--tg-hint, #708499))';

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
                  backgroundColor: 'transparent',
                  color: isActive ? activeColor : inactiveColor,
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '11px',
                  cursor: 'pointer',
                  gap: '4px',
                  padding: '6px 0',
                }}
              >
                <Icon size={20} color={isActive ? activeColor : inactiveColor} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
