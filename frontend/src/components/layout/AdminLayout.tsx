import React, { useState, useEffect, useRef, useMemo, ReactNode } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { useAuth } from '@context/AuthContext';
import { useTheme } from '@context/ThemeContext';
import {
  IconSun,
  IconMoon,
  IconMenu,
  IconClose,
  IconSearch,
  IconSparkles,
  IconUser,
  IconFileText,
  IconClock,
  IconChevronRight,
} from '@icons/icons';

interface AdminLayoutProps {
  activeTab?: string;
  onChangeTab: (tabId: string) => void;
  clients?: any[];
  projects?: any[];
  contracts?: any[];
  notifications?: any[];
  onSelectRecord?: (record: { type: string; item: any }) => void;
  onMarkAllNotificationsRead?: () => void;
  children: ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeTab = 'overview',
  onChangeTab,
  clients = [],
  projects = [],
  contracts = [],
  notifications = [],
  onSelectRecord = () => {},
  onMarkAllNotificationsRead = () => {},
  children,
}) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
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

  // Handle Ctrl+K / Cmd+K shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        const searchInput = document.getElementById('global-admin-search-input');
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
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

  // Filter global search results
  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return { clients: [], projects: [], contracts: [] };
    const q = searchQuery.toLowerCase().trim();

    return {
      clients: clients.filter(
        (c) => c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)
      ).slice(0, 4),
      projects: projects.filter(
        (p) =>
          p.clientName?.toLowerCase().includes(q) ||
          p.clientEmail?.toLowerCase().includes(q) ||
          p.editingStyle?.toLowerCase().includes(q)
      ).slice(0, 4),
      contracts: contracts.filter(
        (c) =>
          c.clientName?.toLowerCase().includes(q) ||
          c.clientEmail?.toLowerCase().includes(q) ||
          c.packageTier?.toLowerCase().includes(q)
      ).slice(0, 4),
    };
  }, [searchQuery, clients, projects, contracts]);

  const totalResultsCount =
    filteredResults.clients.length +
    filteredResults.projects.length +
    filteredResults.contracts.length;

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--bg)',
        color: 'var(--ink)',
        width: '100%',
      }}
    >
      {/* Desktop Sidebar Rail */}
      {!isMobile && (
        <AdminSidebar
          activeTab={activeTab}
          onChangeTab={handleSelectTab}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
        />
      )}

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header Bar */}
        <header
          style={{
            height: '64px',
            backgroundColor: 'var(--surface)',
            borderBottom: '1px solid var(--line)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            position: 'sticky',
            top: 0,
            zIndex: 80,
            backdropFilter: 'blur(12px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {isMobile && (
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--ink)',
                  cursor: 'pointer',
                  display: 'flex',
                }}
              >
                {mobileOpen ? <IconClose size={24} /> : <IconMenu size={24} />}
              </button>
            )}

            {/* Breadcrumb Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--ink-soft)' }}>
              <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Admin</span>
              <IconChevronRight size={14} color="var(--ink-soft)" />
              <span style={{ textTransform: 'capitalize', color: 'var(--accent-gold)', fontWeight: 600 }}>
                {activeTab.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Global Command Search Box */}
            <div ref={searchContainerRef} style={{ position: 'relative', width: isMobile ? '160px' : '260px' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <div style={{ position: 'absolute', left: '12px', pointerEvents: 'none', display: 'flex' }}>
                  <IconSearch size={16} color="var(--ink-soft)" />
                </div>
                <input
                  id="global-admin-search-input"
                  type="text"
                  placeholder={isMobile ? 'Search...' : 'Search (Ctrl+K)...'}
                  value={searchQuery}
                  onFocus={() => setSearchOpen(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchOpen(true);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    borderRadius: '100px',
                    border: '1px solid var(--line)',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--ink)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Global Search Results Dropdown */}
              {searchOpen && searchQuery.trim() && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '320px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow)',
                    padding: '12px',
                    zIndex: 100,
                  }}
                >
                  {totalResultsCount === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--ink-soft)', fontSize: '13px' }}>
                      No matching records found.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {filteredResults.clients.length > 0 && (
                        <div>
                          <span className="font-mono" style={{ fontSize: '10px', color: 'var(--accent-gold)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                            Clients ({filteredResults.clients.length})
                          </span>
                          {filteredResults.clients.map((c) => (
                            <div
                              key={c._id}
                              onClick={() => {
                                onSelectRecord({ type: 'client', item: c });
                                setSearchOpen(false);
                              }}
                              style={{ padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                              <IconUser size={14} color="var(--accent-gold)" />
                              <span style={{ fontSize: '13px', color: 'var(--ink)' }}>{c.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {filteredResults.projects.length > 0 && (
                        <div>
                          <span className="font-mono" style={{ fontSize: '10px', color: 'var(--accent-gold)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                            Projects ({filteredResults.projects.length})
                          </span>
                          {filteredResults.projects.map((p) => (
                            <div
                              key={p._id}
                              onClick={() => {
                                onSelectRecord({ type: 'project', item: p });
                                setSearchOpen(false);
                              }}
                              style={{ padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                              <IconFileText size={14} color="var(--accent-gold)" />
                              <span style={{ fontSize: '13px', color: 'var(--ink)' }}>{p.editingStyle}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notification Bell Dropdown */}
            <div ref={notifContainerRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                style={{
                  position: 'relative',
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--ink)',
                }}
              >
                <IconSparkles size={16} color="var(--accent-gold)" />
                {unreadNotifCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-2px',
                      backgroundColor: '#E53E3E',
                      color: '#FFF',
                      borderRadius: '100px',
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '2px 6px',
                      lineHeight: 1,
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
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '320px',
                    maxHeight: '360px',
                    overflowY: 'auto',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow)',
                    padding: '16px',
                    zIndex: 100,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>Activity Log</span>
                    {unreadNotifCount > 0 && (
                      <button
                        onClick={onMarkAllNotificationsRead}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <p style={{ fontSize: '12px', color: 'var(--ink-soft)', textAlign: 'center' }}>No recent notifications.</p>
                  ) : (
                    <div style={{ display: 'grid', gap: '8px' }}>
                      {notifications.slice(0, 8).map((n) => (
                        <div key={n._id} style={{ padding: '8px', borderRadius: '6px', backgroundColor: n.read ? 'var(--bg)' : 'rgba(201,160,107,0.08)', fontSize: '12px' }}>
                          <p style={{ color: 'var(--ink)', margin: 0 }}>{n.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--line)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-gold)',
                cursor: 'pointer',
              }}
            >
              {theme === 'light' ? <IconMoon size={16} /> : <IconSun size={16} />}
            </button>
          </div>
        </header>

        {/* Mobile Drawer */}
        {isMobile && mobileOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99,
              backgroundColor: 'rgba(0,0,0,0.6)',
            }}
            onClick={() => setMobileOpen(false)}
          >
            <div
              style={{ width: '280px', height: '100%', backgroundColor: 'var(--surface)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <AdminSidebar
                activeTab={activeTab}
                onChangeTab={handleSelectTab}
                collapsed={false}
                onToggleCollapse={() => {}}
                isMobileDrawer
              />
            </div>
          </div>
        )}

        {/* Main Content Workspace Body */}
        <main style={{ flex: 1, padding: '32px 24px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
};
