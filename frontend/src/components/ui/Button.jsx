import React from 'react';
import { motion } from 'framer-motion';

export const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  isDisabled = false,
  iconLeft: IconLeft = null,
  iconRight: IconRight = null,
  onClick,
  className = '',
  type = 'button',
  fullWidth = false,
  style = {},
  ...props
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    cursor: isDisabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.5 : 1,
    transition: 'all var(--transition-fast)',
    outline: 'none',
    border: 'none',
    width: fullWidth ? '100%' : 'auto',
    userSelect: 'none',
    position: 'relative',
    overflow: 'hidden',
  };

  const sizeStyles = {
    small: { padding: '8px 16px', fontSize: '13px' },
    medium: { padding: '12px 24px', fontSize: '15px' },
    large: { padding: '14px 28px', fontSize: '16px' },
  };

  const variantStyles = {
    primary: {
      backgroundColor: 'var(--accent-gold)',
      color: '#170B06',
      boxShadow: 'var(--shadow-sm)',
    },
    secondary: {
      backgroundColor: 'transparent',
      color: 'var(--ink)',
      border: '1px solid var(--line)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--ink-soft)',
    },
    google: {
      backgroundColor: 'var(--surface)',
      color: 'var(--ink)',
      border: '1px solid var(--line)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      fontWeight: 600,
    },
  };

  const currentStyles = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  };

  return (
    <motion.button
      whileHover={!isDisabled && !isLoading ? { scale: 1.02, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)' } : {}}
      whileTap={!isDisabled && !isLoading ? { scale: 0.98 } : {}}
      type={type}
      onClick={isDisabled || isLoading ? undefined : onClick}
      style={currentStyles}
      className={`btn-${variant} ${className}`}
      disabled={isDisabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            style={{ animation: 'spin 1s linear infinite' }}
          >
            <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
          </svg>
          Connecting...
        </span>
      ) : (
        <>
          {IconLeft && <IconLeft size={size === 'small' ? 18 : 20} />}
          <span>{children}</span>
          {IconRight && <IconRight size={size === 'small' ? 18 : 20} />}
        </>
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </motion.button>
  );
};
