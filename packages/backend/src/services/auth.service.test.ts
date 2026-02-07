import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './auth.service.js';
import { UnauthorizedError, AppError, AccountLockedError } from '../utils/errors.js';
import { clearAllRateLimits } from '../middleware/rate-limiter.js';

// Mock supabase module
vi.mock('../config/supabase.js', () => ({
  createAnonClient: vi.fn(),
  getServiceClient: vi.fn(),
}));

import { createAnonClient, getServiceClient } from '../config/supabase.js';

const mockCreateAnonClient = vi.mocked(createAnonClient);
const mockGetServiceClient = vi.mocked(getServiceClient);

function makeMockSupabase() {
  return {
    auth: {
      admin: {
        createUser: vi.fn(),
        deleteUser: vi.fn(),
      },
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      refreshSession: vi.fn(),
      verifyOtp: vi.fn(),
      resend: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      getUser: vi.fn(),
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  };
}

type MockSupabase = ReturnType<typeof makeMockSupabase>;

describe('AuthService', () => {
  let service: AuthService;
  let mockServiceClient: MockSupabase;
  let mockAnonClient: MockSupabase;

  beforeEach(() => {
    vi.clearAllMocks();
    clearAllRateLimits();
    service = new AuthService();

    mockServiceClient = makeMockSupabase();
    mockAnonClient = makeMockSupabase();

    mockGetServiceClient.mockReturnValue(
      mockServiceClient as unknown as ReturnType<typeof getServiceClient>
    );
    mockCreateAnonClient.mockReturnValue(
      mockAnonClient as unknown as ReturnType<typeof createAnonClient>
    );
  });

  describe('signup', () => {
    it('creates user and returns auth response (profile auto-created by trigger)', async () => {
      mockServiceClient.auth.admin.createUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
        },
        error: null,
      });

      // Mock getProfile (profile auto-created by database trigger)
      mockServiceClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'profile-1',
                user_id: 'user-123',
                email_verified: false,
                email_verified_at: null,
                settings: { theme: 'system', default_refine_enabled: true },
                created_at: '2024-01-01',
                updated_at: '2024-01-01',
              },
              error: null,
            }),
          }),
        }),
      } as unknown as ReturnType<MockSupabase['from']>);

      mockServiceClient.auth.signInWithPassword.mockResolvedValue({
        data: {
          session: {
            access_token: 'at-123',
            refresh_token: 'rt-123',
            expires_in: 3600,
          },
          user: { id: 'user-123' },
        },
        error: null,
      });

      mockAnonClient.auth.resend.mockResolvedValue({ error: null });

      const result = await service.signup('test@example.com', 'SecurePass123!');

      expect(result.user.id).toBe('user-123');
      expect(result.tokens.access_token).toBe('at-123');
      expect(mockServiceClient.auth.admin.createUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'SecurePass123!',
        email_confirm: false,
      });
    });

    it('throws on duplicate email', async () => {
      mockServiceClient.auth.admin.createUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'User already registered' },
      });

      await expect(
        service.signup('test@example.com', 'SecurePass123!')
      ).rejects.toThrow(AppError);
    });
  });

  describe('login', () => {
    it('returns auth response on valid credentials', async () => {
      // Sign in succeeds
      mockServiceClient.auth.signInWithPassword.mockResolvedValue({
        data: {
          session: {
            access_token: 'at-123',
            refresh_token: 'rt-123',
            expires_in: 3600,
          },
          user: {
            id: 'user-123',
            email: 'test@example.com',
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
        },
        error: null,
      });

      // Profile lookup (lock check + getProfile)
      mockServiceClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'profile-1',
                user_id: 'user-123',
                locked_until: null,
                failed_login_attempts: 0,
                email_verified: false,
                email_verified_at: null,
                settings: { theme: 'system', default_refine_enabled: true },
                created_at: '2024-01-01',
                updated_at: '2024-01-01',
              },
              error: null,
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      } as unknown as ReturnType<MockSupabase['from']>);

      const result = await service.login('test@example.com', 'password');
      expect(result.user.email).toBe('test@example.com');
      expect(result.tokens.access_token).toBe('at-123');
    });

    it('throws UnauthorizedError on invalid credentials', async () => {
      mockServiceClient.auth.signInWithPassword.mockResolvedValue({
        data: { session: null, user: null },
        error: { message: 'Invalid login credentials' },
      });

      await expect(
        service.login('test@example.com', 'wrong')
      ).rejects.toThrow(UnauthorizedError);
    });

    it('throws AccountLockedError when account is locked', async () => {
      const futureDate = new Date(Date.now() + 30 * 60 * 1000).toISOString();

      // Sign in succeeds (Supabase doesn't know about app-level lock)
      mockServiceClient.auth.signInWithPassword.mockResolvedValue({
        data: {
          session: {
            access_token: 'at-123',
            refresh_token: 'rt-123',
            expires_in: 3600,
          },
          user: { id: 'user-123', email: 'test@example.com' },
        },
        error: null,
      });

      // Profile shows account is locked
      mockServiceClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                user_id: 'user-123',
                locked_until: futureDate,
                failed_login_attempts: 5,
              },
              error: null,
            }),
          }),
        }),
      } as unknown as ReturnType<MockSupabase['from']>);

      // signOut called to invalidate the session
      mockAnonClient.auth.signOut.mockResolvedValue({ error: null });

      await expect(
        service.login('test@example.com', 'password')
      ).rejects.toThrow(AccountLockedError);
    });
  });

  describe('logout', () => {
    it('calls supabase signOut', async () => {
      mockAnonClient.auth.signOut.mockResolvedValue({ error: null });
      await service.logout('access-token');
      expect(mockAnonClient.auth.signOut).toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('returns new tokens', async () => {
      mockAnonClient.auth.refreshSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'new-at',
            refresh_token: 'new-rt',
            expires_in: 3600,
          },
        },
        error: null,
      });

      const result = await service.refreshToken('old-rt');
      expect(result.access_token).toBe('new-at');
    });

    it('throws on invalid refresh token', async () => {
      mockAnonClient.auth.refreshSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Invalid refresh token' },
      });

      await expect(service.refreshToken('bad-rt')).rejects.toThrow(
        UnauthorizedError
      );
    });
  });

  describe('verifyEmail', () => {
    it('verifies email with valid token', async () => {
      mockAnonClient.auth.verifyOtp.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      await expect(service.verifyEmail('valid-token')).resolves.toBeUndefined();
    });

    it('throws on invalid token', async () => {
      mockAnonClient.auth.verifyOtp.mockResolvedValue({
        data: { user: null },
        error: { message: 'Token expired' },
      });

      await expect(service.verifyEmail('bad-token')).rejects.toThrow(AppError);
    });
  });

  describe('forgotPassword', () => {
    it('calls resetPasswordForEmail', async () => {
      mockAnonClient.auth.resetPasswordForEmail.mockResolvedValue({
        error: null,
      });

      await expect(
        service.forgotPassword('test@example.com')
      ).resolves.toBeUndefined();
    });
  });

  describe('resetPassword', () => {
    it('resets password with valid token', async () => {
      mockAnonClient.auth.verifyOtp.mockResolvedValue({
        data: {
          session: {
            access_token: 'temp-at',
            refresh_token: 'temp-rt',
            expires_in: 3600,
          },
        },
        error: null,
      });

      // The second createAnonClient call (with access token) returns a different mock
      const authedMock = makeMockSupabase();
      authedMock.auth.updateUser.mockResolvedValue({ error: null });
      mockCreateAnonClient.mockReturnValueOnce(
        mockAnonClient as unknown as ReturnType<typeof createAnonClient>
      ).mockReturnValueOnce(
        authedMock as unknown as ReturnType<typeof createAnonClient>
      );

      await expect(
        service.resetPassword('valid-token', 'NewSecure123!')
      ).resolves.toBeUndefined();
    });

    it('throws on invalid reset token', async () => {
      mockAnonClient.auth.verifyOtp.mockResolvedValue({
        data: { session: null },
        error: { message: 'Invalid token' },
      });

      await expect(
        service.resetPassword('bad-token', 'NewSecure123!')
      ).rejects.toThrow(AppError);
    });
  });

  describe('changePassword', () => {
    it('changes password', async () => {
      mockAnonClient.auth.updateUser.mockResolvedValue({ error: null });

      await expect(
        service.changePassword('at-123', 'old', 'NewSecure123!')
      ).resolves.toBeUndefined();
    });

    it('throws on failure', async () => {
      mockAnonClient.auth.updateUser.mockResolvedValue({
        error: { message: 'Failed' },
      });

      await expect(
        service.changePassword('at-123', 'old', 'NewSecure123!')
      ).rejects.toThrow(AppError);
    });
  });
});
