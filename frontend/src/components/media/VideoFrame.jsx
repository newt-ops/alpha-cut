import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@components/ui/Badge';
import { IconPlay } from '@icons/icons';

export const VideoFrame = ({
  title = 'Long-Form Video Edit',
  styleName = '16:9 Format Edit',
  duration = '4:20',
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{ scale: isHovered ? 1.02 : 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 9',
        backgroundColor: '#170B06',
        borderRadius: 'var(--radius-lg)',
        border: '2px solid var(--line)',
        boxShadow: isHovered ? '0 20px 40px -15px rgba(201, 160, 107, 0.3)' : 'var(--shadow-sm)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px',
        color: '#FBEFE1',
        cursor: 'pointer',
      }}
      className={`video-frame-wrapper ${className}`}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
        <Badge variant="gold" size="small">16:9 WIDESCREEN</Badge>
        <span className="font-mono" style={{ fontSize: '11px', color: 'rgba(251,239,225,0.6)' }}>
          {duration}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 'auto 0', zIndex: 2 }}>
        <motion.div
          animate={{ scale: isHovered ? 1.15 : 1 }}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'rgba(201, 160, 107, 0.25)',
            border: '2px solid var(--accent-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(8px)',
          }}
        >
          <IconPlay size={28} color="var(--accent-gold)" />
        </motion.div>
      </div>

      <div
        style={{
          zIndex: 2,
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(36, 18, 9, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(251, 239, 225, 0.1)',
        }}
      >
        <span className="font-mono" style={{ fontSize: '10px', color: 'var(--accent-gold)', display: 'block' }}>
          {styleName}
        </span>
        <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#FBEFE1' }}>{title}</h4>
      </div>

      {/* Grid Pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(to right, rgba(201, 160, 107, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(201, 160, 107, 0.05) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
          pointerEvents: 'none',
        }}
      />
    </motion.div>
  );
};
