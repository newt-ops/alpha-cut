import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@components/ui/Badge';
import {
  IconBarChart,
  IconFolder,
  IconPlus,
  IconUsers,
  IconFilm,
  IconStar,
  IconSettings,
  IconExternalLink,
  IconMenu,
  IconCalendar,
} from '@icons/icons';

export const AdminSidebar = ({ activeTab, onChangeTab, collapsed, onToggleCollapse }) => {
  const menuItems = [
    { id: 'overview', label: 'Analytics & Revenue', icon: IconBarChart },
    { id: 'board', label: 'Proposals & Projects', icon: IconFolder },
    { id: 'calendar', label: 'Calendar Schedule', icon: IconCalendar },
    { id: 'proposal', label: 'Create Proposal', icon: IconPlus },
    { id: 'clients', label: 'Registered Clients', icon: IconUsers },
    { id: 'portfolio', label: 'Portfolio Showcase', icon: IconFilm },
    { id: 'moderation', label: 'Reviews & Moderation', icon: IconStar },
    { id: 'pricing', label: 'Package Settings', icon: IconSettings },
  ];

  return (
    <aside
      style={{
        width: collapsed ? '80px' : '260px',
        backgroundColor: 'var(--surface)',
        color: 'var(--ink)',
        borderRight: '1px solid var(--line)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'width var(--transition-normal), background-color var(--transition-normal)',
        padding: '24px 16px',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 90,
      }}
    >
      <div>
        {/* Brand Header & Collapse Toggle */}
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
              <span className="font-mono" style={{ fontSize: '10px', color: 'var(--accent-gold)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                AGENCY ERP
              </span>
              <h2 className="font-display" style={{ fontSize: '20px', color: 'var(--ink)', marginTop: '2px' }}>
                Alpha Cut
              </h2>
            </div>
          )}
          <button
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

        {/* Sidebar Nav Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
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

      {/* Exit to Public Site Footer */}
      <div style={{ paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
        <Link
          to="/"
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
          {!collapsed && <span>Exit to Public Site</span>}
        </Link>
      </div>
    </aside>
  );
};
