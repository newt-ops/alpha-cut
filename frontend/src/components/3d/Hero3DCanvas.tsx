import React from 'react';

export interface Hero3DCanvasProps {
  className?: string;
}

export const Hero3DCanvas: React.FC<Hero3DCanvasProps> = ({ className = '' }) => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden',
      }}
      className={`hero-3d-wrapper ${className}`}
    >
      {/* 3D Canvas Layer for Raw GLB/GLTF Assets */}
    </div>
  );
};
