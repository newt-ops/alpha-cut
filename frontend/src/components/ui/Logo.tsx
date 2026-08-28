import React from 'react';
import { useTheme } from '@context/ThemeContext';

export interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'medium', showText = true, className = '' }) => {
  const { theme } = useTheme();

  const sizeMap: Record<string, { height: number; width: number; text: string }> = {
    small: { height: 22, width: 28, text: '14px' },
    medium: { height: 28, width: 35, text: '17px' },
    large: { height: 40, width: 51, text: '22px' },
  };

  const { height: imgHeight, width: imgWidth, text: textSize } = sizeMap[size] || sizeMap.medium;

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
        width={imgWidth}
        height={imgHeight}
        style={{
          height: `${imgHeight}px`,
          width: `${imgWidth}px`,
          maxHeight: `${imgHeight}px`,
          aspectRatio: '200 / 158',
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
