import React, { useState, FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { useToast } from '@components/ui/Toast';
import { customFetch } from '../utils/api';
import { IconCheck, IconLock } from '@icons/icons';

export const ResetPasswordPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState((location.state as any)?.email || '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !code || !newPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const res = await customFetch('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, code, newPassword }),
      });

      if (res.success) {
        toast({ message: res.message, type: 'success' });
        navigate('/login');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px 0', maxWidth: '440px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Badge variant="gold">Password Reset</Badge>
        <h1 className="font-display" style={{ fontSize: '32px', marginTop: '12px' }}>
          Reset Your Password
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--ink-soft)', marginTop: '6px' }}>
          Enter the 6-digit code sent to your email along with your new password.
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
            label="6-Digit Reset Code"
            type="text"
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />

          <Input
            label="New Password"
            type="password"
            placeholder="Minimum 8 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            icon={IconLock}
            required
          />

          <Button type="submit" variant="primary" fullWidth isLoading={isLoading} iconRight={IconCheck}>
            Reset Password
          </Button>
        </form>
      </div>
    </div>
  );
};
