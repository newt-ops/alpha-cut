import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@components/ui/Button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

const checkIsTelegram = (): boolean => {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname;
  const query = window.location.search;
  if (path.startsWith('/telegram') || query.includes('tgWebApp') || query.includes('dev=true')) return true;

  const tg = (window as any).Telegram?.WebApp;
  return Boolean(
    tg &&
      (tg.initData ||
        tg.initDataUnsafe?.user ||
        (window as any).TelegramWebviewProxy ||
        (tg.platform && tg.platform !== 'unknown'))
  );
};

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Page Navigation Error Boundary caught an error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const isTelegram = checkIsTelegram();

      if (isTelegram) {
        return (
          <div
            style={{
              minHeight: '100vh',
              backgroundColor: 'var(--tg-theme-bg-color, #17212b)',
              color: 'var(--tg-theme-text-color, #ffffff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px 16px',
              boxSizing: 'border-box',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif',
            }}
          >
            <div
              style={{
                backgroundColor: 'var(--tg-theme-secondary-bg-color, #232e3c)',
                borderRadius: '16px',
                padding: '28px 20px',
                textAlign: 'center',
                maxWidth: '400px',
                width: '100%',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(100, 181, 239, 0.15)',
                  color: 'var(--tg-theme-link-color, #64b5ef)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                  fontSize: '24px',
                }}
              >
                🔄
              </div>

              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--tg-theme-text-color, #ffffff)' }}>
                Sync Required
              </h2>

              <p style={{ fontSize: '13px', color: 'var(--tg-theme-hint-color, #708499)', margin: '0 0 20px 0', lineHeight: 1.5 }}>
                A temporary connection sync occurred. Tap below to reload your Telegram workspace.
              </p>

              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: 'var(--tg-theme-button-color, #5288c1)',
                  color: 'var(--tg-theme-button-text-color, #ffffff)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Reload Telegram Workspace
              </button>

              {this.state.error?.message && (
                <div
                  style={{
                    marginTop: '16px',
                    padding: '8px 10px',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    color: 'var(--tg-theme-hint-color, #708499)',
                    wordBreak: 'break-all',
                    textAlign: 'left',
                  }}
                >
                  Error: {this.state.error.message}
                </div>
              )}
            </div>
          </div>
        );
      }

      return (
        <div style={{ padding: '80px 24px', textAlign: 'center', maxWidth: '520px', margin: '0 auto' }}>
          <h2 className="font-display" style={{ fontSize: '28px', marginBottom: '12px' }}>
            Page Navigation Interrupted
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--ink-soft)', marginBottom: '24px', lineHeight: 1.6 }}>
            A network update occurred while switching pages. Please reload to load the latest version.
          </p>
          <Button variant="primary" onClick={this.handleReload}>
            Reload Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
