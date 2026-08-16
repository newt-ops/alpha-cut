import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { useAuth } from '@context/AuthContext';
import { useToast } from '@components/ui/Toast';
import { IconArrowRight, IconLock, IconUser } from '@icons/icons';

export const SignupPage = () => {
  const { signup, loginWithGoogle } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleClick = () => {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy_google_client_id',
        callback: async (response) => {
          try {
            setIsLoading(true);
            await loginWithGoogle(response.credential);
            toast({ message: 'Welcome!', type: 'success' });
          } catch (err) {
            toast({ message: err.message || 'Google sign-in failed', type: 'error' });
          } finally {
            setIsLoading(false);
          }
        },
      });
      window.google.accounts.id.prompt();
    } else {
      toast({ message: 'Google Sign-In is initializing, please wait a moment...', type: 'info' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await signup(name, email, password);
      toast({ message: 'Account created! Please check your email for the verification code.', type: 'success' });
      navigate('/verify-email');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px 0', maxWidth: '440px', margin: '0 auto' }} className="signup-page">
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Badge variant="gold">Client Registration</Badge>
        <h1 className="font-display" style={{ fontSize: '32px', marginTop: '12px' }}>
          Create Your Account
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--ink-soft)', marginTop: '6px' }}>
          Register to receive video proposals, manage deliverables, and link Telegram updates.
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
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={IconUser}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="client@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={IconUser}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={IconLock}
            required
          />

          <Button type="submit" variant="primary" fullWidth isLoading={isLoading} iconRight={IconArrowRight}>
            Create Account
          </Button>
        </form>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            margin: '24px 0',
            color: 'var(--ink-soft)',
            fontSize: '12px',
          }}
        >
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--line)' }} />
          <span>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--line)' }} />
        </div>

        <Button variant="secondary" fullWidth onClick={handleGoogleClick}>
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
