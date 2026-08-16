import React from 'react';

export const Logo = ({ size = 'medium', showText = true, className = '' }) => {
  const sizeMap = {
    small: { icon: 24, text: '16px' },
    medium: { icon: 32, text: '20px' },
    large: { icon: 44, text: '26px' },
  };

  const { icon, text } = sizeMap[size] || sizeMap.medium;

  return (
    <div
      className={`logo-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        color: 'var(--ink)',
        textDecoration: 'none',
        userSelect: 'none',
      }}
    >
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <path
          d="M6 30L20 6L34 30H27L20 17.5L13 30H6Z"
          fill="currentColor"
        />
        <path
          d="M10 34L30 34"
          stroke="var(--accent-gold)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M24 14L34 26"
          stroke="var(--accent-gold)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      {showText && (
        <span
          className="font-display"
          style={{
            fontSize: text,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            color: 'var(--ink)',
            lineHeight: 1,
          }}
        >
          Alpha<span style={{ color: 'var(--accent-gold)', fontStyle: 'italic', fontWeight: 400 }}>Cut</span>
        </span>
      )}
    </div>
  );
};
