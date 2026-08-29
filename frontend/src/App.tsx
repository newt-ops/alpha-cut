import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trackPageView } from './utils/analytics';
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
const PrivacyPolicyPage = lazy(() => import('@pages/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage })));
const TermsOfServicePage = lazy(() => import('@pages/TermsOfServicePage').then((m) => ({ default: m.TermsOfServicePage })));
const RefundPolicyPage = lazy(() => import('@pages/RefundPolicyPage').then((m) => ({ default: m.RefundPolicyPage })));
const LoginPage = lazy(() => import('@pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('@pages/SignupPage').then((m) => ({ default: m.SignupPage })));
const VerifyEmailPage = lazy(() => import('@pages/VerifyEmailPage').then((m) => ({ default: m.VerifyEmailPage })));
const ForgotPasswordPage = lazy(() => import('@pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('@pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })));
const GoogleCallbackPage = lazy(() => import('@pages/GoogleCallbackPage').then((m) => ({ default: m.GoogleCallbackPage })));
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

const getHostnameType = () => {
  if (typeof window === 'undefined') return 'main';
  const host = window.location.hostname.toLowerCase();
  if (host === 'admin.alpha-cut.com' || host.startsWith('admin.')) return 'admin';
  if (host === 'dashboard.alpha-cut.com' || host.startsWith('dashboard.')) return 'dashboard';
  if (host === 'app.alpha-cut.com' || host.startsWith('app.')) return 'app';
  return 'main';
};

// Hostname-aware layout switcher supporting alpha-cut.com, admin.alpha-cut.com, dashboard.alpha-cut.com, app.alpha-cut.com
const AppRoutes: React.FC = () => {
  const location = useLocation();
  const hostType = getHostnameType();
  const isProductionCustomDomain =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'alpha-cut.com' ||
      window.location.hostname === 'www.alpha-cut.com' ||
      window.location.hostname.endsWith('.vercel.app'));

  // Dynamic robots noindex injection for private app subdomains
  React.useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    if (hostType === 'admin' || hostType === 'dashboard' || hostType === 'app') {
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'robots');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', 'noindex, nofollow');
    } else if (meta && hostType === 'main') {
      meta.setAttribute('content', 'index, follow');
    }
  }, [hostType]);

  // Production Legacy Path Redirects to Subdomains
  React.useEffect(() => {
    if (isProductionCustomDomain) {
      if (location.pathname.startsWith('/admin')) {
        window.location.href = `https://admin.alpha-cut.com${location.search}`;
      } else if (location.pathname.startsWith('/dashboard')) {
        window.location.href = `https://dashboard.alpha-cut.com${location.search}`;
      } else if (location.pathname.startsWith('/app')) {
        window.location.href = `https://app.alpha-cut.com${location.search}`;
      }
    }
  }, [location, isProductionCustomDomain]);

  // Google Analytics 4 SPA Route Tracking
  React.useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  // 1. ADMIN SUBDOMAIN (admin.alpha-cut.com) or Local /admin Fallback
  if (hostType === 'admin' || location.pathname.startsWith('/admin')) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route
              path="*"
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

  // 2. CLIENT DASHBOARD SUBDOMAIN (dashboard.alpha-cut.com) or Local /dashboard Fallback
  if (hostType === 'dashboard' || location.pathname.startsWith('/dashboard')) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route
              path="/telegram-link"
              element={
                <RequireAuth>
                  <TelegramLinkPage />
                </RequireAuth>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="*"
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

  // 3. TELEGRAM MINI APP SUBDOMAIN (app.alpha-cut.com) or Local /app Fallback
  if (hostType === 'app' || location.pathname.startsWith('/app')) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="*" element={<TelegramMiniAppPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    );
  }

  // 4. PUBLIC MARKETING SITE (alpha-cut.com)
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
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms-of-service" element={<TermsOfServicePage />} />
              <Route path="/refund-policy" element={<RefundPolicyPage />} />
              <Route path="/rate-project/:projectId" element={<RateProjectPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />

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
