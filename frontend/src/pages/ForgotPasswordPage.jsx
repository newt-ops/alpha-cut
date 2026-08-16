import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { useToast } from '@components/ui/Toast';
import { customFetch } from '../utils/api';
import { IconArrowRight, IconUser } from '@icons/icons';

export const ForgotPasswordPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsLoading(true);
      const res = await customFetch('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      setMessage(res.message);
      toast({ message: res.message, type: 'info' });
      setTimeout(() => navigate('/reset-password', { state: { email } }), 2000);
    } catch (err) {
      toast({ message: err.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px 0', maxWidth: '440px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Badge variant="gold">Account Recovery</Badge>
        <h1 className="font-display" style={{ fontSize: '32px', marginTop: '12px' }}>
          Forgot Password
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--ink-soft)', marginTop: '6px' }}>
          Enter your registered email address to receive a 6-digit password reset code.
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
        <form onSubmit={handleSubmit}>
          {message && (
            <div
              style={{
                backgroundColor: 'rgba(201, 160, 107, 0.15)',
                border: '1px solid var(--accent-gold)',
                color: 'var(--ink)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                marginBottom: '20px',
              }}
            >
              {message}
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="client@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={IconUser}
            required
          />

          <Button type="submit" variant="primary" fullWidth isLoading={isLoading} iconRight={IconArrowRight}>
            Send Reset Code
          </Button>
        </form>

        <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--ink-soft)' }}>
          Remember your password?{' '}
          <Link to="/login" style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};
