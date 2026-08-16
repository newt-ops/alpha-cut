import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { Badge } from '@components/ui/Badge';
import { useAuth } from '@context/AuthContext';

export const AdminLayout = ({ activeTab, onChangeTab, children }) => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      <AdminSidebar
        activeTab={activeTab}
        onChangeTab={onChangeTab}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top ERP Application Header */}
        <header
          style={{
            height: '70px',
            backgroundColor: 'var(--surface)',
            borderBottom: '1px solid var(--line)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px',
            position: 'sticky',
            top: 0,
            zIndex: 80,
          }}
        >
          <div>
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>
              SAAS CONTROL PORTAL
            </span>
            <h1 className="font-display" style={{ fontSize: '20px', marginTop: '2px' }}>
              Alpha Cut Executive ERP
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Badge variant="maroon">Agency Admin</Badge>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>{user?.name || 'Admin'}</div>
              <div style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>{user?.email}</div>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content Workspace */}
        <main style={{ flex: 1, padding: '32px', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
};
