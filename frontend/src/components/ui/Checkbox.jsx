import React from 'react';
import { motion } from 'framer-motion';

export const Checkbox = ({
  checked = false,
  onChange,
  label,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        userSelect: 'none',
        fontSize: '14px',
        color: 'var(--ink)',
      }}
      className={`custom-checkbox-wrapper ${className}`}
    >
      <div
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '6px',
          border: `1.5px solid ${checked ? 'var(--accent-gold)' : 'var(--line)'}`,
          backgroundColor: checked ? 'var(--accent-gold)' : 'var(--surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all var(--transition-fast)',
          position: 'relative',
        }}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => !disabled && onChange && onChange(e.target.checked)}
          disabled={disabled}
          style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
          {...props}
        />
        {checked && (
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path
              d="M2.5 6L5 8.5L9.5 3.5"
              stroke="#170B06"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        )}
      </div>
      {label && <span>{label}</span>}
    </label>
  );
};

export const Radio = ({
  checked = false,
  onChange,
  label,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        userSelect: 'none',
        fontSize: '14px',
        color: 'var(--ink)',
      }}
      className={`custom-radio-wrapper ${className}`}
    >
      <div
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          border: `1.5px solid ${checked ? 'var(--accent-gold)' : 'var(--line)'}`,
          backgroundColor: 'var(--surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all var(--transition-fast)',
          position: 'relative',
        }}
      >
        <input
          type="radio"
          checked={checked}
          onChange={() => !disabled && onChange && onChange()}
          disabled={disabled}
          style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
          {...props}
        />
        {checked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-gold)',
            }}
          />
        )}
      </div>
      {label && <span>{label}</span>}
    </label>
  );
};
