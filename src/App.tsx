import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.tsx';
import ErrorBoundary from './components/common/ErrorBoundary.tsx';
import ProtectedRoute from './components/auth/ProtectedRoute.tsx';

// Layouts
import AppLayout from './components/layout/AppLayout.tsx';
import AuthLayout from './components/layout/AuthLayout.tsx';

// Pages
import LoginPage from './pages/Login.tsx';
import RegisterPage from './pages/Register.tsx';
import OTPLoginPage from './pages/OTPLogin.tsx';
import ForgotPasswordPage from './pages/ForgotPassword.tsx';
import KBAVerificationPage from './pages/KBAVerification.tsx';
import DashboardPage from './pages/Dashboard.tsx';
import CreditReportPage from './pages/CreditReport.tsx';
import SettingsPage from './pages/Settings.tsx';
import NotFoundPage from './pages/NotFound.tsx';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Auth routes – centered card layout, no app chrome */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/otp-login" element={<OTPLoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Route>

            {/* KBA verification – authenticated but KBA not yet required */}
            <Route element={<AppLayout />}>
              <Route
                path="/verify"
                element={
                  <ProtectedRoute requireKBA={false}>
                    <KBAVerificationPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Authenticated app routes – full layout with header */}
            <Route element={<AppLayout />}>
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/report"
                element={
                  <ProtectedRoute>
                    <CreditReportPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* 404 fallback */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
