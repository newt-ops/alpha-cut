import React, { useState, useRef, ReactNode, CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  delay?: number;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, delay = 200, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<any>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const positionStyles: Record<string, CSSProperties> = {
    top: { bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' },
    bottom: { top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' },
    left: { right: 'calc(100% + 8px)', top: '50%', transform: 'translateY(-50%)' },
    right: { left: 'calc(100% + 8px)', top: '50%', transform: 'translateY(-50%)' },
  };

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            style={{
              position: 'absolute',
              zIndex: 500,
              padding: '6px 12px',
              backgroundColor: 'var(--surface)',
              color: 'var(--ink)',
              fontSize: '12px',
              fontWeight: 500,
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--line)',
              boxShadow: 'var(--shadow-sm)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              ...positionStyles[position],
            }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
