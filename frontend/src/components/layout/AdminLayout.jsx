import React, { useState, useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { useAuth } from '@context/AuthContext';
import { useTheme } from '@context/ThemeContext';
import { IconSun, IconMoon, IconMenu, IconClose } from '@icons/icons';

export const AdminLayout = ({ activeTab, onChangeTab, children }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSelectTab = (tabId) => {
    onChangeTab(tabId);
    if (isMobile) setMobileOpen(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg)', color: 'var(--ink)' }}>
      {/* Desktop Persistent Sidebar */}
      {!isMobile && (
        <AdminSidebar
          activeTab={activeTab}
          onChangeTab={handleSelectTab}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
        />
      )}

      {/* Mobile Drawer Overlay */}
      {isMobile && mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex' }}>
          <div
            onClick={() => setMobileOpen(false)}
            style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          />
          <div
            style={{
              position: 'relative',
              zIndex: 1001,
              width: '280px',
              maxWidth: '85vw',
              height: '100%',
              backgroundColor: 'var(--surface)',
              borderRight: '1px solid var(--line)',
              boxShadow: 'var(--shadow)',
            }}
          >
            <div style={{ padding: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setMobileOpen(false)}
                style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg)', border: '1px solid var(--line)', color: 'var(--ink)' }}
              >
                <IconClose size={20} />
              </button>
            </div>
            <AdminSidebar
              activeTab={activeTab}
              onChangeTab={handleSelectTab}
              collapsed={false}
              isMobileDrawer
            />
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflowY: 'auto' }}>
        {/* Top ERP Application Header */}
        <header
          style={{
            height: isMobile ? '68px' : '84px',
            backgroundColor: 'var(--surface)',
            borderBottom: '1px solid var(--line)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: isMobile ? '12px 16px' : '20px 40px',
            position: 'sticky',
            top: 0,
            zIndex: 80,
            boxShadow: 'var(--shadow-sm)',
            transition: 'all var(--transition-normal)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isMobile && (
              <button
                onClick={() => setMobileOpen(true)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg)',
                  border: '1px solid var(--line)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-gold)',
                  cursor: 'pointer',
                }}
                title="Open Navigation Menu"
              >
                <IconMenu size={22} />
              </button>
            )}

            <div>
              <span className="font-mono" style={{ fontSize: '9px', color: 'var(--accent-gold)', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
                AGENCY CONTROL PORTAL
              </span>
              <h1 className="font-display" style={{ fontSize: isMobile ? '16px' : '22px', marginTop: '2px', color: 'var(--ink)', fontWeight: 800 }}>
                Alpha Cut ERP
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '20px' }}>
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

            {/* Clean Admin User Profile Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-lg)',
                padding: '4px 10px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user?.name}
                  style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--accent-gold)' }}
                />
              ) : (
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(201, 160, 107, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-gold)',
                    fontWeight: 700,
                    fontSize: '12px',
                  }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>
              )}
              {!isMobile && (
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.2 }}>{user?.name || 'Alpha Cut'}</div>
                  <div style={{ fontSize: '11px', color: 'var(--ink-soft)', lineHeight: 1.2 }}>{user?.email || 'alphacutagency@gmail.com'}</div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Dashboard Content Workspace */}
        <main style={{ flex: 1, padding: isMobile ? '20px 14px' : '40px', maxWidth: '1440px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          {children}
        </main>
      </div>
    </div>
  );
};
