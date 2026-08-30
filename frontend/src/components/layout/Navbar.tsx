import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@components/ui/Logo';
import { useTheme } from '@context/ThemeContext';
import { useAuth } from '@context/AuthContext';
import { customFetch } from '../../utils/api';
import { NotificationList, NotificationItem } from '@components/ui/NotificationList';
import { IconSun, IconMoon, IconMenu, IconClose, IconUser, IconLogOut, IconShield, IconChevronDown, IconBell } from '@icons/icons';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const getSubdomainHref = (subdomain: 'admin' | 'dashboard' | 'app') => {
    if (typeof window === 'undefined') return `/${subdomain}`;
    const host = window.location.hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1') {
      return `/${subdomain}`;
    }
    return `https://${subdomain}.alpha-cut.com`;
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Portfolio', path: '/portfolio' },
    { label: 'Packages', path: '/packages' },
    { label: 'About', path: '/about' },
    { label: 'Ratings', path: '/ratings' },
  ];

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await customFetch('/api/notifications');
      if (res.success && res.notifications) {
        setNotifications(res.notifications);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await customFetch(`/api/notifications/${id}/read`, { method: 'POST' });
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await customFetch('/api/notifications/read-all', { method: 'POST' });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {}
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = async () => {
    await logout();
    setProfileDropdownOpen(false);
    navigate('/');
  };

  return (
    <header
      className="site-header"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'var(--surface)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--line)',
        transition: 'background-color var(--transition-smooth)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link to="/" className="header-logo-link" onClick={() => setMobileMenuOpen(false)}>
          <Logo size="medium" />
        </Link>

        {/* Desktop Navigation */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '32px',
          }}
          className="desktop-nav"
        >
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  fontSize: '14px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--accent-gold)' : 'var(--ink)',
                  transition: 'color var(--transition-fast)',
                  position: 'relative',
                }}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="activeNavLine"
                    style={{
                      position: 'absolute',
                      bottom: '-6px',
                      left: 0,
                      right: 0,
                      height: '2px',
                      backgroundColor: 'var(--accent-gold)',
                      borderRadius: '2px',
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
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
              transition: 'all var(--transition-fast)',
            }}
          >
            <motion.div
              key={theme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {theme === 'light' ? <IconMoon size={20} /> : <IconSun size={20} />}
            </motion.div>
          </button>

          {/* Notifications Control (Desktop for authenticated users) */}
          {isAuthenticated && (
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                aria-label="Notifications"
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
                  position: 'relative',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <IconBell size={20} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      backgroundColor: 'var(--accent-gold)',
                      color: 'var(--signal-ink)',
                      fontSize: '10px',
                      fontWeight: 800,
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid var(--surface)',
                    }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 8px)',
                      zIndex: 1000,
                    }}
                  >
                    <NotificationList
                      notifications={notifications}
                      onMarkRead={handleMarkRead}
                      onMarkAllRead={handleMarkAllRead}
                      onClose={() => setNotificationsOpen(false)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* User Auth Control (Desktop) */}
          <div className="desktop-nav" ref={dropdownRef} style={{ position: 'relative' }}>
            {isAuthenticated ? (
              <div>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg)',
                    border: '1px solid var(--line)',
                    color: 'var(--ink)',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user?.name}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '1px solid var(--accent-gold)',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent-gold)',
                        color: 'var(--signal-ink)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 800,
                      }}
                    >
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <span>{user?.name}</span>
                  <IconChevronDown size={16} color="var(--ink-soft)" />
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 'calc(100% + 8px)',
                        width: '200px',
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--line)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow)',
                        padding: '8px',
                        zIndex: 1000,
                      }}
                    >
                      <a
                        href={getSubdomainHref('dashboard')}
                        onClick={() => setProfileDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          color: 'var(--ink)',
                          textDecoration: 'none',
                        }}
                      >
                        <IconUser size={16} color="var(--accent-gold)" />
                        Client Dashboard
                      </a>

                      {user?.role === 'admin' && (
                        <a
                          href={getSubdomainHref('admin')}
                          onClick={() => setProfileDropdownOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            color: 'var(--ink)',
                            textDecoration: 'none',
                          }}
                        >
                          <IconShield size={16} color="var(--accent-gold)" />
                          Admin Panel
                        </a>
                      )}

                      <div style={{ height: '1px', backgroundColor: 'var(--line)', margin: '6px 0' }} />

                      <button
                        onClick={handleLogout}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          color: '#E53E3E',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <IconLogOut size={16} />
                        Log Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                style={{
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--accent-gold)',
                  color: 'var(--signal-ink)',
                  fontSize: '14px',
                  fontWeight: 600,
                  transition: 'all var(--transition-fast)',
                }}
              >
                Log In
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
            className="mobile-hamburger"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg)',
              border: '1px solid var(--line)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--ink)',
              cursor: 'pointer',
            }}
          >
            {mobileMenuOpen ? <IconClose size={22} /> : <IconMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-in Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              overflow: 'hidden',
              backgroundColor: 'var(--surface)',
              borderBottom: '1px solid var(--line)',
              padding: '20px 24px 28px 24px',
            }}
            className="mobile-menu-drawer"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      fontSize: '16px',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? 'var(--accent-gold)' : 'var(--ink)',
                      padding: '8px 0',
                    }}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div style={{ height: '1px', backgroundColor: 'var(--line)', margin: '8px 0' }} />

              {isAuthenticated ? (
                <>
                  <a
                    href={getSubdomainHref('dashboard')}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ink)', textDecoration: 'none' }}
                  >
                    Client Dashboard
                  </a>
                  {user?.role === 'admin' && (
                    <a
                      href={getSubdomainHref('admin')}
                      onClick={() => setMobileMenuOpen(false)}
                      style={{ fontSize: '16px', fontWeight: 600, color: 'var(--accent-gold)', textDecoration: 'none' }}
                    >
                      Admin Panel
                    </a>
                  )}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    style={{
                      textAlign: 'left',
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#E53E3E',
                      padding: '8px 0',
                    }}
                  >
                    Log Out ({user?.name})
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--accent-gold)',
                    color: 'var(--signal-ink)',
                    fontSize: '15px',
                    fontWeight: 600,
                  }}
                >
                  Log In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 868px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-hamburger {
            display: flex !important;
          }
        }
        @media (min-width: 869px) {
          .mobile-hamburger {
            display: none !important;
          }
          .mobile-menu-drawer {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};
