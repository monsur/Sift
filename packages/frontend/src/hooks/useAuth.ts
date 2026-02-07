import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@stores/authStore';
import { authApi } from '@services/auth.api';
import type { AxiosError } from 'axios';
import type { ApiError } from 'shared/types';

interface ApiErrorResponse {
  success: false;
  error: ApiError;
}

function extractError(err: unknown): string {
  const axiosErr = err as AxiosError<ApiErrorResponse>;
  return (
    axiosErr.response?.data?.error?.message ?? 'An unexpected error occurred'
  );
}

function extractErrorCode(err: unknown): string | undefined {
  const axiosErr = err as AxiosError<ApiErrorResponse>;
  return axiosErr.response?.data?.error?.code;
}

export function useAuth() {
  const navigate = useNavigate();
  const { setAuth, clearAuth, setLoading, isAuthenticated, user, profile, tokens, isLoading } =
    useAuthStore();

  const signup = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        const { data } = await authApi.signup(email, password);
        if (data.data) {
          setAuth(data.data.user, data.data.profile, data.data.tokens);
        }
        navigate('/email-sent');
      } catch (err) {
        setLoading(false);
        throw new Error(extractError(err));
      }
    },
    [navigate, setAuth, setLoading]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        const { data } = await authApi.login(email, password);
        if (data.data) {
          setAuth(data.data.user, data.data.profile, data.data.tokens);
        }
        navigate('/dashboard');
      } catch (err) {
        setLoading(false);
        const code = extractErrorCode(err);
        const message = extractError(err);
        const error = new Error(message);
        (error as Error & { code?: string }).code = code;
        throw error;
      }
    },
    [navigate, setAuth, setLoading]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Continue with local cleanup even if API call fails
    }
    clearAuth();
    navigate('/login');
  }, [clearAuth, navigate]);

  const verifyEmail = useCallback(
    async (token: string) => {
      await authApi.verifyEmail(token);
    },
    []
  );

  const resendVerification = useCallback(async (email: string) => {
    await authApi.resendVerification(email);
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    await authApi.forgotPassword(email);
  }, []);

  const resetPassword = useCallback(
    async (token: string, password: string) => {
      await authApi.resetPassword(token, password);
      navigate('/login');
    },
    [navigate]
  );

  return {
    // State
    isAuthenticated,
    isLoading,
    user,
    profile,
    tokens,
    // Actions
    signup,
    login,
    logout,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
  };
}
