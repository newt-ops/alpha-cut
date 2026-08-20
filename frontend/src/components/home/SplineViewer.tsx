import React, { Suspense, lazy, useState } from 'react';
import { motion } from 'framer-motion';

const Spline = lazy(() => import('@splinetool/react-spline'));

export interface SplineViewerProps {
  sceneUrl?: string;
  className?: string;
  height?: string;
  fallbackText?: string;
}

export const SplineViewer: React.FC<SplineViewerProps> = ({
  sceneUrl = 'https://prod.spline.design/PBQQBw8bfXDhBo7w/scene.splinecode',
  className = '',
  height = '480px',
  fallbackText = 'Loading 3D Interactive Canvas...',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        backgroundColor: 'rgba(23, 11, 6, 0.6)',
        border: '1px solid var(--line)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      className={`spline-container ${className}`}
    >
      {/* Loading Fallback Banner */}
      {!isLoaded && !hasError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            backgroundColor: 'var(--surface)',
            color: 'var(--ink-soft)',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '3px solid rgba(201, 160, 107, 0.2)',
              borderTopColor: 'var(--accent-gold)',
              animation: 'spin 1s linear infinite',
            }}
          />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>{fallbackText}</span>
        </motion.div>
      )}

      {/* 3D Spline Canvas */}
      {!hasError ? (
        <Suspense fallback={null}>
          <Spline
            scene={sceneUrl}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            style={{ width: '100%', height: '100%' }}
          />
        </Suspense>
      ) : (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--ink-soft)' }}>
          <p style={{ fontSize: '14px', margin: 0 }}>Interactive 3D Preview (Spline Scene Ready)</p>
        </div>
      )}
    </div>
  );
};
