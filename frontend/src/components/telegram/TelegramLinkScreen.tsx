import React, { useState, useRef } from 'react';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { useToast } from '@components/ui/Toast';
import { triggerHaptic, triggerHapticNotification } from '../../utils/telegramSdk';
import { IconShield, IconZap, IconCheck } from '@icons/icons';

interface TelegramLinkScreenProps {
  onLinkSubmit: (code: string) => Promise<boolean>;
  telegramUser?: any;
}

export const TelegramLinkScreen: React.FC<TelegramLinkScreenProps> = ({ onLinkSubmit, telegramUser }) => {
  const { toast } = useToast();
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [submitting, setSubmitting] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleDigitChange = (index: number, value: string) => {
    const char = value.toUpperCase().slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    triggerHaptic('light');

    // Auto focus next input
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    if (pasted) {
      const newDigits = [...digits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setDigits(newDigits);
      triggerHaptic('medium');
      const focusIndex = Math.min(pasted.length, 5);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = digits.join('');
    if (fullCode.length < 6) {
      toast({ message: 'Please enter all 6 digits of your linking code', type: 'error' });
      triggerHapticNotification('error');
      return;
    }

    try {
      setSubmitting(true);
      triggerHaptic('medium');
      await onLinkSubmit(fullCode);
      triggerHapticNotification('success');
      toast({ message: 'Account linked successfully!', type: 'success' });
    } catch (err: any) {
      triggerHapticNotification('error');
      toast({ message: err.message || 'Linking failed. Please check your code.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '16px 0', maxWidth: '440px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <Badge variant="gold" size="small">TELEGRAM CONNECT</Badge>
        <h1 className="font-display" style={{ fontSize: '22px', marginTop: '8px', color: 'var(--ink)' }}>
          Link Your Alpha Cut Account
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '6px', lineHeight: 1.5 }}>
          {telegramUser?.first_name ? (
            <>Welcome <strong>{telegramUser.first_name}</strong>! Enter the 6-digit link code generated in your web dashboard.</>
          ) : (
            <>Enter the 6-digit link code generated in your web account dashboard to access your workspace.</>
          )}
        </p>
      </div>

      <div
        style={{
          backgroundColor: 'var(--surface)',
          borderRadius: '16px',
          border: '1px solid var(--line)',
          padding: '24px 20px',
          boxShadow: 'var(--shadow)',
        }}
      >
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: '12px', textAlign: 'center' }}>
            6-DIGIT LINKING CODE
          </label>
          
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '20px' }}>
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                style={{
                  width: '44px',
                  height: '52px',
                  textAlign: 'center',
                  fontSize: '22px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--accent-gold)',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: digit ? '2px solid var(--accent-gold)' : '1px solid var(--line)',
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'all 0.15s ease',
                }}
              />
            ))}
          </div>

          <Button variant="primary" type="submit" isLoading={submitting} fullWidth size="large" iconRight={IconCheck}>
            Connect Account
          </Button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--line)', fontSize: '12px', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
            <IconShield size={14} color="var(--accent-gold)" /> How to get a link code:
          </div>
          1. Log into <strong>alpha-cut.com</strong> on web<br />
          2. Go to <strong>Settings → Connect Telegram</strong><br />
          3. Copy your unique 6-digit authorization code
        </div>
      </div>
    </div>
  );
};
