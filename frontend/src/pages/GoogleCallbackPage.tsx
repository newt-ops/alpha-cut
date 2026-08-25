import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Badge } from '@components/ui/Badge';
import { Skeleton } from '@components/ui/Skeleton';
import { useAuth } from '@context/AuthContext';
import { useToast } from '@components/ui/Toast';
import { Logo } from '@components/ui/Logo';

export const GoogleCallbackPage: React.FC = () => {
  const { loginWithGoogleCode } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const savedState = sessionStorage.getItem('oauth_state');

      // 1. Validate state token to prevent CSRF attacks
      sessionStorage.removeItem('oauth_state');

      if (!state || !savedState || state !== savedState) {
        console.error('[OAUTH CSRF ERROR] State mismatch or token missing.');
        setError('Security check failed: Invalid OAuth state parameter. Please try logging in again.');
        toast({ message: 'Security check failed. Please log in again.', type: 'error' });
        setTimeout(() => navigate('/login', { replace: true }), 3000);
        return;
      }

      if (!code) {
        setError('No authorization code was returned from Google.');
        toast({ message: 'Google Sign-In was cancelled or failed.', type: 'error' });
        setTimeout(() => navigate('/login', { replace: true }), 3000);
        return;
      }

      try {
        const redirectUri = `${window.location.origin}/auth/google/callback`;
        const res = await loginWithGoogleCode(code, redirectUri);
        toast({ message: 'Welcome to Alpha Cut!', type: 'success' });
        const targetPath = res.user?.role === 'admin' ? '/admin' : '/dashboard';
        navigate(targetPath, { replace: true });
      } catch (err: any) {
        console.error('[GOOGLE AUTH ERROR]:', err);
        setError(err.message || 'Failed to complete Google authentication');
        toast({ message: err.message || 'Authentication failed', type: 'error' });
        setTimeout(() => navigate('/login', { replace: true }), 3000);
      }
    };

    processCallback();
  }, [location, loginWithGoogleCode, navigate, toast]);

  return (
    <div style={{ padding: '80px 0', maxWidth: '460px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ marginBottom: '20px' }}>
        <Logo size="large" />
      </div>
      <Badge variant="gold">Authenticating Session</Badge>

      {error ? (
        <div style={{ marginTop: '24px', padding: '20px', backgroundColor: 'rgba(229, 62, 62, 0.1)', border: '1px solid #E53E3E', borderRadius: 'var(--radius-lg)' }}>
          <h2 className="font-display" style={{ fontSize: '20px', color: '#E53E3E', margin: '0 0 8px 0' }}>
            Authentication Failed
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', margin: 0 }}>{error}</p>
          <p style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '12px' }}>Redirecting you back to login page...</p>
        </div>
      ) : (
        <div style={{ marginTop: '24px', padding: '32px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
          <h2 className="font-display" style={{ fontSize: '22px', margin: '0 0 12px 0', color: 'var(--ink)' }}>
            Signing you in via Google...
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', margin: '0 0 24px 0' }}>
            Exchanging secure OAuth 2.0 authorization code with Google server...
          </p>
          <Skeleton height="12px" style={{ marginBottom: '10px' }} />
          <Skeleton height="12px" style={{ width: '70%', margin: '0 auto' }} />
        </div>
      )}
    </div>
  );
};
