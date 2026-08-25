import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { IconArrowRight, IconFilm, IconSparkles } from '@icons/icons';

export const NotFoundPage: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '75vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '60px 20px',
        position: 'relative',
      }}
      className="not-found-page"
    >
      {/* Glow Ambient Ring */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          backgroundColor: 'rgba(201, 160, 107, 0.06)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ position: 'relative', zIndex: 1, maxWidth: '640px' }}
      >
        <Badge variant="gold">404 — TIMELINE FRAME MISSING</Badge>

        <h1
          className="font-display"
          style={{
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 800,
            lineHeight: 1.1,
            color: 'var(--ink)',
            marginTop: '20px',
            marginBottom: '16px',
          }}
        >
          Left on the <span style={{ color: 'var(--accent-gold)' }}>Editing Room</span> Floor
        </h1>

        <p
          style={{
            fontSize: '16px',
            color: 'var(--ink-soft)',
            lineHeight: 1.6,
            marginBottom: '36px',
          }}
        >
          The page or video URL you are looking for has been trimmed, moved, or deleted from our project timeline.
        </p>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '14px',
          }}
        >
          <Link to="/">
            <Button variant="primary" size="large" iconRight={IconArrowRight}>
              Back to Homepage
            </Button>
          </Link>
          <Link to="/portfolio">
            <Button variant="secondary" size="large" iconLeft={IconFilm}>
              Explore Portfolio
            </Button>
          </Link>
          <Link to="/packages">
            <Button variant="ghost" size="large">
              View Packages & Rates
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
