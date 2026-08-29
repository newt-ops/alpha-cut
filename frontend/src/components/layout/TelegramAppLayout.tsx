import React, { useEffect, ReactNode } from 'react';
import { motion } from 'framer-motion';
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
          ? 'calc(92px + env(safe-area-inset-bottom, 0px))'
          : 'calc(24px + env(safe-area-inset-bottom, 0px))',
        boxSizing: 'border-box',
        WebkitTapHighlightColor: 'transparent',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: '540px', margin: '0 auto', padding: '0 16px' }}>
        {children}
      </div>

      {/* Apple iOS Style Floating Glassmorphic Footer Navigation */}
      {onTabChange && (
        <nav
          aria-label="Bottom Navigation"
          style={{
            position: 'fixed',
            bottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 24px)',
            maxWidth: '420px',
            height: '60px',
            backgroundColor: 'var(--tg-theme-secondary-bg-color, var(--tg-secondary-bg, rgba(35, 46, 60, 0.85)))',
            backdropFilter: 'blur(30px) saturate(190%)',
            WebkitBackdropFilter: 'blur(30px) saturate(190%)',
            borderRadius: '30px',
            border: '0.5px solid rgba(255, 255, 255, 0.12)',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            alignItems: 'center',
            padding: '4px',
            zIndex: 100,
            boxSizing: 'border-box',
            boxShadow: '0 12px 36px -4px rgba(0, 0, 0, 0.35), 0 0 1px rgba(255, 255, 255, 0.15)',
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const activeColor = 'var(--tg-theme-button-color, var(--tg-button, var(--tg-theme-link-color, #64b5ef)))';
            const inactiveColor = 'var(--tg-theme-hint-color, var(--tg-hint, #708499))';

            return (
              <motion.button
                key={item.id}
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={() => handleTabClick(item.id)}
                style={{
                  position: 'relative',
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
                  gap: '3px',
                  height: '52px',
                  borderRadius: '24px',
                  outline: 'none',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {/* iOS Active Floating Backdrop Pill */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabPill"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    style={{
                      position: 'absolute',
                      inset: '2px 4px',
                      backgroundColor: 'rgba(36, 161, 222, 0.16)',
                      borderRadius: '22px',
                      border: '1px solid rgba(36, 161, 222, 0.25)',
                      zIndex: 0,
                    }}
                  />
                )}

                <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                  <Icon size={20} color={isActive ? activeColor : inactiveColor} />
                  <span style={{ letterSpacing: '-0.1px' }}>{item.label}</span>
                </div>
              </motion.button>
            );
          })}
        </nav>
      )}
    </div>
  );
};
