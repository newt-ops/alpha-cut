import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

export interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked = false,
  onChange,
  label,
  disabled = false,
  className = '',
}) => {
  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        userSelect: 'none',
      }}
      className={`custom-switch ${className}`}
    >
      <div
        onClick={() => !disabled && onChange && onChange(!checked)}
        style={{
          width: '46px',
          height: '26px',
          borderRadius: '13px',
          backgroundColor: checked ? 'var(--accent-gold)' : 'var(--line)',
          padding: '3px',
          transition: 'background-color var(--transition-fast)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <motion.div
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: checked ? '#170B06' : 'var(--surface)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        />
      </div>
      {label && <span style={{ fontSize: '14px', color: 'var(--ink)', fontWeight: 500 }}>{label}</span>}
    </label>
  );
};
