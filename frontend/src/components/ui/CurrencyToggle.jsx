import React from 'react';
import { motion } from 'framer-motion';

export const CurrencyToggle = ({ currency = 'ETB', onChange, className = '' }) => {
  const options = ['ETB', 'USD'];

  return (
    <div
      className={`currency-toggle ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px',
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      {options.map((opt) => {
        const isActive = currency === opt;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              position: 'relative',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: isActive ? '#170B06' : 'var(--ink-soft)',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: 'calc(var(--radius-md) - 3px)',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {isActive && (
              <motion.div
                layoutId="activeCurrency"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'var(--accent-gold)',
                  borderRadius: 'calc(var(--radius-md) - 3px)',
                  zIndex: 0,
                }}
              />
            )}
            <span style={{ position: 'relative', zIndex: 1 }}>{opt}</span>
          </button>
        );
      })}
    </div>
  );
};
