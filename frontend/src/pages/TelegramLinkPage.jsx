import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { useAuth } from '@context/AuthContext';
import { useToast } from '@components/ui/Toast';
import { IconCheck, IconZap, IconExternalLink } from '@icons/icons';

export const TelegramLinkPage = () => {
  const { user, generateTelegramCode, generateTelegramToken, checkAuthStatus } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const [deepLinkUrl, setDeepLinkUrl] = useState('');
  const [loading, setLoading] = useState(true);

  // Generate initial code & deep-link token
  useEffect(() => {
    const fetchLinkData = async () => {
      try {
        setLoading(true);
        const codeRes = await generateTelegramCode();
        const tokenRes = await generateTelegramToken();
        setCode(codeRes.code);
        setDeepLinkUrl(tokenRes.deepLinkUrl);
      } catch (err) {
        toast({ message: err.message || 'Failed to generate Telegram link token', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchLinkData();
  }, [generateTelegramCode, generateTelegramToken, toast]);

  // Status check poll
  useEffect(() => {
    const interval = setInterval(async () => {
      const updatedUser = await checkAuthStatus();
      if (updatedUser && updatedUser.telegramChatId) {
        toast({ message: 'Telegram account connected successfully!', type: 'success' });
        navigate('/dashboard');
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [checkAuthStatus, navigate, toast]);

  if (user && user.telegramChatId) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div style={{ padding: '40px 0', maxWidth: '520px', margin: '0 auto' }} className="telegram-link-page">
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Badge variant="gold">Onboarding Step 2 of 2</Badge>
        <h1 className="font-display" style={{ fontSize: '32px', marginTop: '12px' }}>
          Connect Telegram Account
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--ink-soft)', marginTop: '8px', lineHeight: 1.6 }}>
          Link your Telegram account to receive real-time notifications when proposal offers, editing deliverables, and status updates are sent.
        </p>
      </div>

      <div
        style={{
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--line)',
          padding: '36px 28px',
          boxShadow: 'var(--shadow)',
          textAlign: 'center',
        }}
      >
        {/* Path B: Deep Link Button */}
        <div style={{ marginBottom: '32px' }}>
          <h3 className="font-display" style={{ fontSize: '18px', marginBottom: '8px' }}>
            Option 1: Quick Connect (Recommended)
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginBottom: '16px' }}>
            Click below to open the bot in Telegram with an automatic single-use link token.
          </p>
          <a href={deepLinkUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="primary" fullWidth size="large" iconRight={IconExternalLink} isLoading={loading}>
              Connect via Telegram
            </Button>
          </a>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            margin: '28px 0',
            color: 'var(--ink-soft)',
            fontSize: '12px',
          }}
        >
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--line)' }} />
          <span>OR MANUAL CODE</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--line)' }} />
        </div>

        {/* Path A: Manual Code */}
        <div>
          <h3 className="font-display" style={{ fontSize: '18px', marginBottom: '8px' }}>
            Option 2: Enter Manual Code in Telegram
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginBottom: '16px' }}>
            Open <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>@alpha_cut_bot</span> in Telegram and send:
          </p>

          <div
            style={{
              backgroundColor: '#170B06',
              color: '#D9B27C',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-mono)',
              fontSize: '24px',
              fontWeight: 700,
              letterSpacing: '4px',
              marginBottom: '12px',
            }}
          >
            /link {code || '......'}
          </div>
          <span className="font-mono" style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>
            Code expires in 10 minutes
          </span>
        </div>

        <div
          style={{
            marginTop: '32px',
            paddingTop: '20px',
            borderTop: '1px solid var(--line)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '13px',
            color: 'var(--ink-soft)',
          }}
        >
          <IconZap size={16} color="var(--accent-gold)" />
          <span>Waiting for Telegram bot confirmation...</span>
        </div>
      </div>
    </div>
  );
};
