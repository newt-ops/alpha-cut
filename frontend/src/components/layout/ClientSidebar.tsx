import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@components/ui/Badge';
import {
  IconBarChart,
  IconFolder,
  IconFileText,
  IconCalendar,
  IconStar,
  IconUser,
  IconExternalLink,
  IconMenu,
} from '@icons/icons';
import { Logo } from '@components/ui/Logo';

export interface ClientSidebarProps {
  activeTab: string;
  onChangeTab: (tabId: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  isMobileDrawer?: boolean;
}

export const ClientSidebar: React.FC<ClientSidebarProps> = ({
  activeTab,
  onChangeTab,
  collapsed,
  onToggleCollapse,
  isMobileDrawer = false,
}) => {
  const menuItems = [
    { id: 'overview', label: 'Studio Overview', icon: IconBarChart },
    { id: 'projects', label: 'Projects & Proposals', icon: IconFolder },
    { id: 'contracts', label: 'Retainer Contracts', icon: IconFileText },
    { id: 'calendar', label: 'Delivery Schedule', icon: IconCalendar },
    { id: 'ratings', label: 'My Reviews', icon: IconStar },
    { id: 'profile', label: 'Account & Telegram', icon: IconUser },
  ];

  return (
    <aside
      style={{
        width: isMobileDrawer ? '100%' : collapsed ? '80px' : '260px',
        backgroundColor: 'var(--surface)',
        color: 'var(--ink)',
        borderRight: isMobileDrawer ? 'none' : '1px solid var(--line)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'width var(--transition-normal), background-color var(--transition-normal)',
        padding: '24px 16px',
        position: isMobileDrawer ? 'relative' : 'sticky',
        top: 0,
        height: isMobileDrawer ? 'calc(100% - 60px)' : '100vh',
        zIndex: 90,
        overflowY: 'auto',
      }}
    >
      <div>
        {/* Brand Header & Collapse Toggle (Hidden in mobile drawer) */}
        {!isMobileDrawer && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'space-between',
              marginBottom: '32px',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--line)',
            }}
          >
            {!collapsed && (
              <div>
                <span
                  className="font-mono"
                  style={{
                    fontSize: '10px',
                    color: 'var(--accent-gold)',
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  CLIENT PORTAL
                </span>
                <Logo size="small" />
              </div>
            )}
            <button
              type="button"
              onClick={onToggleCollapse}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-gold)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <IconMenu size={20} />
            </button>
          </div>
        )}

        {/* Sidebar Nav Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  width: '100%',
                  padding: collapsed ? '12px 0' : '12px 16px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isActive ? 'rgba(201, 160, 107, 0.18)' : 'transparent',
                  color: isActive ? 'var(--accent-gold)' : 'var(--ink-soft)',
                  border: isActive ? '1px solid var(--accent-gold)' : '1px solid transparent',
                  cursor: 'pointer',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '14px',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <Icon size={18} color={isActive ? 'var(--accent-gold)' : 'var(--ink-soft)'} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer link to public site */}
      <div style={{ paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
        <a
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: 'var(--ink-soft)',
            fontSize: '13px',
            textDecoration: 'none',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: '10px 12px',
            borderRadius: 'var(--radius-md)',
            transition: 'color var(--transition-fast)',
          }}
        >
          <IconExternalLink size={16} />
          {!collapsed && <span>Exit to Main Site</span>}
        </a>
      </div>
    </aside>
  );
};
