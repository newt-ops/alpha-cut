import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { useAuth } from '@context/AuthContext';
import { useToast } from '@components/ui/Toast';
import { IconArrowRight, IconLock, IconUser } from '@icons/icons';

export const LoginPage = () => {
  const { login, loginWithGoogle, isAuthenticated, user, setUnverifiedEmail } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || (user?.role === 'admin' ? '/admin' : '/dashboard');

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Google OAuth button initialization
  useEffect(() => {
    /* global google */
    if (window.google && window.google.accounts) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy_google_client_id',
        callback: async (response) => {
          try {
            setIsLoading(true);
            await loginWithGoogle(response.credential);
            toast({ message: 'Welcome back!', type: 'success' });
          } catch (err) {
            toast({ message: err.message || 'Google sign-in failed', type: 'error' });
          } finally {
            setIsLoading(false);
          }
        },
      });
    }
  }, [loginWithGoogle, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await login(email, password);
      toast({ message: 'Logged in successfully!', type: 'success' });
    } catch (err) {
      setError(err.message);
      if (err.message.includes('verify your email')) {
        setUnverifiedEmail(email);
        setTimeout(() => navigate('/verify-email'), 1500);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px 0', maxWidth: '440px', margin: '0 auto' }} className="login-page">
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Badge variant="gold">Client & Admin Access</Badge>
        <h1 className="font-display" style={{ fontSize: '32px', marginTop: '12px' }}>
          Log In to Alpha Cut
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--ink-soft)', marginTop: '6px' }}>
          Access your video project proposals, deliverables, and agency dashboard.
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
            icon={IconUser}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={IconLock}
            required
          />

          <Button type="submit" variant="primary" fullWidth isLoading={isLoading} iconRight={IconArrowRight}>
            Log In
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

        {/* Google OAuth Button */}
        <Button
          variant="secondary"
          fullWidth
          onClick={() => {
            if (window.google && window.google.accounts) {
              window.google.accounts.id.prompt();
            } else {
              toast({ message: 'Google Sign-In is initializing...', type: 'info' });
            }
          }}
        >
          Continue with Google
        </Button>

        <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--ink-soft)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};
