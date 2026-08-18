import React from 'react';

export const AdminSectionHeader = ({ title, subtitle, action }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid var(--line)',
      }}
    >
      <div>
        <h2 className="font-display" style={{ fontSize: '22px', fontWeight: 800, color: 'var(--ink)', margin: 0, lineHeight: 1.2 }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '4px', margin: 0 }}>
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {action}
        </div>
      )}
    </div>
  );
};
