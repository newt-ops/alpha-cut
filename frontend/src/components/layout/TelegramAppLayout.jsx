import React, { useEffect } from 'react';

export const TelegramAppLayout = ({ children }) => {
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

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

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg)',
        color: 'var(--ink)',
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ maxWidth: '768px', margin: '0 auto' }}>
        {children}
      </div>
    </div>
  );
};
