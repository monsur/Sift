import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from './useAuth';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@services/auth.api', () => ({
  authApi: {
    signup: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    verifyEmail: vi.fn(),
    resendVerification: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
  },
}));

import { authApi } from '@services/auth.api';
import { useAuthStore } from '@stores/authStore';

const mockAuthApi = vi.mocked(authApi);

const mockAuthResponse = {
  data: {
    success: true,
    data: {
      user: {
        id: 'user-123',
        email: 'test@example.com',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
      profile: {
        id: 'profile-1',
        user_id: 'user-123',
        email_verified: false,
        email_verified_at: null,
        settings: { theme: 'system' as const, default_refine_enabled: true },
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
      tokens: {
        access_token: 'at-123',
        refresh_token: 'rt-123',
        expires_in: 3600,
      },
    },
  },
};

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearAuth();
  });

  it('signup calls API and navigates to email-sent', async () => {
    mockAuthApi.signup.mockResolvedValue(mockAuthResponse as never);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signup('test@example.com', 'SecurePass123!');
    });

    expect(mockAuthApi.signup).toHaveBeenCalledWith(
      'test@example.com',
      'SecurePass123!'
    );
    expect(mockNavigate).toHaveBeenCalledWith('/email-sent');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('login calls API and navigates to dashboard', async () => {
    mockAuthApi.login.mockResolvedValue(mockAuthResponse as never);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('logout clears auth and navigates to login', async () => {
    mockAuthApi.logout.mockResolvedValue({ data: { success: true } } as never);

    // Set up authenticated state first
    useAuthStore.getState().setAuth(
      mockAuthResponse.data.data!.user,
      mockAuthResponse.data.data!.profile,
      mockAuthResponse.data.data!.tokens
    );

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.logout();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/login');
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('signup throws error message on failure', async () => {
    mockAuthApi.signup.mockRejectedValue({
      response: {
        data: {
          success: false,
          error: { code: 'EMAIL_EXISTS', message: 'Email already registered' },
        },
      },
    });

    const { result } = renderHook(() => useAuth());

    await expect(
      act(async () => {
        await result.current.signup('test@example.com', 'SecurePass123!');
      })
    ).rejects.toThrow('Email already registered');
  });
});
