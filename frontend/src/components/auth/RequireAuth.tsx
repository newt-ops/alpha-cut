import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { Skeleton } from '@components/ui/Skeleton';

export const RequireAuth: React.FC<{ children: ReactNode }> = ({ children }) => {
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

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!(user as any).emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  const isDashboardAccess =
    location.pathname.startsWith('/dashboard') ||
    (typeof window !== 'undefined' &&
      (window.location.hostname.startsWith('dashboard.') || window.location.hostname === 'dashboard.alpha-cut.com'));

  if (!user.telegramChatId && user.role !== 'admin' && isDashboardAccess) {
    return <Navigate to="/telegram-link" replace />;
  }

  return <>{children}</>;
};
