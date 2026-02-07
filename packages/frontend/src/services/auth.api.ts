import type {
  AuthResponse,
  AuthTokens,
  ApiResponse,
} from 'shared/types';
import { api } from './api';

export const authApi = {
  signup(email: string, password: string) {
    return api.post<ApiResponse<AuthResponse>>('/auth/signup', {
      email,
      password,
    });
  },

  login(email: string, password: string) {
    return api.post<ApiResponse<AuthResponse>>('/auth/login', {
      email,
      password,
    });
  },

  logout() {
    return api.post<ApiResponse<undefined>>('/auth/logout');
  },

  refresh(refreshToken: string) {
    return api.post<ApiResponse<AuthTokens>>('/auth/refresh', {
      refresh_token: refreshToken,
    });
  },

  verifyEmail(token: string) {
    return api.post<ApiResponse<undefined>>('/auth/verify-email', { token });
  },

  resendVerification(email: string) {
    return api.post<ApiResponse<undefined>>('/auth/resend-verification', {
      email,
    });
  },

  forgotPassword(email: string) {
    return api.post<ApiResponse<undefined>>('/auth/forgot-password', {
      email,
    });
  },

  resetPassword(token: string, password: string) {
    return api.post<ApiResponse<undefined>>('/auth/reset-password', {
      token,
      password,
    });
  },

  changePassword(currentPassword: string, newPassword: string) {
    return api.post<ApiResponse<undefined>>('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },
};
