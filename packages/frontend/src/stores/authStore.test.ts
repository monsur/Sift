import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';
import type { User, UserProfile, AuthTokens } from 'shared/types';

const mockUser: User = {
  id: 'user-123',
  email: 'test@example.com',
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

const mockProfile: UserProfile = {
  id: 'profile-1',
  user_id: 'user-123',
  email_verified: true,
  email_verified_at: '2024-01-01',
  settings: { theme: 'system', default_refine_enabled: true },
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

const mockTokens: AuthTokens = {
  access_token: 'at-123',
  refresh_token: 'rt-123',
  expires_in: 3600,
};

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
  });

  it('starts with unauthenticated state', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.tokens).toBeNull();
  });

  it('setAuth sets user, profile, tokens and isAuthenticated', () => {
    useAuthStore.getState().setAuth(mockUser, mockProfile, mockTokens);

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.email).toBe('test@example.com');
    expect(state.tokens?.access_token).toBe('at-123');
    expect(state.profile?.settings.theme).toBe('system');
  });

  it('clearAuth resets to initial state', () => {
    useAuthStore.getState().setAuth(mockUser, mockProfile, mockTokens);
    useAuthStore.getState().clearAuth();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.tokens).toBeNull();
  });

  it('setTokens updates only tokens', () => {
    useAuthStore.getState().setAuth(mockUser, mockProfile, mockTokens);
    const newTokens: AuthTokens = {
      access_token: 'new-at',
      refresh_token: 'new-rt',
      expires_in: 7200,
    };
    useAuthStore.getState().setTokens(newTokens);

    const state = useAuthStore.getState();
    expect(state.tokens?.access_token).toBe('new-at');
    expect(state.user?.email).toBe('test@example.com');
  });

  it('setLoading updates loading state', () => {
    useAuthStore.getState().setLoading(true);
    expect(useAuthStore.getState().isLoading).toBe(true);

    useAuthStore.getState().setLoading(false);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });
});
