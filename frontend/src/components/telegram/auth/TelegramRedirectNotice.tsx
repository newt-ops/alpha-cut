import React from 'react';
import { MINI_APP_URL } from '../../../utils/telegramSdk';
import { IconExternalLink, IconZap } from '@icons/icons';

export const TelegramRedirectNotice: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#17212b',
        color: '#ffffff',
        padding: '24px 16px',
        boxSizing: 'border-box',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '440px',
          width: '100%',
          backgroundColor: '#232e3c',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '36px 24px',
          textAlign: 'center',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.35)',
        }}
      >
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(36, 161, 222, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64b5ef',
            }}
          >
            <IconZap size={32} />
          </div>
        </div>

        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#64b5ef',
            backgroundColor: 'rgba(100, 181, 239, 0.15)',
            padding: '4px 10px',
            borderRadius: '6px',
            letterSpacing: '0.6px',
            textTransform: 'uppercase',
          }}
        >
          TELEGRAM MINI APP
        </span>

        <h1 style={{ fontSize: '22px', fontWeight: 700, marginTop: '14px', marginBottom: '8px', color: '#ffffff' }}>
          Alpha Cut Control Panel
        </h1>

        <p style={{ fontSize: '13.5px', color: '#708499', lineHeight: 1.6, marginBottom: '28px' }}>
          This interface is customized specifically for Telegram. Open it directly inside the <strong>Alpha Cut Bot (@alpha_cut_bot)</strong> to access your workspace.
        </p>

        <div style={{ display: 'grid', gap: '10px' }}>
          <a href={MINI_APP_URL} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <button
              type="button"
              style={{
                width: '100%',
                height: '46px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: '#5288c1',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <span>Open in Telegram</span>
              <IconExternalLink size={16} />
            </button>
          </a>

          <a href="https://alpha-cut.com/dashboard" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <button
              type="button"
              style={{
                width: '100%',
                height: '44px',
                borderRadius: '10px',
                border: '1px solid rgba(120, 120, 128, 0.2)',
                backgroundColor: 'transparent',
                color: '#64b5ef',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Open Web Dashboard
            </button>
          </a>
        </div>

        <div
          style={{
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(120, 120, 128, 0.15)',
            fontSize: '12px',
            color: '#708499',
          }}
        >
          Requires Telegram WebApp SDK context for identity verification.
        </div>
      </div>
    </div>
  );
};
