import React, { ReactNode } from 'react';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { IconPlus } from '@icons/icons';

export interface AdminSectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  action?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export const AdminSectionHeader: React.FC<AdminSectionHeaderProps> = ({ title, subtitle, badge, action, actionLabel, onAction }) => {
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
        {badge && <Badge variant="gold" size="small">{badge}</Badge>}
        <h2 className="font-display" style={{ fontSize: '22px', fontWeight: 800, color: 'var(--ink)', margin: 0, lineHeight: 1.2, marginTop: badge ? '6px' : 0 }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '4px', margin: 0 }}>
            {subtitle}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {action}
        {actionLabel && onAction && (
          <Button variant="primary" size="small" iconLeft={IconPlus} onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

