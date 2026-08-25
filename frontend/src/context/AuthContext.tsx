import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  unverifiedEmail: string | null;
  setUnverifiedEmail: (email: string | null) => void;
  apiFetch: (endpoint: string, options?: RequestInit) => Promise<any>;
  login: (email: string, password: string, turnstileToken?: string) => Promise<any>;
  signup: (name: string, email: string, password: string, turnstileToken?: string) => Promise<any>;
  loginWithGoogle: (credential: string) => Promise<any>;
  loginWithGoogleCode: (code: string, redirectUri: string) => Promise<any>;
  initiateGoogleRedirect: () => void;
  verifyEmail: (email: string, code: string) => Promise<any>;
  resendVerification: (email: string) => Promise<any>;
  updateProfile: (profileData: Partial<User>) => Promise<any>;
  logout: () => Promise<void>;
  generateTelegramCode: () => Promise<any>;
  generateTelegramToken: () => Promise<any>;
  unlinkTelegram: () => Promise<any>;
  checkAuthStatus: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  // Silent session refresh
  const refreshSession = useCallback(async (): Promise<string | null> => {
    try {
      const fullUrl = `${API_BASE}/api/auth/refresh`;
      const res = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
      });

      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        setAccessToken(data.accessToken);
        setUser(data.user);
        return data.accessToken;
      }
    } catch (err) {
      // Session refresh failed
    }
    return null;
  }, []);

  // Silent refresh on boot
  useEffect(() => {
    const bootRefresh = async () => {
      await refreshSession();
      setLoading(false);
    };
    bootRefresh();
  }, [refreshSession]);

  const apiFetch = useCallback(
    async (endpoint: string, options: RequestInit = {}): Promise<any> => {
      let token = accessToken;

      if (!token) {
        token = await refreshSession();
      }

      const fullUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...((options.headers as Record<string, string>) || {}),
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      let res = await fetch(fullUrl, {
        ...options,
        headers,
        credentials: 'include',
      });

      if (res.status === 401) {
        const newToken = await refreshSession();
        if (newToken) {
          headers['Authorization'] = `Bearer ${newToken}`;
          res = await fetch(fullUrl, {
            ...options,
            headers,
            credentials: 'include',
          });
        }
      }

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      if (!res.ok) {
        console.error(`[API ERROR] ${options.method || 'GET'} ${endpoint} [Status ${res.status}]:`, data);
        throw new Error(data.message || 'API request failed');
      }
      return data;
    },
    [accessToken, refreshSession]
  );

  const login = async (email: string, password: string, turnstileToken?: string) => {
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, turnstileToken }),
      });
      setAccessToken(data.accessToken);
      setUser(data.user);
      setUnverifiedEmail(null);
      return data;
    } catch (err: any) {
      if (err.message && err.message.includes('verify your email')) {
        setUnverifiedEmail(email);
      }
      throw err;
    }
  };

  const signup = async (name: string, email: string, password: string, turnstileToken?: string) => {
    const data = await apiFetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, turnstileToken }),
    });
    setUnverifiedEmail(email);
    return data;
  };

  const loginWithGoogle = async (credential: string) => {
    const data = await apiFetch('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
    setAccessToken(data.accessToken);
    setUser(data.user);
    setUnverifiedEmail(null);
    return data;
  };

  const initiateGoogleRedirect = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '592216295265-6n5uqjepnlvn45nbto2o4chvf3q1cen9.apps.googleusercontent.com';
    const stateToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('oauth_state', stateToken);
        localStorage.setItem('oauth_state', stateToken);
        document.cookie = `alpha_cut_oauth_state=${stateToken}; path=/; max-age=600; SameSite=Lax`;
      } catch (e) {}
      const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI || `${window.location.origin}/auth/google/callback`;
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent('openid email profile')}&state=${encodeURIComponent(stateToken)}&prompt=select_account`;
      window.location.href = googleAuthUrl;
    }
  };

  const loginWithGoogleCode = async (code: string, redirectUri: string) => {
    const data = await apiFetch('/api/auth/google/callback', {
      method: 'POST',
      body: JSON.stringify({ code, redirectUri }),
    });
    setAccessToken(data.accessToken);
    setUser(data.user);
    setUnverifiedEmail(null);
    return data;
  };

  const verifyEmail = async (email: string, code: string) => {
    const data = await apiFetch('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
    if (data.accessToken) {
      setAccessToken(data.accessToken);
      setUser(data.user);
      setUnverifiedEmail(null);
    }
    return data;
  };

  const resendVerification = async (email: string) => {
    return await apiFetch('/api/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  };

  const updateProfile = async (profileData: Partial<User>) => {
    const data = await apiFetch('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    if (data.user) {
      setUser(data.user);
    }
    return data;
  };

  const logout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      // Ignore errors on logout
    }
    setUser(null);
    setAccessToken(null);
    setUnverifiedEmail(null);
  };

  const generateTelegramCode = useCallback(async () => {
    return await apiFetch('/api/telegram/link/code', { method: 'POST' });
  }, [apiFetch]);

  const generateTelegramToken = useCallback(async () => {
    return await apiFetch('/api/telegram/link/token', { method: 'POST' });
  }, [apiFetch]);

  const unlinkTelegram = useCallback(async () => {
    const data = await apiFetch('/api/telegram/unlink', { method: 'POST' });
    if (data.user) {
      setUser(data.user);
    }
    return data;
  }, [apiFetch]);

  const checkAuthStatus = useCallback(async () => {
    try {
      const data = await apiFetch('/api/auth/me');
      setUser(data.user);
      return data.user;
    } catch (err) {
      return null;
    }
  }, [apiFetch]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        isAuthenticated: !!user,
        unverifiedEmail,
        setUnverifiedEmail,
        apiFetch,
        login,
        signup,
        loginWithGoogle,
        loginWithGoogleCode,
        initiateGoogleRedirect,
        verifyEmail,
        resendVerification,
        updateProfile,
        logout,
        generateTelegramCode,
        generateTelegramToken,
        unlinkTelegram,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
