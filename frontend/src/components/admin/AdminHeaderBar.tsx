import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import {
  IconSearch,
  IconClose,
  IconCheck,
  IconInfo,
  IconSparkles,
  IconChevronRight,
  IconClock,
  IconUser,
  IconFileText,
} from '@icons/icons';

interface AdminHeaderBarProps {
  activeTab?: string;
  breadcrumbs?: string[];
  clients?: any[];
  projects?: any[];
  contracts?: any[];
  notifications?: any[];
  onSelectRecord?: (record: { type: string; item: any }) => void;
  onMarkAllNotificationsRead?: () => void;
  onOpenProposalModal?: () => void;
  onOpenInvoiceModal?: () => void;
}

export const AdminHeaderBar: React.FC<AdminHeaderBarProps> = ({
  activeTab = 'overview',
  breadcrumbs = [],
  clients = [],
  projects = [],
  contracts = [],
  notifications = [],
  onSelectRecord = () => {},
  onMarkAllNotificationsRead = () => {},
  onOpenProposalModal,
  onOpenInvoiceModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notifContainerRef = useRef<HTMLDivElement>(null);

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  // Filter global search results across clients, projects, contracts
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

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        backgroundColor: 'var(--surface)',
        borderBottom: '1px solid var(--line)',
        gap: '16px',
        flexWrap: 'wrap',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Breadcrumbs Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--ink-soft)' }}>
        <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Admin Console</span>
        <IconChevronRight size={14} color="var(--ink-soft)" />
        <span style={{ textTransform: 'capitalize', color: 'var(--accent-gold)', fontWeight: 600 }}>
          {activeTab.replace('_', ' ')}
        </span>
        {breadcrumbs.map((b, idx) => (
          <React.Fragment key={idx}>
            <IconChevronRight size={14} color="var(--ink-soft)" />
            <span style={{ color: 'var(--ink)' }}>{b}</span>
          </React.Fragment>
        ))}
      </div>

      {/* Right Controls: Global Search + Notification Bell */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Global Command Search Box */}
        <div ref={searchContainerRef} style={{ position: 'relative', width: '280px' }}>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <div style={{ position: 'absolute', left: '12px', pointerEvents: 'none', display: 'flex' }}>
              <IconSearch size={16} color="var(--ink-soft)" />
            </div>
            <input
              id="global-admin-search-input"
              type="text"
              placeholder="Global Search (Ctrl+K)..."
              value={searchQuery}
              onFocus={() => setSearchOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              style={{
                width: '100%',
                padding: '8px 36px 8px 36px',
                borderRadius: '100px',
                border: '1px solid var(--line)',
                backgroundColor: 'var(--bg)',
                color: 'var(--ink)',
                fontSize: '13px',
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
                <IconClose size={14} />
              </button>
            )}
          </div>

          {/* Global Search Results Dropdown */}
          {searchOpen && searchQuery.trim() && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '360px',
                maxHeight: '400px',
                overflowY: 'auto',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow)',
                padding: '12px',
                zIndex: 50,
              }}
            >
              {totalResultsCount === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--ink-soft)', fontSize: '13px' }}>
                  No matching records found.
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {/* Clients Match */}
                  {filteredResults.clients.length > 0 && (
                    <div>
                      <span className="font-mono" style={{ fontSize: '10px', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
                        Clients ({filteredResults.clients.length})
                      </span>
                      {filteredResults.clients.map((c) => (
                        <div
                          key={c._id}
                          onClick={() => {
                            onSelectRecord({ type: 'client', item: c });
                            setSearchOpen(false);
                          }}
                          style={{
                            padding: '8px 10px',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            transition: 'background 0.2s ease',
                          }}
                          className="search-result-item"
                        >
                          <IconUser size={16} color="var(--accent-gold)" />
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>{c.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>{c.email}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Projects Match */}
                  {filteredResults.projects.length > 0 && (
                    <div>
                      <span className="font-mono" style={{ fontSize: '10px', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
                        Projects ({filteredResults.projects.length})
                      </span>
                      {filteredResults.projects.map((p) => (
                        <div
                          key={p._id}
                          onClick={() => {
                            onSelectRecord({ type: 'project', item: p });
                            setSearchOpen(false);
                          }}
                          style={{
                            padding: '8px 10px',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                          }}
                          className="search-result-item"
                        >
                          <IconFileText size={16} color="var(--accent-gold)" />
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>{p.editingStyle}</div>
                            <div style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>{p.clientName} ({p.status})</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Contracts Match */}
                  {filteredResults.contracts.length > 0 && (
                    <div>
                      <span className="font-mono" style={{ fontSize: '10px', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
                        Retainer Contracts ({filteredResults.contracts.length})
                      </span>
                      {filteredResults.contracts.map((c) => (
                        <div
                          key={c._id}
                          onClick={() => {
                            onSelectRecord({ type: 'contract', item: c });
                            setSearchOpen(false);
                          }}
                          style={{
                            padding: '8px 10px',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                          }}
                          className="search-result-item"
                        >
                          <IconClock size={16} color="var(--accent-gold)" />
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>{c.clientName} Retainer</div>
                            <div style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>{c.frequency} • {c.monthlyPrice} {c.currency}</div>
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

        {/* Notification Bell Dropdown */}
        <div ref={notifContainerRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            style={{
              position: 'relative',
              background: 'var(--bg)',
              border: '1px solid var(--line)',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--ink)',
            }}
            title="System Activity Notifications"
          >
            <IconSparkles size={18} color="var(--accent-gold)" />
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

          {/* Notification List Dropdown Panel */}
          {notifDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '340px',
                maxHeight: '420px',
                overflowY: 'auto',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow)',
                padding: '16px',
                zIndex: 50,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>Activity Log</span>
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
                <p style={{ fontSize: '13px', color: 'var(--ink-soft)', textAlign: 'center', padding: '16px 0' }}>
                  No recent activity notifications.
                </p>
              ) : (
                <div style={{ display: 'grid', gap: '8px' }}>
                  {notifications.slice(0, 10).map((n) => (
                    <div
                      key={n._id}
                      style={{
                        padding: '10px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: n.read ? 'var(--bg)' : 'rgba(201, 160, 107, 0.08)',
                        border: n.read ? '1px solid var(--line)' : '1px solid var(--accent-gold)',
                        fontSize: '12px',
                      }}
                    >
                      <p style={{ color: 'var(--ink)', lineHeight: 1.4, margin: 0 }}>{n.message}</p>
                      <span style={{ fontSize: '10px', color: 'var(--ink-soft)', marginTop: '4px', display: 'block' }}>
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
