import React from 'react';
import { Contract } from '../../types';
import { Badge } from '@components/ui/Badge';
import { IconZap, IconClock } from '@icons/icons';

interface TelegramContractCardProps {
  contract: Contract;
}

export const TelegramContractCard: React.FC<TelegramContractCardProps> = ({ contract }) => {
  const isMonthly = (contract.frequency || 'monthly').toLowerCase().includes('month');

  return (
    <div
      style={{
        backgroundColor: 'var(--surface)',
        borderRadius: '16px',
        border: '1px solid var(--line)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {/* Header: Tier & Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(201,168,76,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-gold)',
            }}
          >
            <IconZap size={16} />
          </div>
          <div>
            <h3 className="font-display" style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>
              {contract.packageTier ? contract.packageTier.toUpperCase() : 'RETAINER'} CONTRACT
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>
              Billing: {contract.frequency || 'Monthly'}
            </span>
          </div>
        </div>
        <Badge variant={contract.status === 'active' ? 'success' : 'neutral'} size="small">
          {contract.status.toUpperCase()}
        </Badge>
      </div>

      {/* Pricing & Dates */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          padding: '10px 12px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.04)',
        }}
      >
        <div>
          <span style={{ fontSize: '10px', color: 'var(--ink-soft)', display: 'block', textTransform: 'uppercase' }}>MONTHLY RETAINER</span>
          <strong style={{ fontSize: '14px', color: 'var(--accent-gold)' }}>
            {contract.monthlyPrice} {contract.currency}
          </strong>
        </div>
        <div>
          <span style={{ fontSize: '10px', color: 'var(--ink-soft)', display: 'block', textTransform: 'uppercase' }}>START DATE</span>
          <span style={{ fontSize: '13px', color: 'var(--ink)' }}>
            {contract.startDate ? new Date(contract.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Active'}
          </span>
        </div>
      </div>

      {/* Retainer Notes if any */}
      {contract.notes && (
        <p style={{ fontSize: '12px', color: 'var(--ink-soft)', lineHeight: 1.4, margin: 0 }}>
          {contract.notes}
        </p>
      )}
    </div>
  );
};
