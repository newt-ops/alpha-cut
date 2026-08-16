import React from 'react';
import { motion } from 'framer-motion';

export const Tabs = ({ tabs = [], activeTab, onChange, className = '' }) => {
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
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
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
