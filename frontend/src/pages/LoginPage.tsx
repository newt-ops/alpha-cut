import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { useAuth } from '@context/AuthContext';
import { useToast } from '@components/ui/Toast';
import { IconGoogle, IconUser, IconCheck } from '@icons/icons';
import { Logo } from '@components/ui/Logo';

export const LoginPage: React.FC = () => {
  const { login, loginWithGoogle, isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const from = (location.state as any)?.from?.pathname || (user?.role === 'admin' ? '/admin' : '/dashboard');

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email address and password.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await login(email, password);
      toast({ message: 'Welcome back!', type: 'success' });
    } catch (err: any) {
      if (err.message && err.message.includes('verify your email')) {
        toast({ message: 'Email address not verified yet. Please check your inbox.', type: 'info' });
        navigate('/verify-email');
        return;
      }
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleClick = () => {
    if (typeof window !== 'undefined' && (window as any).google && (window as any).google.accounts) {
      (window as any).google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '592216295265-6n5uqjepnlvn45nbto2o4chvf3q1cen9.apps.googleusercontent.com',
        callback: async (response: any) => {
          try {
            setIsGoogleLoading(true);
            await loginWithGoogle(response.credential);
            toast({ message: 'Welcome back!', type: 'success' });
          } catch (err: any) {
            toast({ message: err.message || 'Google sign-in failed', type: 'error' });
          } finally {
            setIsGoogleLoading(false);
          }
        },
      });
      (window as any).google.accounts.id.prompt();
    } else {
      toast({ message: 'Google Sign-In is initializing, please wait a moment...', type: 'info' });
    }
  };

  return (
    <div style={{ padding: '60px 0', maxWidth: '440px', margin: '0 auto' }} className="login-page">
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ marginBottom: '16px' }}>
          <Logo size="large" />
        </div>
        <Badge variant="gold">Client & Admin Access</Badge>
        <h1 className="font-display" style={{ fontSize: '32px', marginTop: '12px' }}>
          Welcome to Alpha Cut
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--ink-soft)', marginTop: '8px', lineHeight: 1.6 }}>
          Sign in to access your proposals, deliverables, and project workspace.
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
        <form onSubmit={handleLogin} style={{ display: 'grid', gap: '16px' }}>
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
            label="Email Address *"
            type="email"
            placeholder="client@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={IconUser}
            required
          />

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Password *</label>
              <Link to="/forgot-password" style={{ fontSize: '12px', color: 'var(--accent-gold)', fontWeight: 600 }}>
                Forgot Password?
              </Link>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" variant="primary" fullWidth size="large" isLoading={isLoading} iconRight={IconCheck}>
            Log In
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
          Don't have an account yet?{' '}
          <Link to="/signup" style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};
