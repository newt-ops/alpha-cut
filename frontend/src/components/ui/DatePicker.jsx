import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconCalendar, IconChevronRight } from '@icons/icons';

export const DatePicker = ({
  value,
  onChange,
  label = 'Deadline Date',
  placeholder = 'Select deadline...',
  error,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedDate = value ? new Date(value) : null;
  const [viewDate, setViewDate] = useState(selectedDate || new Date());

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleSelectDay = (day) => {
    const newDate = new Date(currentYear, currentMonth, day);
    const formatted = newDate.toISOString().split('T')[0];
    onChange(formatted);
    setIsOpen(false);
  };

  const formattedDisplay = selectedDate
    ? `${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()].slice(0, 3)} ${selectedDate.getFullYear()}`
    : placeholder;

  return (
    <div
      ref={containerRef}
      className={`custom-datepicker ${className}`}
      style={{ position: 'relative', width: '100%', marginBottom: '16px' }}
    >
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '13px',
            fontWeight: 600,
            color: error ? '#E53E3E' : isOpen ? 'var(--accent-gold)' : 'var(--ink-soft)',
          }}
        >
          {label}
        </label>
      )}

      <div
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '46px',
          padding: '0 16px',
          backgroundColor: 'var(--surface)',
          border: `1px solid ${error ? '#E53E3E' : isOpen ? 'var(--accent-gold)' : 'var(--line)'}`,
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          boxShadow: isOpen ? '0 0 0 3px rgba(201, 160, 107, 0.2)' : 'none',
          userSelect: 'none',
          transition: 'all var(--transition-fast)',
        }}
      >
        <span style={{ fontSize: '14px', color: selectedDate ? 'var(--ink)' : 'var(--ink-soft)' }}>
          {formattedDisplay}
        </span>
        <IconCalendar size={18} color="var(--accent-gold)" />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              zIndex: 100,
              width: '280px',
              maxWidth: 'calc(100vw - 40px)',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow)',
              padding: '16px',
              userSelect: 'none',
              boxSizing: 'border-box',
            }}
          >
            {/* Month Header Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <button
                onClick={handlePrevMonth}
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transform: 'rotate(180deg)',
                  display: 'flex',
                  color: 'var(--ink)',
                }}
              >
                <IconChevronRight size={18} />
              </button>

              <span className="font-display" style={{ fontSize: '14px', fontWeight: 700 }}>
                {monthNames[currentMonth]} {currentYear}
              </span>

              <button
                onClick={handleNextMonth}
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  color: 'var(--ink)',
                }}
              >
                <IconChevronRight size={18} />
              </button>
            </div>

            {/* Days of Week Header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '8px' }}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <span key={i} className="font-mono" style={{ fontSize: '10px', color: 'var(--ink-soft)' }}>
                  {d}
                </span>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isSelected = selectedDate &&
                  selectedDate.getDate() === day &&
                  selectedDate.getMonth() === currentMonth &&
                  selectedDate.getFullYear() === currentYear;

                const today = new Date();
                const isToday = today.getDate() === day &&
                  today.getMonth() === currentMonth &&
                  today.getFullYear() === currentYear;

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleSelectDay(day)}
                    style={{
                      height: '32px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isSelected ? 'var(--accent-gold)' : 'transparent',
                      color: isSelected ? '#170B06' : isToday ? 'var(--accent-gold)' : 'var(--ink)',
                      fontWeight: isSelected || isToday ? 700 : 500,
                      fontSize: '13px',
                      border: isSelected ? 'none' : isToday ? '1px solid var(--accent-gold)' : '1px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p style={{ fontSize: '12px', color: '#E53E3E', marginTop: '4px', fontWeight: 500 }}>
          {error}
        </p>
      )}
    </div>
  );
};
