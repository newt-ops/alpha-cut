import React, { useState, useRef } from 'react';
import { useToast } from '@components/ui/Toast';
import { triggerHaptic, triggerHapticNotification } from '../../../utils/telegramSdk';
import { IconShield, IconCheck, IconExternalLink } from '@icons/icons';

interface TelegramLinkScreenProps {
  onLinkSubmit: (code: string) => Promise<boolean>;
  telegramUser?: any;
}

export const TelegramLinkScreen: React.FC<TelegramLinkScreenProps> = ({
  onLinkSubmit,
  telegramUser,
}) => {
  const { toast } = useToast();

  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [submittingCode, setSubmittingCode] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleDigitChange = (index: number, value: string) => {
    const char = value.toUpperCase().slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    triggerHaptic('light');

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

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = digits.join('');
    if (fullCode.length < 6) {
      toast({ message: 'Please enter all 6 digits of your linking code', type: 'error' });
      triggerHapticNotification('error');
      return;
    }

    try {
      setSubmittingCode(true);
      triggerHaptic('medium');
      await onLinkSubmit(fullCode);
      triggerHapticNotification('success');
      toast({ message: 'Account linked successfully!', type: 'success' });
    } catch (err: any) {
      triggerHapticNotification('error');
      toast({ message: err.message || 'Linking failed. Please check your code.', type: 'error' });
    } finally {
      setSubmittingCode(false);
    }
  };

  const displayName = telegramUser?.first_name || telegramUser?.username || 'User';

  return (
    <div style={{ padding: '16px 0', maxWidth: '440px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0, color: 'var(--tg-theme-text-color, var(--tg-text, #ffffff))' }}>
          Account Not Linked
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--tg-theme-hint-color, var(--tg-hint, #708499))', marginTop: '6px', lineHeight: 1.5 }}>
          Telegram profile detected: <strong style={{ color: 'var(--tg-theme-link-color, var(--tg-link, #64b5ef))' }}>{displayName}</strong>
          {telegramUser?.username && <> (@{telegramUser.username})</>}. Connect your web workspace below.
        </p>
      </div>

      <div
        style={{
          backgroundColor: 'var(--tg-theme-secondary-bg-color, var(--tg-secondary-bg, #232e3c))',
          borderRadius: '12px',
          padding: '24px 20px',
        }}
      >
        <form onSubmit={handleCodeSubmit}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--tg-theme-hint-color, var(--tg-hint, #708499))', marginBottom: '12px', textAlign: 'center', letterSpacing: '0.4px' }}>
            ENTER 6-DIGIT CODE FROM WEB DASHBOARD
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
                  width: '42px',
                  height: '48px',
                  textAlign: 'center',
                  fontSize: '20px',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  color: 'var(--tg-theme-text-color, var(--tg-text, #ffffff))',
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  border: digit ? '2px solid var(--tg-theme-link-color, var(--tg-link, #64b5ef))' : '1px solid rgba(120, 120, 128, 0.2)',
                  borderRadius: '10px',
                  outline: 'none',
                  transition: 'all 0.15s ease',
                }}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={submittingCode}
            style={{
              width: '100%',
              height: '44px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: 'var(--tg-theme-button-color, var(--tg-button, #5288c1))',
              color: 'var(--tg-theme-button-text-color, var(--tg-button-text, #ffffff))',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <IconCheck size={18} />
            <span>{submittingCode ? 'Connecting...' : 'Connect Account'}</span>
          </button>

          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(120, 120, 128, 0.15)', fontSize: '12px', color: 'var(--tg-theme-hint-color, var(--tg-hint, #708499))', lineHeight: 1.6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--tg-theme-text-color, var(--tg-text, #ffffff))', marginBottom: '8px' }}>
              <IconShield size={14} color="var(--tg-theme-link-color, var(--tg-link, #64b5ef))" /> How to link your account:
            </div>
            1. Log into your <strong>Alpha Cut Web Dashboard</strong><br />
            2. Click <strong>Connect Telegram</strong> to generate your code<br />
            3. Enter the 6-digit code above
          </div>

          <div style={{ marginTop: '16px' }}>
            <a href="https://alpha-cut.com/dashboard" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <button
                type="button"
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: '10px',
                  border: '1px solid rgba(120, 120, 128, 0.2)',
                  backgroundColor: 'transparent',
                  color: 'var(--tg-theme-link-color, var(--tg-link, #64b5ef))',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <span>Open Web Dashboard</span>
                <IconExternalLink size={16} />
              </button>
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};
