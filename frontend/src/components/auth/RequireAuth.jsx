import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { Skeleton } from '@components/ui/Skeleton';

export const RequireAuth = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ padding: '60px 0', maxWidth: '600px', margin: '0 auto' }}>
        <Skeleton height="40px" style={{ marginBottom: '20px' }} />
        <Skeleton height="120px" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  if (!user.telegramChatId && location.pathname === '/dashboard') {
    return <Navigate to="/telegram-link" replace />;
  }

  return children;
};
