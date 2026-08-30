import React, { useState } from 'react';
import { User, Project, Contract } from '../../../types';
import { triggerHaptic, triggerHapticNotification } from '../../../utils/telegramSdk';
import { IconExternalLink } from '@icons/icons';

interface TelegramProfileViewProps {
  user: User;
  telegramUser?: any;
  projects: Project[];
  contracts: Contract[];
  onUnlinkAccount: () => Promise<boolean>;
}

export const TelegramProfileView: React.FC<TelegramProfileViewProps> = ({
  user,
  telegramUser,
  projects,
  contracts,
  onUnlinkAccount,
}) => {
  const [unlinking, setUnlinking] = useState(false);
  const [confirmUnlink, setConfirmUnlink] = useState(false);

  const handleUnlink = async () => {
    if (!confirmUnlink) {
      setConfirmUnlink(true);
      triggerHaptic('medium');
      return;
    }

    try {
      setUnlinking(true);
      triggerHaptic('heavy');
      await onUnlinkAccount();
      triggerHapticNotification('success');
    } catch (err) {
      triggerHapticNotification('error');
    } finally {
      setUnlinking(false);
    }
  };

  const activeProjectsCount = (projects || []).filter((p) => p && (p.status === 'in_progress' || p.status === 'revision_requested')).length;
  const completedProjectsCount = (projects || []).filter((p) => p && p.status === 'completed').length;
  const safeContractsCount = (contracts || []).length;

  const totalSpentUSD = (projects || [])
    .filter((p) => p && (p.status === 'completed' || p.status === 'in_progress' || p.status === 'delivered'))
    .concat((contracts || []).filter((c) => c && c.status !== 'declined'))
    .reduce((sum, item: any) => sum + (item.currency === 'USD' ? (item.price || item.monthlyPrice || 0) : 0), 0);

  const totalSpentETB = (projects || [])
    .filter((p) => p && (p.status === 'completed' || p.status === 'in_progress' || p.status === 'delivered'))
    .concat((contracts || []).filter((c) => c && c.status !== 'declined'))
    .reduce((sum, item: any) => sum + (item.currency === 'ETB' ? (item.price || item.monthlyPrice || 0) : 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Profile Header Row */}
      <div
        style={{
          backgroundColor: 'var(--tg-theme-secondary-bg-color, var(--tg-secondary-bg, #232e3c))',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}
      >
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name || 'User'}
            style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--tg-theme-button-color, var(--tg-button, #5288c1))',
              color: 'var(--tg-theme-button-text-color, var(--tg-button-text, #ffffff))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '18px',
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
          </div>
        )}

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--tg-theme-text-color, var(--tg-text, #ffffff))', margin: 0 }}>
              {user?.name || 'Client Account'}
            </h2>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--tg-theme-link-color, var(--tg-link, #64b5ef))',
                backgroundColor: 'rgba(120, 120, 128, 0.12)',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              {(user?.role || 'CLIENT').toUpperCase()}
            </span>
          </div>
          <span style={{ fontSize: '13px', color: 'var(--tg-theme-hint-color, var(--tg-hint, #708499))', display: 'block', marginTop: '2px' }}>
            {user?.email || ''}
          </span>
        </div>
      </div>

      {/* Section 1: Telegram Native Grouped List — Workspace Metrics */}
      <div>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 600,
            textTransform: 'uppercase',
            color: 'var(--tg-theme-hint-color, var(--tg-hint, #708499))',
            marginBottom: '6px',
            paddingLeft: '8px',
            letterSpacing: '0.4px',
          }}
        >
          WORKSPACE SUMMARY
        </div>

        <div
          style={{
            backgroundColor: 'var(--tg-theme-secondary-bg-color, var(--tg-secondary-bg, #232e3c))',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              borderBottom: '1px solid rgba(120, 120, 128, 0.15)',
              fontSize: '14px',
            }}
          >
            <span style={{ color: 'var(--tg-theme-text-color, var(--tg-text, #ffffff))' }}>Active Video Edits</span>
            <strong style={{ color: 'var(--tg-theme-link-color, var(--tg-link, #64b5ef))' }}>{activeProjectsCount}</strong>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              borderBottom: '1px solid rgba(120, 120, 128, 0.15)',
              fontSize: '14px',
            }}
          >
            <span style={{ color: 'var(--tg-theme-text-color, var(--tg-text, #ffffff))' }}>Retainer Contracts</span>
            <strong style={{ color: 'var(--tg-theme-text-color, var(--tg-text, #ffffff))' }}>{safeContractsCount}</strong>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              fontSize: '14px',
            }}
          >
            <span style={{ color: 'var(--tg-theme-text-color, var(--tg-text, #ffffff))' }}>Completed Edits</span>
            <strong style={{ color: '#34c759' }}>{completedProjectsCount}</strong>
          </div>
        </div>
      </div>

      {/* Section 2: Investment & Spending Analytics */}
      <div>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 600,
            textTransform: 'uppercase',
            color: 'var(--tg-theme-hint-color, var(--tg-hint, #708499))',
            marginBottom: '6px',
            paddingLeft: '8px',
            letterSpacing: '0.4px',
          }}
        >
          TOTAL INVESTMENT WITH ALPHA CUT
        </div>

        <div
          style={{
            backgroundColor: 'var(--tg-theme-secondary-bg-color, var(--tg-secondary-bg, #232e3c))',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              borderBottom: '1px solid rgba(120, 120, 128, 0.15)',
              fontSize: '14px',
            }}
          >
            <span style={{ color: 'var(--tg-theme-text-color, var(--tg-text, #ffffff))' }}>Total USD Spent</span>
            <strong style={{ color: '#34c759', fontSize: '15px' }}>
              ${totalSpentUSD.toLocaleString()} USD
            </strong>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              fontSize: '14px',
            }}
          >
            <span style={{ color: 'var(--tg-theme-text-color, var(--tg-text, #ffffff))' }}>Total ETB Spent</span>
            <strong style={{ color: 'var(--tg-theme-link-color, var(--tg-link, #64b5ef))', fontSize: '15px' }}>
              {totalSpentETB.toLocaleString()} ETB
            </strong>
          </div>
        </div>
      </div>

      {/* Section 2: Telegram Native Grouped List — Link Info & Controls */}
      <div>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 600,
            textTransform: 'uppercase',
            color: 'var(--tg-theme-hint-color, var(--tg-hint, #708499))',
            marginBottom: '6px',
            paddingLeft: '8px',
            letterSpacing: '0.4px',
          }}
        >
          TELEGRAM CONNECTION
        </div>

        <div
          style={{
            backgroundColor: 'var(--tg-theme-secondary-bg-color, var(--tg-secondary-bg, #232e3c))',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              borderBottom: '1px solid rgba(120, 120, 128, 0.15)',
              fontSize: '14px',
            }}
          >
            <span style={{ color: 'var(--tg-theme-text-color, var(--tg-text, #ffffff))' }}>Connected Profile</span>
            <span style={{ color: 'var(--tg-theme-link-color, var(--tg-link, #64b5ef))', fontWeight: 500 }}>
              {telegramUser?.username ? `@${telegramUser.username}` : user.telegramChatId ? `ID: ${user.telegramChatId}` : 'Connected'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleUnlink}
            disabled={unlinking}
            style={{
              width: '100%',
              padding: '14px 16px',
              border: 'none',
              backgroundColor: 'transparent',
              color: confirmUnlink ? '#ff3b30' : 'var(--tg-theme-text-color, var(--tg-text, #ffffff))',
              fontWeight: 500,
              fontSize: '14px',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            {unlinking ? 'Disconnecting...' : confirmUnlink ? 'Tap again to Confirm Disconnect' : 'Disconnect Telegram Account'}
          </button>
        </div>
      </div>

      {/* Full Web Workspace Button */}
      <div style={{ marginTop: '8px' }}>
        <a
          href="https://alpha-cut.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none' }}
        >
          <button
            type="button"
            style={{
              width: '100%',
              height: '46px',
              borderRadius: '12px',
              border: '1px solid rgba(120, 120, 128, 0.2)',
              backgroundColor: 'transparent',
              color: 'var(--tg-theme-link-color, var(--tg-link, #64b5ef))',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span>Open Full Web Dashboard</span>
            <IconExternalLink size={16} />
          </button>
        </a>
      </div>
    </div>
  );
};
