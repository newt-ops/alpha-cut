import React, { useState } from 'react';
import { User, Project, Contract } from '../../types';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { triggerHaptic, triggerHapticNotification } from '../../utils/telegramSdk';
import { IconUser, IconShield, IconExternalLink, IconZap, IconFilm, IconCheck } from '@icons/icons';

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

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      {/* Profile Header */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          borderRadius: '16px',
          border: '1px solid var(--line)',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}
      >
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name || 'User'}
            style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-gold)' }}
          />
        ) : (
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: 'rgba(201,168,76,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-gold)',
              fontWeight: 800,
              fontSize: '20px',
              border: '2px solid var(--accent-gold)',
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 className="font-display" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)' }}>
              {user?.name || 'Client Account'}
            </h2>
            <Badge variant="gold" size="small">{(user?.role || 'CLIENT').toUpperCase()}</Badge>
          </div>
          <span style={{ fontSize: '13px', color: 'var(--ink-soft)', display: 'block', marginTop: '2px' }}>
            {user?.email || ''}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        <div style={{ backgroundColor: 'var(--surface)', padding: '12px', borderRadius: '12px', border: '1px solid var(--line)', textAlign: 'center' }}>
          <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-gold)', display: 'block' }}>
            {activeProjectsCount}
          </span>
          <span style={{ fontSize: '10px', color: 'var(--ink-soft)', textTransform: 'uppercase', fontWeight: 600 }}>Active Edits</span>
        </div>
        <div style={{ backgroundColor: 'var(--surface)', padding: '12px', borderRadius: '12px', border: '1px solid var(--line)', textAlign: 'center' }}>
          <span style={{ fontSize: '20px', fontWeight: 800, color: '#24A1DE', display: 'block' }}>
            {safeContractsCount}
          </span>
          <span style={{ fontSize: '10px', color: 'var(--ink-soft)', textTransform: 'uppercase', fontWeight: 600 }}>Retainers</span>
        </div>
        <div style={{ backgroundColor: 'var(--surface)', padding: '12px', borderRadius: '12px', border: '1px solid var(--line)', textAlign: 'center' }}>
          <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--success, #22c55e)', display: 'block' }}>
            {completedProjectsCount}
          </span>
          <span style={{ fontSize: '10px', color: 'var(--ink-soft)', textTransform: 'uppercase', fontWeight: 600 }}>Completed</span>
        </div>
      </div>

      {/* Connection Info */}
      <div style={{ backgroundColor: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--line)', padding: '16px' }}>
        <h3 className="font-display" style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--ink)' }}>
          Telegram Link Status
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
          <span style={{ color: 'var(--ink-soft)' }}>Connected Account:</span>
          <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>
            {telegramUser?.username ? `@${telegramUser.username}` : user.telegramChatId ? `Chat ID: ${user.telegramChatId}` : 'Connected'}
          </span>
        </div>
      </div>

      {/* Web Platform & Unlink Buttons */}
      <div style={{ display: 'grid', gap: '10px', marginTop: '8px' }}>
        <a href="https://alpha-cut.com/dashboard" target="_blank" rel="noopener noreferrer">
          <Button variant="secondary" fullWidth iconRight={IconExternalLink}>
            Open Full Web Dashboard
          </Button>
        </a>

        <Button
          variant={confirmUnlink ? 'danger' : 'ghost'}
          fullWidth
          isLoading={unlinking}
          onClick={handleUnlink}
          style={{ color: confirmUnlink ? '#ffffff' : 'var(--ink-soft)' }}
        >
          {confirmUnlink ? 'Tap again to confirm Disconnect' : 'Disconnect Telegram Account'}
        </Button>
      </div>
    </div>
  );
};
