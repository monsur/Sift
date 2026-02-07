import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuthStore } from '@stores/authStore';

function renderWithRouter(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/email-sent" element={<div>Email Sent</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
  });

  it('redirects to login when not authenticated', () => {
    renderWithRouter('/dashboard');
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('redirects to email-sent when email not verified', () => {
    useAuthStore.getState().setAuth(
      { id: 'u1', email: 'test@example.com', created_at: '', updated_at: '' },
      {
        id: 'p1',
        user_id: 'u1',
        email_verified: false,
        email_verified_at: null,
        settings: { theme: 'system', default_refine_enabled: true },
        created_at: '',
        updated_at: '',
      },
      { access_token: 'at', refresh_token: 'rt', expires_in: 3600 }
    );

    renderWithRouter('/dashboard');
    expect(screen.getByText('Email Sent')).toBeInTheDocument();
  });

  it('renders outlet when authenticated and verified', () => {
    useAuthStore.getState().setAuth(
      { id: 'u1', email: 'test@example.com', created_at: '', updated_at: '' },
      {
        id: 'p1',
        user_id: 'u1',
        email_verified: true,
        email_verified_at: '2024-01-01',
        settings: { theme: 'system', default_refine_enabled: true },
        created_at: '',
        updated_at: '',
      },
      { access_token: 'at', refresh_token: 'rt', expires_in: 3600 }
    );

    renderWithRouter('/dashboard');
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
