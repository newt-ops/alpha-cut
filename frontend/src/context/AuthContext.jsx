import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);

  const apiFetch = useCallback(
    async (endpoint, options = {}) => {
      const headers = {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(options.headers || {}),
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const res = await fetch(endpoint, {
        ...options,
        headers,
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'API request failed');
      }
      return data;
    },
    [accessToken]
  );

  // Silent session refresh on boot
  useEffect(() => {
    const silentRefresh = async () => {
      try {
        const res = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setAccessToken(data.accessToken);
          setUser(data.user);
        }
      } catch (err) {
        // No active session
      } finally {
        setLoading(false);
      }
    };

    silentRefresh();
  }, []);

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
    if (!accessToken) return null;
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
