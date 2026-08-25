import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@context/ThemeContext';
import { ToastProvider } from '@components/ui/Toast';
import { AuthProvider } from '@context/AuthContext';
import { Navbar } from '@components/layout/Navbar';
import { Footer } from '@components/layout/Footer';
import { PageWrapper } from '@components/layout/PageWrapper';
import { ErrorBoundary } from '@components/layout/ErrorBoundary';
import { RequireAuth } from '@components/auth/RequireAuth';
import { RequireAdmin } from '@components/auth/RequireAdmin';
import { Skeleton } from '@components/ui/Skeleton';

// Lazy-loaded route components
const HomePage = lazy(() => import('@pages/HomePage').then((m) => ({ default: m.HomePage })));
const EditingStylesPage = lazy(() => import('@pages/EditingStylesPage').then((m) => ({ default: m.EditingStylesPage })));
const PortfolioPage = lazy(() => import('@pages/PortfolioPage').then((m) => ({ default: m.PortfolioPage })));
const PackagesPage = lazy(() => import('@pages/PackagesPage').then((m) => ({ default: m.PackagesPage })));
const AboutPage = lazy(() => import('@pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const RatingsPage = lazy(() => import('@pages/RatingsPage').then((m) => ({ default: m.RatingsPage })));
const LoginPage = lazy(() => import('@pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('@pages/SignupPage').then((m) => ({ default: m.SignupPage })));
const VerifyEmailPage = lazy(() => import('@pages/VerifyEmailPage').then((m) => ({ default: m.VerifyEmailPage })));
const ForgotPasswordPage = lazy(() => import('@pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('@pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })));
const TelegramLinkPage = lazy(() => import('@pages/TelegramLinkPage').then((m) => ({ default: m.TelegramLinkPage })));
const DashboardPage = lazy(() => import('@pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const AdminPage = lazy(() => import('@pages/AdminPage').then((m) => ({ default: m.AdminPage })));
const RateProjectPage = lazy(() => import('@pages/RateProjectPage').then((m) => ({ default: m.RateProjectPage })));
const TelegramMiniAppPage = lazy(() => import('@pages/TelegramMiniAppPage').then((m) => ({ default: m.TelegramMiniAppPage })));
const DevComponentsPage = lazy(() => import('@pages/DevComponentsPage').then((m) => ({ default: m.DevComponentsPage })));
const NotFoundPage = lazy(() => import('@pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

const RouteFallback: React.FC = () => (
  <div style={{ padding: '60px 0', maxWidth: '800px', margin: '0 auto' }}>
    <Skeleton height="40px" style={{ marginBottom: '20px' }} />
    <Skeleton height="180px" />
  </div>
);

// Inner layout switcher that removes Navbar/Footer for full-screen /admin and /app routes
const AppRoutes: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isMiniAppRoute = location.pathname.startsWith('/app');
  const isDashboardRoute = location.pathname.startsWith('/dashboard');

  if (isAdminRoute) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminPage />
                </RequireAdmin>
              }
            />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (isDashboardRoute) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <DashboardPage />
                </RequireAuth>
              }
            />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (isMiniAppRoute) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/app" element={<TelegramMiniAppPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <>
      <Navbar />
      <PageWrapper>
        <ErrorBoundary>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/editing-styles" element={<EditingStylesPage />} />
              <Route path="/portfolio" element={<PortfolioPage />} />
              <Route path="/packages" element={<PackagesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/ratings" element={<RatingsPage />} />
              <Route path="/rate-project/:projectId" element={<RateProjectPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Onboarding Protected Route */}
              <Route
                path="/telegram-link"
                element={
                  <RequireAuth>
                    <TelegramLinkPage />
                  </RequireAuth>
                }
              />

              {/* QA Sandbox (Dev Mode Only) */}
              {import.meta.env.DEV && (
                <Route path="/dev/components" element={<DevComponentsPage />} />
              )}

              {/* Custom 404 Catch-All Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </PageWrapper>
      <Footer />
    </>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes default stale time
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <Router>
              <AppRoutes />
            </Router>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
