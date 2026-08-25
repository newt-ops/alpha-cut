import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from './Badge';
import { IconCheck, IconZap, IconInfo, IconFileText, IconDollar, IconStar, IconFilm } from '@icons/icons';

export interface NotificationItem {
  _id: string;
  userId: string;
  type?: string;
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
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return 'Just now';
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

  const getCategoryIcon = (type?: string, msg: string = '') => {
    const text = (type || msg).toLowerCase();
    if (text.includes('proposal') || text.includes('contract')) return <IconFileText size={16} color="var(--accent-gold)" />;
    if (text.includes('payment') || text.includes('invoice') || text.includes('$')) return <IconDollar size={16} color="var(--accent-gold)" />;
    if (text.includes('review') || text.includes('rating') || text.includes('star')) return <IconStar size={16} color="var(--accent-gold)" filled />;
    if (text.includes('video') || text.includes('render') || text.includes('deliverable')) return <IconFilm size={16} color="var(--accent-gold)" />;
    return <IconZap size={16} color="var(--accent-gold)" />;
  };

  return (
    <div
      style={{
        width: '360px',
        maxWidth: '92vw',
        backgroundColor: 'var(--surface)',
        border: '1.5px solid var(--line)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.4)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
      className="notification-list-popover"
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 18px',
          borderBottom: '1px solid var(--line)',
          backgroundColor: 'var(--bg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h4 className="font-display" style={{ fontSize: '16px', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
              Activity Notifications
            </h4>
            {unreadCount > 0 && <Badge variant="gold" size="small">{unreadCount} Unread</Badge>}
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllRead}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-gold)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '6px',
              }}
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Filter Switcher */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            onClick={() => setFilter('all')}
            style={{
              flex: 1,
              padding: '6px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: filter === 'all' ? 'rgba(201, 160, 107, 0.15)' : 'transparent',
              color: filter === 'all' ? 'var(--accent-gold)' : 'var(--ink-soft)',
            }}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            style={{
              flex: 1,
              padding: '6px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: filter === 'unread' ? 'rgba(201, 160, 107, 0.15)' : 'transparent',
              color: filter === 'unread' ? 'var(--accent-gold)' : 'var(--ink-soft)',
            }}
          >
            Unread ({unreadCount})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div style={{ maxHeight: '340px', overflowY: 'auto', padding: '10px' }}>
        {loading ? (
          <div style={{ padding: '28px', textAlign: 'center', color: 'var(--ink-soft)', fontSize: '13px' }}>
            Updating system activity...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--ink-soft)' }}>
            <IconZap size={28} color="var(--accent-gold)" style={{ opacity: 0.7, marginBottom: '10px' }} />
            <p style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--ink)', margin: '0 0 4px 0' }}>
              All Caught Up!
            </p>
            <p style={{ fontSize: '12px', margin: 0 }}>No new notifications at this time.</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredNotifications.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                onClick={() => !item.read && onMarkRead(item._id)}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: item.read ? 'transparent' : 'rgba(201, 160, 107, 0.1)',
                  border: `1px solid ${item.read ? 'var(--line)' : 'rgba(201, 160, 107, 0.3)'}`,
                  marginBottom: '8px',
                  cursor: item.read ? 'default' : 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--bg)',
                      border: '1px solid var(--line)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {getCategoryIcon(item.type, item.message)}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 700 }}>
                        {formatTimeAgo(item.createdAt)}
                      </span>
                      {!item.read && (
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--accent-gold)',
                            boxShadow: '0 0 8px var(--accent-gold)',
                          }}
                        />
                      )}
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--ink)', margin: 0, lineHeight: 1.45, fontWeight: item.read ? 400 : 600 }}>
                      {item.message}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
