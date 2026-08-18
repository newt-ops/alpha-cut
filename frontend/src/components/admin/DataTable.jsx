import React, { useState, useMemo } from 'react';
import { Badge } from '@components/ui/Badge';
import { Input } from '@components/ui/Input';
import { IconSearch, IconChevronDown, IconChevronRight, IconClose } from '@icons/icons';

export const DataTable = ({
  columns = [], // Array of { key, label, sortable, render }
  data = [],
  searchPlaceholder = 'Search records...',
  searchKeys = [], // Keys in item to perform text filter on
  filterTabs = [], // Array of { key, label, value, count }
  activeFilterTab = 'all',
  onFilterTabChange = () => {},
  onRowClick = null,
  emptyMessage = 'No matching records found.',
  actions = null, // Header right action elements
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState(columns[0]?.key || '');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Filter & Search Logic
  const filteredData = useMemo(() => {
    let result = [...data];

    // Search query matching
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((item) => {
        if (searchKeys.length > 0) {
          return searchKeys.some((k) => String(item[k] || '').toLowerCase().includes(q));
        }
        return Object.values(item).some((v) => String(v || '').toLowerCase().includes(q));
      });
    }

    // Sort logic
    if (sortKey) {
      result.sort((a, b) => {
        let valA = a[sortKey];
        let valB = b[sortKey];

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchQuery, searchKeys, sortKey, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleHeaderClick = (col) => {
    if (!col.sortable) return;
    if (sortKey === col.key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(col.key);
      setSortOrder('desc');
    }
  };

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      {/* Top Toolbar: Filter Tabs, Search & Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        {/* Filter Pill Tabs */}
        {filterTabs.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {filterTabs.map((tab) => {
              const isActive = activeFilterTab === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => {
                    onFilterTabChange(tab.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '100px',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--accent-gold)' : 'var(--line)',
                    backgroundColor: isActive ? 'var(--surface)' : 'var(--bg)',
                    color: isActive ? 'var(--accent-gold)' : 'var(--ink-soft)',
                    fontSize: '12px',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      style={{
                        padding: '2px 6px',
                        borderRadius: '100px',
                        fontSize: '10px',
                        backgroundColor: isActive ? 'var(--accent-gold)' : 'var(--line)',
                        color: isActive ? '#170B06' : 'var(--ink)',
                        fontWeight: 700,
                      }}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Right Search Input & Custom Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ width: '260px' }}>
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              icon={IconSearch}
            />
          </div>
          {actions}
        </div>
      </div>

      {/* Main Table Wrapper (Responsive Touch Overflow Scroll) */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--line)',
          boxShadow: 'var(--shadow)',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line)', backgroundColor: 'var(--bg)' }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleHeaderClick(col)}
                  style={{
                    padding: '14px 18px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--accent-gold)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    cursor: col.sortable ? 'pointer' : 'default',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>{col.label}</span>
                    {col.sortable && sortKey === col.key && (
                      <span style={{ fontSize: '10px' }}>{sortOrder === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-soft)', fontSize: '13px' }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => (
                <tr
                  key={row._id || row.id || rowIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  style={{
                    borderBottom: '1px solid var(--line)',
                    cursor: onRowClick ? 'pointer' : 'default',
                    transition: 'background 0.2s ease',
                  }}
                  className="data-table-row"
                >
                  {columns.map((col) => (
                    <td key={col.key} style={{ padding: '14px 18px', fontSize: '13px', color: 'var(--ink)' }}>
                      {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer Pagination Controls */}
        {totalPages > 1 && (
          <div
            style={{
              padding: '14px 18px',
              borderTop: '1px solid var(--line)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: 'var(--ink-soft)',
              backgroundColor: 'var(--bg)',
            }}
          >
            <span>
              Showing {((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                style={{
                  padding: '4px 10px',
                  borderRadius: '100px',
                  border: '1px solid var(--line)',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--ink)',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.5 : 1,
                }}
              >
                Previous
              </button>
              <span style={{ padding: '4px 8px', fontWeight: 600, color: 'var(--accent-gold)' }}>
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                style={{
                  padding: '4px 10px',
                  borderRadius: '100px',
                  border: '1px solid var(--line)',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--ink)',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.5 : 1,
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
