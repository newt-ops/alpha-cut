import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@components/ui/Logo';
import { useTheme } from '@context/ThemeContext';
import { useAuth } from '@context/AuthContext';
import { IconSun, IconMoon, IconMenu, IconClose, IconUser, IconLogOut, IconShield, IconChevronDown } from '@icons/icons';

export const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Editing Styles', path: '/editing-styles' },
    { label: 'Portfolio', path: '/portfolio' },
    { label: 'Packages', path: '/packages' },
    { label: 'About', path: '/about' },
    { label: 'Ratings', path: '/ratings' },
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setProfileDropdownOpen(false);
    navigate('/');
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 900,
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
        <Link to="/" onClick={() => setMobileMenuOpen(false)}>
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
                        color: '#170B06',
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
                      <Link
                        to="/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          color: 'var(--ink)',
                        }}
                      >
                        <IconUser size={16} color="var(--accent-gold)" />
                        Client Dashboard
                      </Link>

                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setProfileDropdownOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            color: 'var(--ink)',
                          }}
                        >
                          <IconShield size={16} color="var(--accent-gold)" />
                          Admin Panel
                        </Link>
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
                  color: '#170B06',
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
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ink)' }}
                  >
                    Client Dashboard
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{ fontSize: '16px', fontWeight: 600, color: 'var(--accent-gold)' }}
                    >
                      Admin Panel
                    </Link>
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
                    color: '#170B06',
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
