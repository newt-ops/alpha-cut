import React, { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconChevronDown } from '@icons/icons';

interface AccordionItemProps {
  title: string;
  children: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({ title, children, isOpen, onToggle }) => {
  return (
    <div
      style={{
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--surface)',
        overflow: 'hidden',
        marginBottom: '12px',
        transition: 'all var(--transition-fast)',
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 24px',
          textAlign: 'left',
          backgroundColor: 'transparent',
          color: 'var(--ink)',
          fontWeight: 600,
          fontSize: '16px',
        }}
      >
        <span className="font-display">{title}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <IconChevronDown size={20} color="var(--accent-gold)" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <div
              style={{
                padding: '0 24px 20px 24px',
                color: 'var(--ink-soft)',
                fontSize: '14px',
                lineHeight: 1.6,
                borderTop: '1px solid var(--line)',
                paddingTop: '16px',
              }}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export interface AccordionData {
  title: string;
  content: ReactNode;
}

interface AccordionProps {
  items?: AccordionData[];
  allowMultiple?: boolean;
}

export const Accordion: React.FC<AccordionProps> = ({ items = [], allowMultiple = false }) => {
  const [openIndexes, setOpenIndexes] = useState<number[]>([0]);

  const handleToggle = (index: number) => {
    if (allowMultiple) {
      setOpenIndexes((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
    } else {
      setOpenIndexes((prev) => (prev.includes(index) ? [] : [index]));
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          title={item.title}
          isOpen={openIndexes.includes(index)}
          onToggle={() => handleToggle(index)}
        >
          {item.content}
        </AccordionItem>
      ))}
    </div>
  );
};
