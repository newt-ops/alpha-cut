import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { useToast } from '@components/ui/Toast';
import { customFetch } from '../utils/api';
import { IconCheck, IconExternalLink, IconShield } from '@icons/icons';

export const ChapaTestCheckoutPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const txRef = searchParams.get('tx_ref') || 'AC-PAY-TEST';
  const amount = searchParams.get('amount') || '1000';
  const currency = searchParams.get('currency') || 'ETB';

  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('telebirr');

  const handleSimulatePayment = async () => {
    try {
      setLoading(true);
      const res = await customFetch(`/api/payments/chapa/verify/${txRef}`);
      if (res.success) {
        toast({ message: '💳 Payment verified via Chapa Test Mode!', type: 'success' });
        navigate('/dashboard?payment=success');
      }
    } catch (err) {
      toast({ message: err.message || 'Payment simulation failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '60px 0', maxWidth: '480px', margin: '0 auto' }}>
      <div
        style={{
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          border: '2px solid var(--accent-gold)',
          padding: '36px 28px',
          boxShadow: 'var(--shadow)',
          textAlign: 'center',
        }}
      >
        <Badge variant="gold">Chapa.co Payment Gateway (Test Mode)</Badge>

        <h1 className="font-display" style={{ fontSize: '26px', marginTop: '14px', color: 'var(--ink)' }}>
          Pay {amount} {currency}
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '4px', marginBottom: '24px' }}>
          Simulating Chapa.co Test Checkout Gateway for Alpha Cut
        </p>

        {/* Payment Provider Selection */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px', textAlign: 'left' }}>
          {[
            { id: 'telebirr', name: 'Telebirr (TeleCOM)', icon: '📱' },
            { id: 'cbe', name: 'CBE Birr / Commercial', icon: '🏦' },
            { id: 'card', name: 'Visa / Mastercard', icon: '💳' },
            { id: 'awash', name: 'Awash Birr Mobile', icon: '⚡' },
          ].map((m) => (
            <div
              key={m.id}
              onClick={() => setSelectedMethod(m.id)}
              style={{
                backgroundColor: selectedMethod === m.id ? 'rgba(201, 160, 107, 0.15)' : 'var(--bg)',
                border: `2px solid ${selectedMethod === m.id ? 'var(--accent-gold)' : 'var(--line)'}`,
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>{m.icon}</span>
              <span>{m.name}</span>
            </div>
          ))}
        </div>

        <div style={{ backgroundColor: 'var(--bg)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', fontSize: '12px', color: 'var(--ink-soft)', marginBottom: '24px', textAlign: 'left' }}>
          <div><strong>Transaction Ref:</strong> <code>{txRef}</code></div>
          <div style={{ marginTop: '4px' }}><strong>Provider:</strong> Chapa.co Sandbox API</div>
        </div>

        <Button variant="primary" fullWidth size="large" isLoading={loading} onClick={handleSimulatePayment} iconRight={IconCheck}>
          Simulate Paid Success ({amount} {currency})
        </Button>

        <div style={{ marginTop: '16px' }}>
          <Button variant="ghost" fullWidth size="small" onClick={() => navigate('/dashboard')}>
            Cancel & Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};
