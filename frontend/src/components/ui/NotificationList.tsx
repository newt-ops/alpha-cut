import React from 'react';
import { Badge } from './Badge';
import { Button } from './Button';
import { IconCheck, IconZap } from '@icons/icons';

export interface NotificationItem {
  _id: string;
  userId: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationListProps {
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClose?: () => void;
  loading?: boolean;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onClose,
  loading = false,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      style={{
        width: '340px',
        maxWidth: '90vw',
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
      className="notification-list-popover"
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid var(--line)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h4 className="font-display" style={{ fontSize: '15px', color: 'var(--ink)', margin: 0 }}>
            Notifications
          </h4>
          {unreadCount > 0 && <Badge variant="gold" size="small">{unreadCount} New</Badge>}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-gold)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Body List */}
      <div style={{ maxHeight: '320px', overflowY: 'auto', padding: '8px' }}>
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--ink-soft)', fontSize: '13px' }}>
            Loading updates...
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--ink-soft)' }}>
            <IconZap size={24} color="var(--accent-gold)" style={{ opacity: 0.6, marginBottom: '8px' }} />
            <p style={{ fontSize: '13px', margin: 0 }}>You are all caught up! No notifications.</p>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item._id}
              onClick={() => !item.read && onMarkRead(item._id)}
              style={{
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: item.read ? 'transparent' : 'rgba(201, 160, 107, 0.08)',
                border: `1px solid ${item.read ? 'transparent' : 'rgba(201, 160, 107, 0.2)'}`,
                marginBottom: '4px',
                cursor: item.read ? 'default' : 'pointer',
                transition: 'background-color var(--transition-fast)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>
                  {formatTimeAgo(item.createdAt)}
                </span>
                {!item.read && (
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent-gold)',
                    }}
                  />
                )}
              </div>
              <p style={{ fontSize: '13px', color: 'var(--ink)', margin: 0, lineHeight: 1.4, fontWeight: item.read ? 400 : 600 }}>
                {item.message}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
