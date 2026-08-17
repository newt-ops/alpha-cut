import React from 'react';
import { useTheme } from '@context/ThemeContext';

export const Logo = ({ size = 'medium', showText = true, className = '' }) => {
  const { theme } = useTheme();

  const sizeMap = {
    small: { img: 28, text: '16px' },
    medium: { img: 38, text: '20px' },
    large: { img: 52, text: '26px' },
  };

  const { img: imgSize, text: textSize } = sizeMap[size] || sizeMap.medium;

  return (
    <div
      className={`logo-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        color: 'var(--ink)',
        textDecoration: 'none',
        userSelect: 'none',
      }}
    >
      <img
        src="/logo.png"
        alt="Alpha Cut Logo"
        className="app-logo-img"
        style={{
          height: `${imgSize}px`,
          width: 'auto',
          maxHeight: `${imgSize}px`,
          flexShrink: 0,
        }}
      />
      {showText && (
        <span
          className="font-display"
          style={{
            fontSize: textSize,
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
