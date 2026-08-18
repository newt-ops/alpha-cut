import React, { useState, useEffect, useRef } from 'react';
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

export const AdminLayout = ({
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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const searchContainerRef = useRef(null);
  const notifContainerRef = useRef(null);

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
    const handleKeyDown = (e) => {
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
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
      if (notifContainerRef.current && !notifContainerRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTab = (tabId) => {
    onChangeTab(tabId);
    if (isMobile) setMobileOpen(false);
  };

  // Filter global search results
  const filteredResults = React.useMemo(() => {
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

  const TAB_LABELS = {
    overview: 'Analytics & Revenue',
    projects: 'Proposals & Projects',
    board: 'Proposals & Projects',
    contracts: 'Retainer Contracts',
    calendar: 'Calendar Schedule',
    proposal: 'Create Proposal',
    clients: 'Registered Clients',
    portfolio: 'Portfolio Showcase',
    moderation: 'Reviews & Moderation',
    pricing: 'Package Settings',
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

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflowY: 'auto', scrollbarGutter: 'stable' }}>
        {/* Unified Single ERP Application Header */}
        <header
          style={{
            height: isMobile ? '68px' : '76px',
            backgroundColor: 'var(--surface)',
            borderBottom: '1px solid var(--line)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: isMobile ? '12px 16px' : '0 40px',
            position: 'sticky',
            top: 0,
            zIndex: 80,
            boxShadow: 'var(--shadow-sm)',
            transition: 'all var(--transition-normal)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Left: Mobile Button + Branding + Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {isMobile && (
              <button
                onClick={() => setMobileOpen(true)}
                style={{
                  width: '38px',
                  height: '38px',
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
                <IconMenu size={20} />
              </button>
            )}

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="font-mono" style={{ fontSize: '9px', color: 'var(--accent-gold)', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
                  AGENCY CONTROL PORTAL
                </span>
                <span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>•</span>
                <span style={{ fontSize: '12px', color: 'var(--accent-gold)', fontWeight: 700 }}>
                  {TAB_LABELS[activeTab] || activeTab}
                </span>
              </div>
              <h1 className="font-display" style={{ fontSize: isMobile ? '16px' : '20px', marginTop: '2px', color: 'var(--ink)', fontWeight: 800, lineHeight: 1.1 }}>
                Alpha Cut ERP
              </h1>
            </div>
          </div>

          {/* Right Controls: Global Search + Notifications + Theme Switcher + Profile Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '14px' }}>
            {/* Global Search Input (Desktop/Tablet) */}
            {!isMobile && (
              <div ref={searchContainerRef} style={{ position: 'relative', width: '220px' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <div style={{ position: 'absolute', left: '12px', pointerEvents: 'none', display: 'flex' }}>
                    <IconSearch size={14} color="var(--ink-soft)" />
                  </div>
                  <input
                    id="global-admin-search-input"
                    type="text"
                    placeholder="Search (Ctrl+K)..."
                    value={searchQuery}
                    onFocus={() => setSearchOpen(true)}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSearchOpen(true);
                    }}
                    style={{
                      width: '100%',
                      padding: '7px 32px 7px 32px',
                      borderRadius: '100px',
                      border: '1px solid var(--line)',
                      backgroundColor: 'var(--bg)',
                      color: 'var(--ink)',
                      fontSize: '12px',
                      outline: 'none',
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--ink-soft)',
                        display: 'flex',
                      }}
                    >
                      <IconClose size={12} />
                    </button>
                  )}
                </div>

                {/* Search Results Dropdown */}
                {searchOpen && searchQuery.trim() && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      width: '340px',
                      maxHeight: '380px',
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
                      <div style={{ display: 'grid', gap: '10px' }}>
                        {filteredResults.clients.length > 0 && (
                          <div>
                            <span className="font-mono" style={{ fontSize: '10px', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '4px' }}>
                              Clients ({filteredResults.clients.length})
                            </span>
                            {filteredResults.clients.map((c) => (
                              <div
                                key={c._id}
                                onClick={() => {
                                  onSelectRecord({ type: 'client', item: c });
                                  setSearchOpen(false);
                                }}
                                style={{ padding: '6px 8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                              >
                                <IconUser size={14} color="var(--accent-gold)" />
                                <div>
                                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)' }}>{c.name}</div>
                                  <div style={{ fontSize: '10px', color: 'var(--ink-soft)' }}>{c.email}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {filteredResults.projects.length > 0 && (
                          <div>
                            <span className="font-mono" style={{ fontSize: '10px', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '4px' }}>
                              Projects ({filteredResults.projects.length})
                            </span>
                            {filteredResults.projects.map((p) => (
                              <div
                                key={p._id}
                                onClick={() => {
                                  onSelectRecord({ type: 'project', item: p });
                                  setSearchOpen(false);
                                }}
                                style={{ padding: '6px 8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                              >
                                <IconFileText size={14} color="var(--accent-gold)" />
                                <div>
                                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)' }}>{p.editingStyle}</div>
                                  <div style={{ fontSize: '10px', color: 'var(--ink-soft)' }}>{p.clientName} ({p.status})</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {filteredResults.contracts.length > 0 && (
                          <div>
                            <span className="font-mono" style={{ fontSize: '10px', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '4px' }}>
                              Contracts ({filteredResults.contracts.length})
                            </span>
                            {filteredResults.contracts.map((c) => (
                              <div
                                key={c._id}
                                onClick={() => {
                                  onSelectRecord({ type: 'contract', item: c });
                                  setSearchOpen(false);
                                }}
                                style={{ padding: '6px 8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                              >
                                <IconClock size={14} color="var(--accent-gold)" />
                                <div>
                                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)' }}>{c.clientName} Retainer</div>
                                  <div style={{ fontSize: '10px', color: 'var(--ink-soft)' }}>{c.frequency} • {c.monthlyPrice} {c.currency}</div>
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
            )}

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
                title="System Activity Notifications"
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
                      fontSize: '9px',
                      fontWeight: 800,
                      padding: '2px 5px',
                      lineHeight: 1,
                      border: '2px solid var(--surface)',
                    }}
                  >
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {/* Notification List Dropdown */}
              {notifDropdownOpen && (
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
                    padding: '14px',
                    zIndex: 100,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>Activity Notifications</span>
                    {unreadNotifCount > 0 && (
                      <button
                        onClick={onMarkAllNotificationsRead}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent-gold)',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Mark All Read
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <p style={{ fontSize: '12px', color: 'var(--ink-soft)', textAlign: 'center', padding: '16px 0' }}>
                      No recent notifications.
                    </p>
                  ) : (
                    <div style={{ display: 'grid', gap: '8px' }}>
                      {notifications.slice(0, 10).map((n) => (
                        <div
                          key={n._id}
                          style={{
                            padding: '8px 10px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: n.read ? 'var(--bg)' : 'rgba(201, 160, 107, 0.08)',
                            border: n.read ? '1px solid var(--line)' : '1px solid var(--accent-gold)',
                            fontSize: '11px',
                          }}
                        >
                          <p style={{ color: 'var(--ink)', lineHeight: 1.4, margin: 0 }}>{n.message}</p>
                          <span style={{ fontSize: '9px', color: 'var(--ink-soft)', marginTop: '4px', display: 'block' }}>
                            {new Date(n.createdAt).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Theme Switcher Toggle */}
            <button
              onClick={toggleTheme}
              style={{
                background: 'none',
                border: '1px solid var(--line)',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
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
              {theme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
            </button>

            {/* Admin User Profile Pill */}
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
                  style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--accent-gold)' }}
                />
              ) : (
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(201, 160, 107, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-gold)',
                    fontWeight: 700,
                    fontSize: '11px',
                  }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>
              )}
              {!isMobile && (
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.2 }}>{user?.name || 'Alpha Cut'}</div>
                  <div style={{ fontSize: '10px', color: 'var(--ink-soft)', lineHeight: 1.2 }}>{user?.email || 'alphacutagency@gmail.com'}</div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Dashboard Content Workspace */}
        <main style={{ flex: 1, padding: isMobile ? '20px 14px' : '36px 40px', maxWidth: '1440px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          {children}
        </main>
      </div>
    </div>
  );
};
