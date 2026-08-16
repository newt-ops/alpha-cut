import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { useAuth } from '@context/AuthContext';
import { useToast } from '@components/ui/Toast';
import { IconSparkles } from '@icons/icons';

export const SignupPage = () => {
  const { loginWithGoogle } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleClick = () => {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '592216295265-6n5uqjepnlvn45nbto2o4chvf3q1cen9.apps.googleusercontent.com',
        callback: async (response) => {
          try {
            setIsLoading(true);
            await loginWithGoogle(response.credential);
            toast({ message: 'Welcome to Alpha Cut!', type: 'success' });
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

  return (
    <div style={{ padding: '60px 0', maxWidth: '440px', margin: '0 auto' }} className="signup-page">
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Badge variant="gold">Client Registration</Badge>
        <h1 className="font-display" style={{ fontSize: '32px', marginTop: '12px' }}>
          Create Your Account
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--ink-soft)', marginTop: '8px', lineHeight: 1.6 }}>
          Register instantly with Google to receive proposals, manage deliverables, and link Telegram notifications.
        </p>
      </div>

      <div
        style={{
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--line)',
          padding: '40px 28px',
          boxShadow: 'var(--shadow)',
          textAlign: 'center',
        }}
      >
        <div style={{ marginBottom: '24px' }}>
          <Button
            variant="primary"
            fullWidth
            size="large"
            iconRight={IconSparkles}
            isLoading={isLoading}
            onClick={handleGoogleClick}
          >
            Continue with Google
          </Button>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--ink-soft)', lineHeight: 1.5 }}>
          Instant, secure 1-click registration via Google OAuth.
        </p>
      </div>
    </div>
  );
};
