import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

export interface TurnstileRef {
  reset: () => void;
}

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  theme?: 'light' | 'dark' | 'auto';
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

// Official Cloudflare Turnstile Site Key for Alpha Cut
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAAEcL2_e7K7MECywi';

export const TurnstileWidget = forwardRef<TurnstileRef, TurnstileWidgetProps>(({
  onVerify,
  onExpire,
  onError,
  theme = 'dark',
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  // Keep latest callbacks in refs so useEffect never re-runs on inline prop functions
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onVerifyRef.current = onVerify;
    onExpireRef.current = onExpire;
    onErrorRef.current = onError;
  }, [onVerify, onExpire, onError]);

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (window.turnstile && widgetIdRef.current) {
        try {
          window.turnstile.reset(widgetIdRef.current);
        } catch (e) {
          console.warn('[TURNSTILE] Reset error:', e);
        }
      }
    },
  }));

  useEffect(() => {
    let checkInterval: any = null;

    const renderWidget = () => {
      if (window.turnstile && containerRef.current && !widgetIdRef.current) {
        try {
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: SITE_KEY,
            callback: (token: string) => onVerifyRef.current?.(token),
            'expired-callback': () => onExpireRef.current?.(),
            'error-callback': () => onErrorRef.current?.(),
            theme: theme === 'auto' ? 'dark' : theme,
          });
        } catch (e) {
          console.warn('[TURNSTILE] Failed to render widget:', e);
        }
      }
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      checkInterval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(checkInterval);
          renderWidget();
        }
      }, 200);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (window.turnstile && widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        } catch (e) {}
      }
    };
  }, [theme]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '14px 0 6px 0', minHeight: '65px' }}>
      <div ref={containerRef} />
    </div>
  );
});

TurnstileWidget.displayName = 'TurnstileWidget';
