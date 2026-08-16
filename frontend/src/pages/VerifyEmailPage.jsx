import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { useAuth } from '@context/AuthContext';
import { useToast } from '@components/ui/Toast';
import { IconCheck, IconZap } from '@icons/icons';

export const VerifyEmailPage = () => {
  const { verifyEmail, resendVerification, unverifiedEmail } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState(unverifiedEmail || '');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email || !code) {
      setError('Please provide your email and 6-digit verification code.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await verifyEmail(email, code);
      toast({ message: 'Email verified successfully!', type: 'success' });
      navigate('/telegram-link');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Please enter your email address to resend code.');
      return;
    }
    try {
      await resendVerification(email);
      setCooldown(60);
      toast({ message: 'New verification code sent to your email.', type: 'info' });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '40px 0', maxWidth: '440px', margin: '0 auto' }} className="verify-email-page">
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Badge variant="gold">Email Security Verification</Badge>
        <h1 className="font-display" style={{ fontSize: '32px', marginTop: '12px' }}>
          Verify Your Email
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--ink-soft)', marginTop: '6px' }}>
          We sent a 6-digit verification code to your email. Enter it below to activate your account.
        </p>
      </div>

      <div
        style={{
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--line)',
          padding: '36px 28px',
          boxShadow: 'var(--shadow)',
        }}
      >
        <form onSubmit={handleVerify}>
          {error && (
            <div
              style={{
                backgroundColor: 'rgba(229, 62, 62, 0.1)',
                border: '1px solid #E53E3E',
                color: '#E53E3E',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                marginBottom: '20px',
              }}
            >
              {error}
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="client@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="6-Digit Verification Code"
            type="text"
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" fullWidth isLoading={isLoading} iconRight={IconCheck}>
            Verify Account
          </Button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Button
            variant="ghost"
            onClick={handleResend}
            isDisabled={cooldown > 0}
            iconLeft={IconZap}
          >
            {cooldown > 0 ? `Resend Code (${cooldown}s)` : 'Resend Verification Code'}
          </Button>
        </div>
      </div>
    </div>
  );
};
