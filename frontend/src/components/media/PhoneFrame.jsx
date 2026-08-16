import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@components/ui/Badge';
import { IconPlay, IconFilmReel } from '@icons/icons';

export const PhoneFrame = ({
  title = 'Sample Edit Title',
  styleName = 'Editing Style',
  duration = '0:60',
  formatLabel = '9:16 FORMAT',
  className = '',
}) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const clampX = (y / (rect.height / 2)) * -10;
    const clampY = (x / (rect.width / 2)) * 10;

    setRotateX(clampX);
    setRotateY(clampY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  return (
    <div
      style={{ perspective: 1000, width: '100%', maxWidth: '280px', margin: '0 auto' }}
      className={`phone-frame-wrapper ${className}`}
    >
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        animate={{ rotateX, rotateY, scale: isHovered ? 1.03 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '9 / 16',
          backgroundColor: '#170B06',
          borderRadius: '36px',
          border: '3px solid var(--line)',
          boxShadow: isHovered ? '0 30px 60px -20px rgba(201, 160, 107, 0.4)' : 'var(--shadow)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '16px',
          color: '#FBEFE1',
          userSelect: 'none',
          cursor: 'pointer',
        }}
      >
        {/* Top Speaker Notch */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80px',
            height: '14px',
            backgroundColor: '#0F0704',
            borderRadius: '10px',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '28px',
              height: '4px',
              backgroundColor: 'rgba(251, 239, 225, 0.2)',
              borderRadius: '2px',
            }}
          />
        </div>

        {/* Header Tags inside Phone */}
        <div
          style={{
            marginTop: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 2,
          }}
        >
          <Badge variant="gold" size="small">
            {formatLabel}
          </Badge>
          <span className="font-mono" style={{ fontSize: '11px', color: 'rgba(251, 239, 225, 0.6)' }}>
            {duration}
          </span>
        </div>

        {/* Center Canvas / Play Indicator */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            zIndex: 2,
            margin: 'auto 0',
          }}
        >
          <motion.div
            animate={{ scale: isHovered ? 1.15 : 1 }}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(201, 160, 107, 0.2)',
              border: '1.5px solid var(--accent-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(8px)',
            }}
          >
            <IconPlay size={24} color="var(--accent-gold)" />
          </motion.div>
          <span
            className="font-mono"
            style={{
              fontSize: '10px',
              color: 'var(--accent-gold)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Preview Sample Edit
          </span>
        </div>

        {/* Footer Info inside Phone */}
        <div
          style={{
            zIndex: 2,
            padding: '12px',
            borderRadius: '16px',
            backgroundColor: 'rgba(36, 18, 9, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(251, 239, 225, 0.1)',
          }}
        >
          <span
            className="font-mono"
            style={{
              fontSize: '10px',
              color: 'var(--accent-gold)',
              display: 'block',
              marginBottom: '2px',
            }}
          >
            {styleName}
          </span>
          <p
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#FBEFE1',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </p>
        </div>

        {/* Background Grid Accent inside Phone */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(to right, rgba(201, 160, 107, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(201, 160, 107, 0.05) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            pointerEvents: 'none',
          }}
        />
      </motion.div>
    </div>
  );
};
