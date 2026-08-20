import React, { CSSProperties } from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
  style?: CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  borderRadius = 'var(--radius-md)',
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`skeleton-loader ${className}`}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: 'var(--surface-hover)',
        animation: 'skeletonPulse 1.5s ease-in-out infinite',
        ...style,
      }}
    >
      <style>{`
        @keyframes skeletonPulse {
          0% { opacity: 0.6; }
          50% { opacity: 0.3; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};
