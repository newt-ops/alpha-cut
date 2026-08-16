import React from 'react';

export const Badge = ({
  children,
  variant = 'gold',
  size = 'medium',
  className = '',
}) => {
  const variantStyles = {
    gold: {
      backgroundColor: 'rgba(201, 160, 107, 0.15)',
      color: 'var(--accent-gold)',
      border: '1px solid rgba(201, 160, 107, 0.3)',
    },
    maroon: {
      backgroundColor: 'rgba(69, 29, 19, 0.15)',
      color: 'var(--ink)',
      border: '1px solid var(--line)',
    },
    surface: {
      backgroundColor: 'var(--surface)',
      color: 'var(--ink-soft)',
      border: '1px solid var(--line)',
    },
    success: {
      backgroundColor: 'rgba(72, 187, 120, 0.15)',
      color: '#38A169',
      border: '1px solid rgba(72, 187, 120, 0.3)',
    },
  };

  const sizeStyles = {
    small: { padding: '3px 8px', fontSize: '10px' },
    medium: { padding: '5px 12px', fontSize: '11px' },
  };

  return (
    <span
      className={`font-mono ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        borderRadius: '100px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        userSelect: 'none',
        ...sizeStyles[size],
        ...variantStyles[variant],
      }}
    >
      {children}
    </span>
  );
};
