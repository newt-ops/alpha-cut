import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { Badge } from '@components/ui/Badge';
import { useAuth } from '@context/AuthContext';
import { useTheme } from '@context/ThemeContext';
import { IconSun, IconMoon } from '@icons/icons';

export const AdminLayout = ({ activeTab, onChangeTab, children }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg)', color: 'var(--ink)' }}>
      <AdminSidebar
        activeTab={activeTab}
        onChangeTab={onChangeTab}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflowY: 'auto' }}>
        {/* Top ERP Application Header */}
        <header
          style={{
            height: '84px',
            backgroundColor: 'var(--surface)',
            borderBottom: '1px solid var(--line)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 40px',
            position: 'sticky',
            top: 0,
            zIndex: 80,
            boxShadow: 'var(--shadow-sm)',
            transition: 'background-color var(--transition-normal)',
          }}
        >
          <div>
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              AGENCY CONTROL PORTAL
            </span>
            <h1 className="font-display" style={{ fontSize: '22px', marginTop: '4px', color: 'var(--ink)', fontWeight: 800 }}>
              Alpha Cut Executive ERP
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {/* Theme Switcher Toggle */}
            <button
              onClick={toggleTheme}
              style={{
                background: 'none',
                border: '1px solid var(--line)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--accent-gold)',
                backgroundColor: 'var(--bg)',
                transition: 'all var(--transition-fast)',
                boxShadow: 'var(--shadow-sm)',
              }}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <Badge variant="maroon">Agency Admin</Badge>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>{user?.name || 'Admin'}</div>
                <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>{user?.email}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content Workspace */}
        <main style={{ flex: 1, padding: '40px', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
};
