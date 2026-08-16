import React from 'react';
import { motion } from 'framer-motion';

export const PageWrapper = ({ children, className = '', showGrid = true }) => {
  return (
    <motion.main
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`page-wrapper ${showGrid ? 'bg-grid-pattern' : ''} ${className}`}
      style={{
        flex: 1,
        width: '100%',
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '40px 24px 80px 24px',
      }}
    >
      {children}
    </motion.main>
  );
};
