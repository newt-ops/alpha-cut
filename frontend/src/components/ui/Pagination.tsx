import React from 'react';
import { IconChevronRight } from '@icons/icons';

export interface PaginationProps {
  currentPage?: number;
  totalPages?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage = 1,
  totalPages = 5,
  onPageChange,
  className = '',
}) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div
      className={`custom-pagination ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        userSelect: 'none',
      }}
    >
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        style={{
          width: '36px',
          height: '36px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--line)',
          color: 'var(--ink)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          opacity: currentPage === 1 ? 0.4 : 1,
          transform: 'rotate(180deg)',
        }}
      >
        <IconChevronRight size={18} />
      </button>

      {pages.map((page) => {
        const isActive = page === currentPage;
        return (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: isActive ? 'var(--accent-gold)' : 'var(--surface)',
              border: `1px solid ${isActive ? 'var(--accent-gold)' : 'var(--line)'}`,
              color: isActive ? '#170B06' : 'var(--ink)',
              fontWeight: isActive ? 700 : 500,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all var(--transition-fast)',
            }}
          >
            {page}
          </button>
        );
      })}

      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        style={{
          width: '36px',
          height: '36px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--line)',
          color: 'var(--ink)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          opacity: currentPage === totalPages ? 0.4 : 1,
        }}
      >
        <IconChevronRight size={18} />
      </button>
    </div>
  );
};
