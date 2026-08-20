import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

export interface TabItem {
  id: string;
  label: ReactNode;
}

export interface TabsProps {
  tabs?: TabItem[];
  activeTab?: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs = [], activeTab, onChange, className = '' }) => {
  return (
    <div
      className={`custom-tabs-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px',
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-md)',
        maxWidth: '100%',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        boxSizing: 'border-box',
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            style={{
              position: 'relative',
              padding: '8px 18px',
              fontSize: '14px',
              fontWeight: 600,
              color: isActive ? '#170B06' : 'var(--ink-soft)',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: 'calc(var(--radius-md) - 4px)',
              cursor: 'pointer',
              transition: 'color var(--transition-fast)',
              outline: 'none',
            }}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabIndicator"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'var(--accent-gold)',
                  borderRadius: 'calc(var(--radius-md) - 4px)',
                  zIndex: 0,
                }}
              />
            )}
            <span style={{ position: 'relative', zIndex: 1 }}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
