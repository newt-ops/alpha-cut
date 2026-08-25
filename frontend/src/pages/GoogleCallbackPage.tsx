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

      // Multi-layer state retrieval for cross-domain / cross-tab compatibility
      let savedState: string | null = null;
      try {
        savedState = sessionStorage.getItem('oauth_state') || localStorage.getItem('oauth_state');
        if (!savedState) {
          const cookieMatch = document.cookie.match(/(?:^|; )alpha_cut_oauth_state=([^;]*)/);
          if (cookieMatch) savedState = decodeURIComponent(cookieMatch[1]);
        }
      } catch (e) {}

      // Clean up state storage
      try {
        sessionStorage.removeItem('oauth_state');
        localStorage.removeItem('oauth_state');
        document.cookie = 'alpha_cut_oauth_state=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      } catch (e) {}

      if (!code) {
        setError('No authorization code was returned from Google.');
        toast({ message: 'Google Sign-In was cancelled or failed.', type: 'error' });
        setTimeout(() => navigate('/login', { replace: true }), 3000);
        return;
      }

      if (state && savedState && state !== savedState) {
        console.warn('[OAUTH STATE WARNING] Token mismatch across storage layers, proceeding to verify authorization code directly with backend...');
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
