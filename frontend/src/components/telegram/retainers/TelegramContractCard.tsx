import React from 'react';
import { Contract } from '../../../types';
import { IconZap } from '@icons/icons';

interface TelegramContractCardProps {
  contract: Contract;
  onAcceptContract?: (contract: Contract) => void;
  onDeclineContract?: (contract: Contract) => void;
}

const safeFormatDate = (dateVal: any, fallback = 'Active') => {
  if (!dateVal) return fallback;
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return fallback;
  }
};

export const TelegramContractCard: React.FC<TelegramContractCardProps> = ({ contract, onAcceptContract, onDeclineContract }) => {
  const isProposed = contract?.status === 'proposed';
  const isActive = (contract?.status || 'active') === 'active';

  return (
    <div
      style={{
        backgroundColor: 'var(--tg-theme-secondary-bg-color, var(--tg-secondary-bg, #232e3c))',
        borderRadius: '12px',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        boxSizing: 'border-box',
      }}
    >
      {/* Header: Tier & Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IconZap size={18} color="var(--tg-theme-link-color, var(--tg-link, #64b5ef))" />
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--tg-theme-text-color, var(--tg-text, #ffffff))', margin: 0 }}>
              {contract.packageTier ? contract.packageTier.toUpperCase() : 'RETAINER'} CONTRACT
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--tg-theme-hint-color, var(--tg-hint, #708499))' }}>
              Billing: {contract.frequency || 'Monthly'}
            </span>
          </div>
        </div>

        <span
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: isProposed
              ? 'var(--tg-theme-link-color, var(--tg-link, #64b5ef))'
              : isActive
              ? '#34c759'
              : 'var(--tg-theme-hint-color, var(--tg-hint, #708499))',
            backgroundColor: 'rgba(120, 120, 128, 0.12)',
            padding: '3px 8px',
            borderRadius: '6px',
          }}
        >
          {isProposed ? 'Proposal Offered' : isActive ? 'Active' : contract.status}
        </span>
      </div>

      <div style={{ height: '1px', backgroundColor: 'rgba(120, 120, 128, 0.15)' }} />

      {/* Pricing & Dates */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
        <div>
          <span style={{ color: 'var(--tg-theme-hint-color, var(--tg-hint, #708499))', fontSize: '11px', display: 'block' }}>
            Monthly Retainer
          </span>
          <strong style={{ color: 'var(--tg-theme-text-color, var(--tg-text, #ffffff))' }}>
            {contract?.monthlyPrice ?? 0} {contract?.currency || 'USD'}
          </strong>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ color: 'var(--tg-theme-hint-color, var(--tg-hint, #708499))', fontSize: '11px', display: 'block' }}>
            Start Date
          </span>
          <span style={{ color: 'var(--tg-theme-text-color, var(--tg-text, #ffffff))' }}>
            {safeFormatDate(contract?.startDate)}
          </span>
        </div>
      </div>

      {/* Retainer Notes if any */}
      {contract.notes && (
        <p style={{ fontSize: '12px', color: 'var(--tg-theme-hint-color, var(--tg-hint, #708499))', lineHeight: 1.4, margin: '4px 0 0 0' }}>
          {contract.notes}
        </p>
      )}

      {/* Action Buttons for Proposed Retainers */}
      {isProposed && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
          {onDeclineContract && (
            <button
              type="button"
              onClick={() => onDeclineContract(contract)}
              style={{
                flex: 1,
                height: '42px',
                borderRadius: '10px',
                border: '1px solid rgba(229, 62, 62, 0.4)',
                backgroundColor: 'rgba(229, 62, 62, 0.1)',
                color: '#ff6b6b',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Decline
            </button>
          )}
          {onAcceptContract && (
            <button
              type="button"
              onClick={() => onAcceptContract(contract)}
              style={{
                flex: 2,
                height: '42px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: 'var(--tg-theme-button-color, var(--tg-button, #5288c1))',
                color: 'var(--tg-theme-button-text-color, var(--tg-button-text, #ffffff))',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Accept ({contract.monthlyPrice} {contract.currency}/mo)
            </button>
          )}
        </div>
      )}
    </div>
  );
};
