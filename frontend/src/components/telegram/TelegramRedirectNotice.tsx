import React from 'react';
import { Logo } from '@components/ui/Logo';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { IconTelegram, IconExternalLink, IconShield, IconLock } from '@components/icons/icons';

export const TelegramRedirectNotice: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: 'var(--bg)',
        color: 'var(--ink)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          maxWidth: '460px',
          width: '100%',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius-lg)',
          padding: '40px 28px',
          boxShadow: 'var(--shadow)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div style={{ marginBottom: '24px' }}>
          <Logo size="large" showText={false} />
        </div>

        <Badge variant="gold" size="medium" className="mb-4">
          <IconShield size={12} color="var(--accent-gold)" /> TELEGRAM EXCLUSIVE
        </Badge>

        <h1
          className="font-display"
          style={{
            fontSize: '24px',
            fontWeight: 800,
            color: 'var(--ink)',
            marginBottom: '12px',
            lineHeight: 1.25,
            letterSpacing: '-0.02em',
          }}
        >
          This App Runs Inside Telegram
        </h1>

        <p
          style={{
            fontSize: '14px',
            color: 'var(--ink-soft)',
            lineHeight: 1.6,
            marginBottom: '32px',
          }}
        >
          The Alpha Cut Mini App workspace is designed to run seamlessly within Telegram. Open it from our official bot to access your video editing pipeline, retainer contracts, and instant status updates.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          <a
            href="https://t.me/alpha_cut_bot"
            target="_blank"
            rel="noopener noreferrer"
            style={{ width: '100%', textDecoration: 'none' }}
          >
            <Button
              variant="primary"
              size="large"
              fullWidth
              iconLeft={IconTelegram}
            >
              Open in Telegram Bot
            </Button>
          </a>

          <a
            href="https://alpha-cut.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ width: '100%', textDecoration: 'none' }}
          >
            <Button
              variant="secondary"
              size="medium"
              fullWidth
              iconLeft={IconExternalLink}
            >
              Open Main Web Dashboard
            </Button>
          </a>
        </div>

        <div
          style={{
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid var(--line)',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '11px',
            color: 'var(--ink-soft)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <IconLock size={13} color="var(--accent-gold)" />
          <span>SSL ENCRYPTED · TELEGRAM INITDATA VERIFIED</span>
        </div>
      </div>
    </div>
  );
};
