import React, { useState } from 'react';

export const Input = ({
  label,
  error,
  helperText,
  icon: Icon = null,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`input-field-container ${className}`} style={{ width: '100%', marginBottom: '16px' }}>
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '13px',
            fontWeight: 600,
            color: error ? '#E53E3E' : isFocused ? 'var(--accent-gold)' : 'var(--ink-soft)',
            transition: 'color var(--transition-fast)',
          }}
        >
          {label} {required && <span style={{ color: 'var(--accent-gold)' }}>*</span>}
        </label>
      )}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--surface)',
          border: `1px solid ${error ? '#E53E3E' : isFocused ? 'var(--accent-gold)' : 'var(--line)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '0 16px',
          boxShadow: isFocused ? '0 0 0 3px rgba(201, 160, 107, 0.2)' : 'none',
          transition: 'all var(--transition-fast)',
        }}
      >
        {Icon && <Icon size={18} color={isFocused ? 'var(--accent-gold)' : 'var(--ink-soft)'} style={{ marginRight: '10px' }} />}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            width: '100%',
            height: '46px',
            backgroundColor: 'transparent',
            color: 'var(--ink)',
            fontSize: '14px',
            outline: 'none',
            border: 'none',
          }}
          {...props}
        />
      </div>
      {error && (
        <p style={{ fontSize: '12px', color: '#E53E3E', marginTop: '4px', fontWeight: 500 }}>
          {error}
        </p>
      )}
      {!error && helperText && (
        <p style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '4px' }}>
          {helperText}
        </p>
      )}
    </div>
  );
};

export const Textarea = ({
  label,
  error,
  helperText,
  value,
  onChange,
  placeholder = '',
  rows = 4,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`textarea-field-container ${className}`} style={{ width: '100%', marginBottom: '16px' }}>
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '13px',
            fontWeight: 600,
            color: error ? '#E53E3E' : isFocused ? 'var(--accent-gold)' : 'var(--ink-soft)',
            transition: 'color var(--transition-fast)',
          }}
        >
          {label} {required && <span style={{ color: 'var(--accent-gold)' }}>*</span>}
        </label>
      )}
      <div
        style={{
          position: 'relative',
          backgroundColor: 'var(--surface)',
          border: `1px solid ${error ? '#E53E3E' : isFocused ? 'var(--accent-gold)' : 'var(--line)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          boxShadow: isFocused ? '0 0 0 3px rgba(201, 160, 107, 0.2)' : 'none',
          transition: 'all var(--transition-fast)',
        }}
      >
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            width: '100%',
            backgroundColor: 'transparent',
            color: 'var(--ink)',
            fontSize: '14px',
            outline: 'none',
            border: 'none',
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
          {...props}
        />
      </div>
      {error && (
        <p style={{ fontSize: '12px', color: '#E53E3E', marginTop: '4px', fontWeight: 500 }}>
          {error}
        </p>
      )}
      {!error && helperText && (
        <p style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '4px' }}>
          {helperText}
        </p>
      )}
    </div>
  );
};
