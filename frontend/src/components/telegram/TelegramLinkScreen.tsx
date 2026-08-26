import React, { useState, useRef } from 'react';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { Input } from '@components/ui/Input';
import { useToast } from '@components/ui/Toast';
import { triggerHaptic, triggerHapticNotification } from '../../utils/telegramSdk';
import { IconShield, IconZap, IconCheck, IconUser } from '@icons/icons';

interface TelegramLinkScreenProps {
  onLinkSubmit: (code: string) => Promise<boolean>;
  onLinkWithCredentials?: (email: string, password: string) => Promise<boolean>;
  telegramUser?: any;
}

export const TelegramLinkScreen: React.FC<TelegramLinkScreenProps> = ({
  onLinkSubmit,
  onLinkWithCredentials,
  telegramUser,
}) => {
  const { toast } = useToast();
  const [activeMode, setActiveMode] = useState<'code' | 'login'>('code');

  // Code state
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [submittingCode, setSubmittingCode] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Web Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submittingLogin, setSubmittingLogin] = useState(false);

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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast({ message: 'Please enter both email and password', type: 'error' });
      triggerHapticNotification('error');
      return;
    }

    if (!onLinkWithCredentials) return;

    try {
      setSubmittingLogin(true);
      triggerHaptic('medium');
      await onLinkWithCredentials(email.trim(), password);
      triggerHapticNotification('success');
      toast({ message: 'Logged in and Telegram account linked successfully!', type: 'success' });
    } catch (err: any) {
      triggerHapticNotification('error');
      toast({ message: err.message || 'Login failed. Check your email and password.', type: 'error' });
    } finally {
      setSubmittingLogin(false);
    }
  };

  const displayName = telegramUser?.first_name || telegramUser?.username || 'User';

  return (
    <div style={{ padding: '16px 0', maxWidth: '440px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <Badge variant="gold" size="small">ONE-TIME SETUP</Badge>
        <h1 className="font-display" style={{ fontSize: '22px', marginTop: '8px', color: 'var(--ink)' }}>
          Connect Telegram Account
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '6px', lineHeight: 1.5 }}>
          Telegram profile detected: <strong style={{ color: 'var(--accent-gold)' }}>{displayName}</strong>
          {telegramUser?.username && <> (@{telegramUser.username})</>}. Connect your account below to access your workspace.
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          padding: '3px',
          marginBottom: '16px',
          border: '1px solid var(--line)',
        }}
      >
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setActiveMode('code');
          }}
          style={{
            padding: '8px 12px',
            borderRadius: '9px',
            border: 'none',
            backgroundColor: activeMode === 'code' ? 'rgba(201,168,76,0.2)' : 'transparent',
            color: activeMode === 'code' ? 'var(--accent-gold)' : 'var(--ink-soft)',
            fontWeight: activeMode === 'code' ? 600 : 400,
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          6-Digit Link Code
        </button>
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setActiveMode('login');
          }}
          style={{
            padding: '8px 12px',
            borderRadius: '9px',
            border: 'none',
            backgroundColor: activeMode === 'login' ? 'rgba(201,168,76,0.2)' : 'transparent',
            color: activeMode === 'login' ? 'var(--accent-gold)' : 'var(--ink-soft)',
            fontWeight: activeMode === 'login' ? 600 : 400,
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          Log In with Email
        </button>
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
        {activeMode === 'code' ? (
          <form onSubmit={handleCodeSubmit}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: '12px', textAlign: 'center' }}>
              ENTER 6-DIGIT DASHBOARD CODE
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

            <Button variant="primary" type="submit" isLoading={submittingCode} fullWidth size="large" iconRight={IconCheck}>
              Connect & Open Workspace
            </Button>

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--line)', fontSize: '12px', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
                <IconShield size={14} color="var(--accent-gold)" /> How to get a code:
              </div>
              1. Open <strong>alpha-cut.com</strong> on your computer<br />
              2. Go to <strong>Settings → Connect Telegram</strong><br />
              3. Copy your unique 6-digit code
            </div>
          </form>
        ) : (
          <form onSubmit={handleLoginSubmit} style={{ display: 'grid', gap: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink-soft)', textAlign: 'center', marginBottom: '4px' }}>
              LOG IN TO ALPHA CUT ACCOUNT
            </label>

            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button variant="primary" type="submit" isLoading={submittingLogin} fullWidth size="large" iconRight={IconCheck}>
              Log In & Link Telegram
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
