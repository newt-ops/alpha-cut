import React from 'react';
import { useTheme } from '@context/ThemeContext';

export interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'medium', showText = true, className = '' }) => {
  const { theme } = useTheme();

  const sizeMap: Record<string, { img: number; text: string }> = {
    small: { img: 22, text: '14px' },
    medium: { img: 28, text: '17px' },
    large: { img: 40, text: '22px' },
  };

  const { img: imgSize, text: textSize } = sizeMap[size] || sizeMap.medium;

  const logoSrc = theme === 'dark' ? '/alpha-logo-dark.png' : '/alpha-logo-light.png';

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
        src={logoSrc}
        alt="Alpha Cut Logo"
        className="app-logo-img"
        width={imgSize}
        height={imgSize}
        style={{
          height: `${imgSize}px`,
          width: 'auto',
          maxHeight: `${imgSize}px`,
          flexShrink: 0,
        }}
      />
      {showText && (
        <span
          className="logo-text font-display"
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
