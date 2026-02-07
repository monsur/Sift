import axios from 'axios';
import type { AuthTokens } from 'shared/types';

const STORAGE_KEY = 'sift-auth';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach access token from localStorage
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const state = JSON.parse(raw) as { state?: { tokens?: AuthTokens } };
      const token = state?.state?.tokens?.access_token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch {
    // Ignore parse errors
  }
  return config;
});

// Response interceptor: auto-refresh on 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null): void {
  for (const { resolve, reject } of failedQueue) {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  }
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || !error.config) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as typeof error.config & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't retry refresh or login requests
    if (
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/login')
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) throw new Error('No auth state');

      const state = JSON.parse(raw) as { state?: { tokens?: AuthTokens } };
      const refreshToken = state?.state?.tokens?.refresh_token;
      if (!refreshToken) throw new Error('No refresh token');

      const { data } = await api.post<{ success: boolean; data: AuthTokens }>(
        '/auth/refresh',
        { refresh_token: refreshToken }
      );

      const newTokens = data.data;

      // Update localStorage
      if (raw) {
        const parsed = JSON.parse(raw) as { state?: { tokens?: AuthTokens } };
        if (parsed.state) {
          parsed.state.tokens = newTokens;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        }
      }

      processQueue(null, newTokens.access_token);
      originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      // Clear auth state on refresh failure
      localStorage.removeItem(STORAGE_KEY);
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export { api };
