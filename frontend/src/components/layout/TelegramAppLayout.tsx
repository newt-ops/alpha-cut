import React, { useEffect, ReactNode } from 'react';
import { triggerHapticSelection } from '../../utils/telegramSdk';
import { IconFilm, IconZap, IconUser } from '@icons/icons';

export const TELEGRAM_BLUE = '#24A1DE';

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
          if (tg.themeParams.bg_color) root.style.setProperty('--bg', tg.themeParams.bg_color);
          if (tg.themeParams.secondary_bg_color) root.style.setProperty('--surface', tg.themeParams.secondary_bg_color);
          if (tg.themeParams.text_color) root.style.setProperty('--ink', tg.themeParams.text_color);
          if (tg.themeParams.hint_color) root.style.setProperty('--ink-soft', tg.themeParams.hint_color);
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
        backgroundColor: 'var(--bg)',
        color: 'var(--ink)',
        paddingTop: 'calc(8px + env(safe-area-inset-top, 0px))',
        paddingBottom: onTabChange ? 'calc(96px + env(safe-area-inset-bottom, 0px))' : 'calc(24px + env(safe-area-inset-bottom, 0px))',
        boxSizing: 'border-box',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '0 16px' }}>
        {children}
      </div>

      {/* Floating Glassmorphic 3-Tab Navigation Bar */}
      {onTabChange && (
        <div
          style={{
            position: 'fixed',
            bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 32px)',
            maxWidth: '480px',
            backgroundColor: 'var(--surface)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '24px',
            border: '1px solid var(--line)',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
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
                  fontSize: '12px',
                  cursor: 'pointer',
                  gap: '6px',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <Icon size={17} color={isActive ? TELEGRAM_BLUE : 'var(--ink-soft)'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
