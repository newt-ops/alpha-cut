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
  IconBell,
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
            borderBottom: '1px solid rgba(201, 160, 107, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: isMobile ? '0 16px' : '0 28px',
            position: 'sticky',
            top: 0,
            zIndex: 80,
            backdropFilter: 'blur(16px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          }}
        >
          {/* Left Brand & Menu Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isMobile && (
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--ink)',
                  cursor: 'pointer',
                  display: 'flex',
                  padding: '4px',
                }}
              >
                {mobileOpen ? <IconClose size={22} /> : <IconMenu size={22} />}
              </button>
            )}

            {/* Breadcrumb Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <span className="font-mono" style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-gold)', letterSpacing: '0.08em' }}>
                ALPHA CUT
              </span>
              {!isMobile && <IconChevronRight size={14} color="var(--ink-soft)" />}
              {!isMobile && <span style={{ fontWeight: 700, color: 'var(--ink)' }}>Admin Console</span>}
              <IconChevronRight size={14} color="var(--ink-soft)" />
              <span
                className="font-mono"
                style={{
                  textTransform: 'uppercase',
                  color: 'var(--accent-gold)',
                  fontWeight: 800,
                  fontSize: '10px',
                  backgroundColor: 'rgba(201, 160, 107, 0.15)',
                  padding: '3px 8px',
                  borderRadius: '100px',
                  border: '1px solid var(--accent-gold)',
                  letterSpacing: '0.06em',
                }}
              >
                {activeTab.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '14px' }}>
            {/* Desktop Command Search Input or Mobile Search Button */}
            {!isMobile ? (
              <div ref={searchContainerRef} style={{ position: 'relative', width: '280px' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <div style={{ position: 'absolute', left: '14px', pointerEvents: 'none', display: 'flex' }}>
                    <IconSearch size={15} color="var(--accent-gold)" />
                  </div>
                  <input
                    id="global-admin-search-input"
                    type="text"
                    placeholder="Global Command Search..."
                    value={searchQuery}
                    onFocus={() => setSearchOpen(true)}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSearchOpen(true);
                    }}
                    style={{
                      width: '100%',
                      padding: '9px 65px 9px 38px',
                      borderRadius: '100px',
                      border: '1px solid var(--line)',
                      backgroundColor: 'var(--bg)',
                      color: 'var(--ink)',
                      fontSize: '12.5px',
                      outline: 'none',
                      transition: 'all var(--transition-fast)',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      right: '10px',
                      pointerEvents: 'none',
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--line)',
                      borderRadius: '6px',
                      padding: '2px 6px',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: 'var(--accent-gold)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    Ctrl+K
                  </div>
                </div>

                {/* Desktop Search Results Dropdown */}
                {searchOpen && searchQuery.trim() && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 10px)',
                      right: 0,
                      width: '360px',
                      maxHeight: '420px',
                      overflowY: 'auto',
                      backgroundColor: 'var(--surface)',
                      border: '1.5px solid var(--accent-gold)',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: '0 16px 40px -10px rgba(0,0,0,0.6)',
                      padding: '16px',
                      zIndex: 100,
                    }}
                  >
                    {totalResultsCount === 0 ? (
                      <div style={{ padding: '16px', textAlign: 'center', color: 'var(--ink-soft)', fontSize: '13px' }}>
                        No matching records found.
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gap: '14px' }}>
                        {filteredResults.clients.length > 0 && (
                          <div>
                            <span className="font-mono" style={{ fontSize: '10px', color: 'var(--accent-gold)', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '8px', letterSpacing: '0.06em' }}>
                              Clients ({filteredResults.clients.length})
                            </span>
                            {filteredResults.clients.map((c) => (
                              <div
                                key={c._id}
                                onClick={() => {
                                  onSelectRecord({ type: 'client', item: c });
                                  setSearchOpen(false);
                                }}
                                style={{ padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'var(--bg)', marginBottom: '6px', border: '1px solid var(--line)' }}
                              >
                                <IconUser size={15} color="var(--accent-gold)" />
                                <div>
                                  <span style={{ fontSize: '13px', color: 'var(--ink)', fontWeight: 700, display: 'block' }}>{c.name}</span>
                                  <span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>{c.email}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {filteredResults.projects.length > 0 && (
                          <div>
                            <span className="font-mono" style={{ fontSize: '10px', color: 'var(--accent-gold)', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '8px', letterSpacing: '0.06em' }}>
                              Projects ({filteredResults.projects.length})
                            </span>
                            {filteredResults.projects.map((p) => (
                              <div
                                key={p._id}
                                onClick={() => {
                                  onSelectRecord({ type: 'project', item: p });
                                  setSearchOpen(false);
                                }}
                                style={{ padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'var(--bg)', marginBottom: '6px', border: '1px solid var(--line)' }}
                              >
                                <IconFileText size={15} color="var(--accent-gold)" />
                                <div>
                                  <span style={{ fontSize: '13px', color: 'var(--ink)', fontWeight: 700, display: 'block' }}>{p.editingStyle}</span>
                                  <span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>{p.clientName} • {p.price} {p.currency}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Mobile Search Lens Button */
              <div ref={searchContainerRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  title="Global Search"
                  style={{
                    width: '34px',
                    height: '34px',
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
                  <IconSearch size={15} />
                </button>

                {/* Mobile Search Popdown Modal (Positioned Under Sticky Header) */}
                {searchOpen && (
                  <div
                    style={{
                      position: 'fixed',
                      top: '64px',
                      left: '8px',
                      right: '8px',
                      backgroundColor: 'var(--surface)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      borderRadius: '0 0 20px 20px',
                      border: '1px solid rgba(201, 160, 107, 0.35)',
                      borderTop: 'none',
                      padding: '14px 16px',
                      boxShadow: '0 16px 40px -10px rgba(0, 0, 0, 0.35)',
                      zIndex: 100,
                      display: 'grid',
                      gap: '12px',
                      transition: 'all var(--transition-normal)',
                    }}
                  >
                    {/* Header bar with Input + Close Button */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                        <div style={{ position: 'absolute', left: '12px', pointerEvents: 'none', display: 'flex' }}>
                          <IconSearch size={15} color="var(--accent-gold)" />
                        </div>
                        <input
                          id="global-admin-search-input-mobile"
                          type="text"
                          placeholder="Search clients, projects, contracts..."
                          value={searchQuery}
                          autoFocus
                          onChange={(e) => setSearchQuery(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '9px 12px 9px 36px',
                            borderRadius: '100px',
                            border: '1px solid var(--accent-gold)',
                            backgroundColor: 'var(--bg)',
                            color: 'var(--ink)',
                            fontSize: '13px',
                            outline: 'none',
                          }}
                        />
                      </div>

                      <button
                        onClick={() => setSearchOpen(false)}
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--bg)',
                          border: '1px solid var(--line)',
                          color: 'var(--ink)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                      >
                        <IconClose size={16} />
                      </button>
                    </div>

                    {/* Search Results in Mobile Overlay */}
                    {searchQuery.trim() && (
                      <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'grid', gap: '12px', paddingBottom: '4px' }}>
                        {totalResultsCount === 0 ? (
                          <p style={{ fontSize: '13px', color: 'var(--ink-soft)', textAlign: 'center', margin: '12px 0' }}>
                            No matching records found.
                          </p>
                        ) : (
                          <>
                            {filteredResults.clients.length > 0 && (
                              <div>
                                <span className="font-mono" style={{ fontSize: '10px', color: 'var(--accent-gold)', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '6px', letterSpacing: '0.06em' }}>
                                  CLIENTS ({filteredResults.clients.length})
                                </span>
                                <div style={{ display: 'grid', gap: '6px' }}>
                                  {filteredResults.clients.map((c) => (
                                    <div
                                      key={c._id}
                                      onClick={() => {
                                        onSelectRecord({ type: 'client', item: c });
                                        setSearchOpen(false);
                                      }}
                                      style={{
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        backgroundColor: 'var(--bg)',
                                        border: '1px solid var(--line)',
                                      }}
                                    >
                                      <IconUser size={15} color="var(--accent-gold)" />
                                      <div>
                                        <span style={{ fontSize: '13px', color: 'var(--ink)', fontWeight: 700, display: 'block' }}>{c.name}</span>
                                        <span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>{c.email}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {filteredResults.projects.length > 0 && (
                              <div>
                                <span className="font-mono" style={{ fontSize: '10px', color: 'var(--accent-gold)', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '6px', letterSpacing: '0.06em' }}>
                                  PROJECTS ({filteredResults.projects.length})
                                </span>
                                <div style={{ display: 'grid', gap: '6px' }}>
                                  {filteredResults.projects.map((p) => (
                                    <div
                                      key={p._id}
                                      onClick={() => {
                                        onSelectRecord({ type: 'project', item: p });
                                        setSearchOpen(false);
                                      }}
                                      style={{
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        backgroundColor: 'var(--bg)',
                                        border: '1px solid var(--line)',
                                      }}
                                    >
                                      <IconFileText size={15} color="var(--accent-gold)" />
                                      <div>
                                        <span style={{ fontSize: '13px', color: 'var(--ink)', fontWeight: 700, display: 'block' }}>{p.editingStyle}</span>
                                        <span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>{p.clientName} • {p.price} {p.currency}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Notification Bell Dropdown */}
            <div ref={notifContainerRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                title="System Notifications Log"
                style={{
                  position: 'relative',
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  borderRadius: '50%',
                  width: isMobile ? '34px' : '38px',
                  height: isMobile ? '34px' : '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--ink)',
                  boxShadow: unreadNotifCount > 0 ? '0 0 14px rgba(201, 160, 107, 0.45)' : 'none',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <IconBell size={isMobile ? 15 : 18} color="var(--accent-gold)" />
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
                      border: '2px solid var(--surface)',
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
                    top: 'calc(100% + 10px)',
                    right: 0,
                    width: isMobile ? '290px' : '340px',
                    maxHeight: '380px',
                    overflowY: 'auto',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 12px 35px -10px rgba(0,0,0,0.5)',
                    padding: '18px',
                    zIndex: 100,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ink)' }}>Live Activity Log</span>
                    {unreadNotifCount > 0 && (
                      <button
                        onClick={onMarkAllNotificationsRead}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Mark All Read ✓
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <p style={{ fontSize: '13px', color: 'var(--ink-soft)', textAlign: 'center', margin: '16px 0' }}>No recent notifications.</p>
                  ) : (
                    <div style={{ display: 'grid', gap: '8px' }}>
                      {notifications.slice(0, 8).map((n) => (
                        <div key={n._id} style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: n.read ? 'var(--bg)' : 'rgba(201,160,107,0.12)', fontSize: '12.5px', border: '1px solid var(--line)' }}>
                          <p style={{ color: 'var(--ink)', margin: 0, lineHeight: 1.45 }}>{n.message}</p>
                          <span style={{ fontSize: '10px', color: 'var(--ink-soft)', marginTop: '4px', display: 'block' }}>
                            {new Date(n.createdAt || Date.now()).toLocaleTimeString()}
                          </span>
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
              title="Toggle Theme"
              style={{
                width: isMobile ? '34px' : '38px',
                height: isMobile ? '34px' : '38px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--line)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-gold)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              {theme === 'light' ? <IconMoon size={isMobile ? 15 : 17} /> : <IconSun size={isMobile ? 15 : 17} />}
            </button>

            {/* Minimal Admin Profile Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user?.name || 'Admin'}
                  style={{
                    width: isMobile ? '32px' : '36px',
                    height: isMobile ? '32px' : '36px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '1.5px solid var(--accent-gold)',
                    boxShadow: '0 2px 8px rgba(201, 160, 107, 0.3)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: isMobile ? '32px' : '36px',
                    height: isMobile ? '32px' : '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-gold)',
                    color: '#170B06',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: isMobile ? '13px' : '14px',
                    fontFamily: 'var(--font-mono)',
                    border: '1.5px solid var(--accent-gold)',
                    boxShadow: '0 2px 8px rgba(201, 160, 107, 0.3)',
                  }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>
              )}
            </div>
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
