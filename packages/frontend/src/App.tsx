import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute } from '@components/common/ProtectedRoute';
import { Layout } from '@components/layout/Layout';
import LoginPage from '@pages/LoginPage';
import SignupPage from '@pages/SignupPage';
import EmailSentPage from '@pages/EmailSentPage';
import VerifyEmailPage from '@pages/VerifyEmailPage';
import ForgotPasswordPage from '@pages/ForgotPasswordPage';
import ResetPasswordPage from '@pages/ResetPasswordPage';
import DashboardPlaceholder from '@pages/DashboardPlaceholder';
import NewEntryPage from '@pages/NewEntryPage';
import EntrySavedPage from '@pages/EntrySavedPage';
import HistoryPage from '@pages/HistoryPage';
import EntryDetailPage from '@pages/EntryDetailPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/email-sent" element={<EmailSentPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<DashboardPlaceholder />} />
              <Route path="/new-entry" element={<NewEntryPage />} />
              <Route path="/entry-saved/:id" element={<EntrySavedPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/entries/:id" element={<EntryDetailPage />} />
            </Route>
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
