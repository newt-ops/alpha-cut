import { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { getInitData, getTelegramUser } from '../utils/telegramSdk';
import { API_BASE } from '../utils/api';

export interface TelegramAuthState {
  user: User | null;
  telegramUser: any;
  isAuthenticated: boolean;
  isUnlinked: boolean;
  isLoading: boolean;
  error: string | null;
  accessToken: string | null;
  linkAccount: (code: string) => Promise<boolean>;
  linkAccountWithCredentials: (email: string, password: string) => Promise<boolean>;
  unlinkAccount: () => Promise<boolean>;
  refetchAuth: () => Promise<void>;
  tgFetch: (endpoint: string, options?: RequestInit) => Promise<any>;
}

export const useTelegramAuth = (): TelegramAuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [telegramUser, setTelegramUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isUnlinked, setIsUnlinked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem('token'));

  const tgFetch = useCallback(
    async (endpoint: string, options: RequestInit = {}): Promise<any> => {
      const fullUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
      const token = accessToken || localStorage.getItem('token');
      const initData = getInitData();

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(initData ? { 'X-Telegram-Init-Data': initData } : {}),
        ...((options.headers as Record<string, string>) || {}),
      };

      const res = await fetch(fullUrl, {
        ...options,
        headers,
        credentials: 'include',
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Request failed');
      }
      return data;
    },
    [accessToken]
  );

  const authenticateWithTelegram = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const tgUser = getTelegramUser();
    setTelegramUser(tgUser);

    const initData = getInitData();

    try {
      if (initData) {
        // Fast path: Authenticate using Telegram WebApp initData + existing token fallback
        const token = localStorage.getItem('token');
        const fullUrl = `${API_BASE}/api/telegram/webapp/auth`;
        const res = await fetch(fullUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ initData }),
          credentials: 'include',
        });

        const data = await res.json();
        if (res.ok && data.success && data.accessToken && data.user) {
          localStorage.setItem('token', data.accessToken);
          setAccessToken(data.accessToken);
          setUser(data.user);
          setIsAuthenticated(true);
          setIsUnlinked(false);
          setIsLoading(false);
          return;
        }

        if (data.unlinked) {
          setIsUnlinked(true);
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }
      }

      // Fallback: Check standard session endpoint with existing JWT token
      const token = localStorage.getItem('token');
      if (token) {
        const meRes = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });
        const meData = await meRes.json();
        if (meRes.ok && meData.user) {
          setUser(meData.user);
          setIsAuthenticated(true);
          setIsUnlinked(false);
          setIsLoading(false);
          return;
        }
      }

      setIsUnlinked(true);
      setIsAuthenticated(false);
    } catch (err: any) {
      console.error('[TELEGRAM AUTH ERROR]:', err);
      setError(err.message || 'Failed to authenticate Telegram Web App');
      setIsUnlinked(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    authenticateWithTelegram();
  }, [authenticateWithTelegram]);

  const linkAccount = async (code: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const initData = getInitData();
      const fullUrl = `${API_BASE}/api/telegram/webapp/link-code`;
      const res = await fetch(fullUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, initData }),
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to link account');
      }

      if (data.accessToken && data.user) {
        localStorage.setItem('token', data.accessToken);
        setAccessToken(data.accessToken);
        setUser(data.user);
        setIsAuthenticated(true);
        setIsUnlinked(false);
      }
      return true;
    } catch (err: any) {
      setError(err.message || 'Linking failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const linkAccountWithCredentials = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const initData = getInitData();
      const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const loginData = await loginRes.json();
      if (!loginRes.ok || !loginData.success) {
        throw new Error(loginData.message || 'Invalid email or password');
      }

      const token = loginData.accessToken;
      if (token) {
        localStorage.setItem('token', token);
        setAccessToken(token);

        // Bind Telegram chatId to logged-in user profile
        const authRes = await fetch(`${API_BASE}/api/telegram/webapp/auth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ initData }),
          credentials: 'include',
        });
        const authData = await authRes.json();
        setUser(authData.user || loginData.user);
      } else {
        setUser(loginData.user);
      }

      setIsAuthenticated(true);
      setIsUnlinked(false);
      return true;
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const unlinkAccount = async (): Promise<boolean> => {
    try {
      await tgFetch('/api/telegram/unlink', { method: 'POST' });
      localStorage.removeItem('token');
      setAccessToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setIsUnlinked(true);
      return true;
    } catch (err: any) {
      throw err;
    }
  };

  return {
    user,
    telegramUser,
    isAuthenticated,
    isUnlinked,
    isLoading,
    error,
    accessToken,
    linkAccount,
    linkAccountWithCredentials,
    unlinkAccount,
    refetchAuth: authenticateWithTelegram,
    tgFetch,
  };
};
