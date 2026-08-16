import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);

  // Silent session refresh
  const refreshSession = useCallback(async () => {
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
    async (endpoint, options = {}) => {
      let token = accessToken;

      // If no access token in state, try silent refresh first
      if (!token) {
        token = await refreshSession();
      }

      const fullUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

      const headers = {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(options.headers || {}),
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      let res = await fetch(fullUrl, {
        ...options,
        headers,
        credentials: 'include',
      });

      // If 401 Unauthorized, attempt 1 silent token refresh and retry
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
        throw new Error(data.message || 'API request failed');
      }
      return data;
    },
    [accessToken, refreshSession]
  );

  const login = async (email, password) => {
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setAccessToken(data.accessToken);
      setUser(data.user);
      setUnverifiedEmail(null);
      return data;
    } catch (err) {
      if (err.message.includes('verify your email')) {
        setUnverifiedEmail(email);
      }
      throw err;
    }
  };

  const signup = async (name, email, password) => {
    const data = await apiFetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    setUnverifiedEmail(email);
    return data;
  };

  const loginWithGoogle = async (credential) => {
    const data = await apiFetch('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
    setAccessToken(data.accessToken);
    setUser(data.user);
    setUnverifiedEmail(null);
    return data;
  };

  const verifyEmail = async (email, code) => {
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

  const resendVerification = async (email) => {
    return await apiFetch('/api/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
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

  const generateTelegramCode = async () => {
    return await apiFetch('/api/telegram/link/code', { method: 'POST' });
  };

  const generateTelegramToken = async () => {
    return await apiFetch('/api/telegram/link/token', { method: 'POST' });
  };

  const checkAuthStatus = async () => {
    try {
      const data = await apiFetch('/api/auth/me');
      setUser(data.user);
      return data.user;
    } catch (err) {
      return null;
    }
  };

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
        verifyEmail,
        resendVerification,
        logout,
        generateTelegramCode,
        generateTelegramToken,
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
