import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { useAuth } from '@context/AuthContext';
import { useToast } from '@components/ui/Toast';
import { IconGoogle, IconUser, IconCheck } from '@icons/icons';
import { TurnstileWidget } from '@components/ui/TurnstileWidget';

export const SignupPage: React.FC = () => {
  const { signup, initiateGoogleRedirect } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!turnstileToken) {
      setError('Please verify that you are not a robot before signing up.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await signup(name, email, password, turnstileToken);
      toast({ message: 'Account created! Verification code sent to your email.', type: 'success' });
      navigate('/verify-email');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleClick = () => {
    try {
      setIsGoogleLoading(true);
      initiateGoogleRedirect();
    } catch (err: any) {
      toast({ message: 'Failed to initiate Google sign-in redirect.', type: 'error' });
      setIsGoogleLoading(false);
    }
  };

  return (
    <div style={{ padding: '60px 0', maxWidth: '440px', margin: '0 auto' }} className="signup-page">
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Badge variant="gold">Client Registration</Badge>
        <h1 className="font-display" style={{ fontSize: '32px', marginTop: '12px' }}>
          Create Your Account
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--ink-soft)', marginTop: '8px', lineHeight: 1.6 }}>
          Register to receive custom proposals, track video deliverables, and access your project workspace.
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
        <form onSubmit={handleSignup} style={{ display: 'grid', gap: '16px' }}>
          {error && (
            <div
              style={{
                backgroundColor: 'rgba(229, 62, 62, 0.1)',
                border: '1px solid #E53E3E',
                color: '#E53E3E',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
              }}
            >
              {error}
            </div>
          )}

          <Input
            label="Full Name *"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={IconUser}
            required
          />

          <Input
            label="Email Address *"
            type="email"
            placeholder="client@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password *"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <TurnstileWidget onVerify={(token) => setTurnstileToken(token)} />

          <Button type="submit" variant="primary" fullWidth size="large" isLoading={isLoading} iconRight={IconCheck}>
            Create Account
          </Button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--line)' }} />
          <span style={{ fontSize: '12px', color: 'var(--ink-soft)', textTransform: 'uppercase', fontWeight: 600 }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--line)' }} />
        </div>

        <Button
          variant="google"
          fullWidth
          size="large"
          iconLeft={IconGoogle}
          isLoading={isGoogleLoading}
          onClick={handleGoogleClick}
        >
          Continue with Google
        </Button>

        <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--ink-soft)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};
