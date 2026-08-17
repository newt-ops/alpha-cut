import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconClose } from '@icons/icons';

export const Modal = ({
  isOpen = false,
  onClose,
  title,
  children,
  maxWidth = '560px',
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          {/* Backdrop with subtle glassmorphism */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(23, 11, 6, 0.75)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth,
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow)',
              padding: '28px',
              zIndex: 1001,
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: title ? '20px' : '0',
                paddingBottom: title ? '12px' : '0',
                borderBottom: title ? '1px solid var(--line)' : 'none',
                flexShrink: 0,
              }}
            >
              {title && (
                <h3
                  className="font-display"
                  style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    color: 'var(--ink)',
                  }}
                >
                  {title}
                </h3>
              )}
              <button
                onClick={onClose}
                type="button"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--bg)',
                  border: '1px solid var(--line)',
                  color: 'var(--ink-soft)',
                  cursor: 'pointer',
                  marginLeft: 'auto',
                }}
              >
                <IconClose size={18} />
              </button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
