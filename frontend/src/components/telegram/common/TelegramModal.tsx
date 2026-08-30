import React, { useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconClose } from '@icons/icons';

export interface TelegramModalProps {
  isOpen?: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
}

export const TelegramModal: React.FC<TelegramModalProps> = ({
  isOpen = false,
  onClose,
  title,
  children,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
            zIndex: 9999,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: '0',
          }}
        >
          {/* Native Telegram Dark Overlay Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
          />

          {/* Native Telegram Sheet Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 420, damping: 36 }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '520px',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'var(--tg-theme-secondary-bg-color, var(--tg-secondary-bg, #232e3c))',
              color: 'var(--tg-theme-text-color, var(--tg-text, #ffffff))',
              borderRadius: '20px 20px 0 0',
              padding: '20px 20px calc(20px + env(safe-area-inset-bottom, 0px)) 20px',
              zIndex: 10000,
              boxSizing: 'border-box',
              boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.4)',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Grabber Handle */}
            <div
              style={{
                width: '36px',
                height: '4px',
                borderRadius: '2px',
                backgroundColor: 'rgba(120, 120, 128, 0.4)',
                margin: '0 auto 14px auto',
                flexShrink: 0,
              }}
            />

            {/* Header Title Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: title ? '16px' : '0',
                paddingBottom: title ? '12px' : '0',
                borderBottom: title ? '1px solid rgba(120, 120, 128, 0.15)' : 'none',
                flexShrink: 0,
              }}
            >
              {title && (
                <h3
                  style={{
                    fontSize: '17px',
                    fontWeight: 600,
                    color: 'var(--tg-theme-text-color, var(--tg-text, #ffffff))',
                    margin: 0,
                    letterSpacing: '-0.2px',
                  }}
                >
                  {title}
                </h3>
              )}
              <button
                onClick={onClose}
                type="button"
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(120, 120, 128, 0.16)',
                  border: 'none',
                  color: 'var(--tg-theme-hint-color, var(--tg-hint, #708499))',
                  cursor: 'pointer',
                  marginLeft: 'auto',
                }}
              >
                <IconClose size={16} />
              </button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '2px' }}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
