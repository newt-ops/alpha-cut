import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { ClientSidebar } from './ClientSidebar';
import { useAuth } from '@context/AuthContext';
import { useTheme } from '@context/ThemeContext';
import { Logo } from '@components/ui/Logo';
import { Badge } from '@components/ui/Badge';
import {
  IconSun,
  IconMoon,
  IconMenu,
  IconClose,
  IconBell,
  IconUser,
  IconClock,
  IconCheck,
  IconTelegram,
} from '@icons/icons';

interface ClientLayoutProps {
  activeTab?: string;
  onChangeTab: (tabId: string) => void;
  notifications?: any[];
  onMarkAllNotificationsRead?: () => void;
  children: ReactNode;
}

export const ClientLayout: React.FC<ClientLayoutProps> = ({
  activeTab = 'overview',
  onChangeTab,
  notifications = [],
  onMarkAllNotificationsRead = () => {},
  children,
}) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const notifContainerRef = useRef<HTMLDivElement>(null);
  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifContainerRef.current && !notifContainerRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTab = (tabId: string) => {
    onChangeTab(tabId);
    if (isMobile) setMobileOpen(false);
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--bg)',
        color: 'var(--ink)',
        position: 'relative',
      }}
    >
      {/* Desktop Sidebar */}
      {!isMobile && (
        <ClientSidebar
          activeTab={activeTab}
          onChangeTab={handleSelectTab}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
        />
      )}

      {/* Mobile Drawer Overlay */}
      {isMobile && mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
          }}
          onClick={() => setMobileOpen(false)}
        >
          <div
            style={{
              width: '280px',
              height: '100%',
              backgroundColor: 'var(--surface)',
              borderRight: '1px solid var(--line)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid var(--line)',
                backgroundColor: 'var(--bg)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '1px solid var(--accent-gold)',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(201, 160, 107, 0.2)',
                      border: '1px solid var(--accent-gold)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-gold)',
                      fontWeight: 800,
                      fontSize: '14px',
                    }}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
                  </div>
                )}
                <div>
                  <strong style={{ fontSize: '13.5px', color: 'var(--ink)', display: 'block', lineHeight: 1.2 }}>
                    {user?.name || 'Client Workspace'}
                  </strong>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--ink-soft)', cursor: 'pointer', padding: '4px' }}
              >
                <IconClose size={20} />
              </button>
            </div>
            <ClientSidebar
              activeTab={activeTab}
              onChangeTab={handleSelectTab}
              collapsed={false}
              onToggleCollapse={() => {}}
              isMobileDrawer
            />
          </div>
        </div>
      )}

      {/* Main Client Content Shell */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header Bar */}
        <header
          style={{
            height: isMobile ? '60px' : '68px',
            backgroundColor: 'var(--surface)',
            borderBottom: '1px solid rgba(201, 160, 107, 0.2)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: isMobile ? '0 12px' : '0 24px',
            position: 'sticky',
            top: 0,
            zIndex: 80,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px' }}>
            {isMobile && (
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                style={{
                  backgroundColor: 'var(--bg)',
                  border: '1px solid var(--line)',
                  color: 'var(--accent-gold)',
                  cursor: 'pointer',
                  width: '34px',
                  height: '34px',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Open Studio Menu"
              >
                <IconMenu size={18} />
              </button>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {!isMobile && (
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>
                  Welcome back, {user?.name || 'Client'}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '12px' }}>
            {/* Notifications Dropdown */}
            <div ref={notifContainerRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                style={{
                  backgroundColor: 'var(--bg)',
                  border: '1px solid var(--line)',
                  color: 'var(--ink)',
                  width: isMobile ? '34px' : '38px',
                  height: isMobile ? '34px' : '38px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                }}
                title="Notifications"
              >
                <IconBell size={isMobile ? 16 : 18} />
                {unreadNotifCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-2px',
                      backgroundColor: '#EF4444',
                      color: '#FFF',
                      fontSize: '9px',
                      fontWeight: 800,
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {notifDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '44px',
                    right: 0,
                    width: isMobile ? '280px' : '320px',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 100,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      padding: '14px 16px',
                      borderBottom: '1px solid var(--line)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>Notifications</strong>
                    {unreadNotifCount > 0 && (
                      <button
                        type="button"
                        onClick={onMarkAllNotificationsRead}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent-gold)',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', fontSize: '12px', color: 'var(--ink-soft)' }}>
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid var(--line)',
                            backgroundColor: n.read ? 'transparent' : 'rgba(201, 160, 107, 0.06)',
                          }}
                        >
                          <p style={{ fontSize: '12.5px', color: 'var(--ink)', margin: 0, fontWeight: n.read ? 400 : 600 }}>
                            {n.message}
                          </p>
                          <span style={{ fontSize: '10.5px', color: 'var(--ink-soft)', display: 'block', marginTop: '4px' }}>
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              style={{
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--line)',
                color: 'var(--ink)',
                width: isMobile ? '34px' : '38px',
                height: isMobile ? '34px' : '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            >
              {theme === 'dark' ? <IconSun size={isMobile ? 16 : 18} /> : <IconMoon size={isMobile ? 16 : 18} />}
            </button>

            {/* User Profile Avatar */}
            <div
              onClick={() => onChangeTab('profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                padding: isMobile ? '2px' : '4px 8px',
                borderRadius: '100px',
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--line)',
              }}
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user?.name || 'User'}
                  style={{
                    width: isMobile ? '28px' : '30px',
                    height: isMobile ? '28px' : '30px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '1px solid var(--accent-gold)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: isMobile ? '28px' : '30px',
                    height: isMobile ? '28px' : '30px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(201, 160, 107, 0.2)',
                    border: '1px solid var(--accent-gold)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-gold)',
                    fontWeight: 800,
                    fontSize: '12px',
                  }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
                </div>
              )}
              {!isMobile && (
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)' }}>
                  {user?.name?.split(' ')[0] || 'Client'}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Main Body Content */}
        <main style={{ flex: 1, padding: '32px 36px', width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
          {children}
        </main>
      </div>
    </div>
  );
};
