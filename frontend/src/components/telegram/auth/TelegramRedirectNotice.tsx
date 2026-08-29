import React from 'react';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
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
        backgroundColor: 'var(--bg)',
        color: 'var(--ink)',
        padding: '24px 16px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          maxWidth: '440px',
          width: '100%',
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--line)',
          padding: '36px 28px',
          textAlign: 'center',
          boxShadow: 'var(--shadow)',
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
              color: '#24A1DE',
            }}
          >
            <IconZap size={32} />
          </div>
        </div>

        <Badge variant="gold" size="small">TELEGRAM MINI APP</Badge>

        <h1 className="font-display" style={{ fontSize: '24px', marginTop: '12px', marginBottom: '8px' }}>
          Alpha Cut Control Panel
        </h1>

        <p style={{ fontSize: '14px', color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: '28px' }}>
          This application is designed to run inside Telegram. Open it directly from the <strong>Alpha Cut Bot</strong> to access your workspace.
        </p>

        <div style={{ display: 'grid', gap: '12px' }}>
          <a href={MINI_APP_URL} target="_blank" rel="noopener noreferrer">
            <Button variant="telegram" fullWidth size="large" iconRight={IconExternalLink}>
              Open in Telegram
            </Button>
          </a>

          <a href="https://alpha-cut.com/dashboard" target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" fullWidth size="medium">
              Open Main Web Dashboard
            </Button>
          </a>
        </div>

        <div
          style={{
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid var(--line)',
            fontSize: '12px',
            color: 'var(--ink-soft)',
          }}
        >
          Requires Telegram WebApp SDK context for identity verification.
        </div>
      </div>
    </div>
  );
};
