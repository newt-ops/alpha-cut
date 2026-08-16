import React from 'react';
import { IconCheck } from '@icons/icons';

export const Stepper = ({ steps = [], currentStep = 0, className = '' }) => {
  return (
    <div
      className={`custom-stepper-container ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        position: 'relative',
        padding: '10px 0',
      }}
    >
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={index}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                zIndex: 2,
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '14px',
                  backgroundColor: isCompleted
                    ? 'var(--accent-gold)'
                    : isActive
                    ? 'var(--surface)'
                    : 'var(--bg)',
                  color: isCompleted
                    ? '#170B06'
                    : isActive
                    ? 'var(--accent-gold)'
                    : 'var(--ink-soft)',
                  border: `2px solid ${
                    isCompleted || isActive ? 'var(--accent-gold)' : 'var(--line)'
                  }`,
                  transition: 'all var(--transition-smooth)',
                }}
              >
                {isCompleted ? <IconCheck size={18} color="#170B06" /> : index + 1}
              </div>
              <span
                className="font-mono"
                style={{
                  fontSize: '11px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--ink)' : 'var(--ink-soft)',
                  textAlign: 'center',
                  maxWidth: '90px',
                }}
              >
                {step.label}
              </span>
            </div>

            {!isLast && (
              <div
                style={{
                  flex: 1,
                  height: '2px',
                  backgroundColor: index < currentStep ? 'var(--accent-gold)' : 'var(--line)',
                  margin: '0 8px',
                  marginTop: '-24px',
                  transition: 'background-color var(--transition-smooth)',
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
