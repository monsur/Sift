import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildApp } from '../app.js';
import type { FastifyInstance } from 'fastify';
import { clearAllRateLimits } from '../middleware/rate-limiter.js';

// Mock auth service
vi.mock('../services/auth.service.js', () => {
  const mockService = {
    signup: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn(),
    verifyEmail: vi.fn(),
    resendVerification: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    changePassword: vi.fn(),
  };
  return { authService: mockService };
});

// Mock auth middleware
vi.mock('../middleware/auth.middleware.js', () => ({
  authMiddleware: vi.fn().mockImplementation(async (request: { user: unknown }) => {
    request.user = {
      id: 'user-123',
      email: 'test@example.com',
      email_verified: true,
    };
  }),
  requireVerified: vi.fn(),
}));

// Mock entry service (needed by entry routes)
vi.mock('../services/entry.service.js', () => ({
  entryService: {
    create: vi.fn(), getById: vi.fn(), list: vi.fn(), update: vi.fn(),
    delete: vi.fn(), saveTranscript: vi.fn(), saveRefinement: vi.fn(),
  },
}));

// Mock services needed by conversation/summary routes
vi.mock('../services/context.service.js', () => ({
  getRecentEntries: vi.fn().mockResolvedValue([]),
}));
vi.mock('../services/conversation.service.js', () => ({
  startConversation: vi.fn(), continueConversation: vi.fn(),
}));
vi.mock('../services/summary.service.js', () => ({
  generateSummary: vi.fn(), estimateTotalCost: vi.fn(),
}));
vi.mock('../services/dashboard.service.js', () => ({
  dashboardService: { getStats: vi.fn(), getTimeline: vi.fn(), updateCachedStats: vi.fn() },
}));
vi.mock('../config/supabase.js', () => ({
  createAnonClient: vi.fn().mockReturnValue({ from: vi.fn() }),
  getServiceClient: vi.fn().mockReturnValue({ from: vi.fn() }),
}));

import { authService } from '../services/auth.service.js';

const mockAuthService = vi.mocked(authService);

describe('Auth Routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    clearAllRateLimits();
    app = await buildApp();
  });

  describe('POST /api/auth/signup', () => {
    it('returns 201 on successful signup', async () => {
      mockAuthService.signup.mockResolvedValue({
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
          settings: { theme: 'system', default_refine_enabled: true },
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        tokens: {
          access_token: 'at-123',
          refresh_token: 'rt-123',
          expires_in: 3600,
        },
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          email: 'test@example.com',
          password: 'SecurePass123!',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload) as { success: boolean };
      expect(body.success).toBe(true);
    });

    it('returns 400 on invalid input', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          email: 'invalid',
          password: 'short',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('returns 200 on successful login', async () => {
      mockAuthService.login.mockResolvedValue({
        user: {
          id: 'user-123',
          email: 'test@example.com',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        profile: {
          id: 'profile-1',
          user_id: 'user-123',
          email_verified: true,
          email_verified_at: '2024-01-01',
          settings: { theme: 'system', default_refine_enabled: true },
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        tokens: {
          access_token: 'at-123',
          refresh_token: 'rt-123',
          expires_in: 3600,
        },
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'test@example.com',
          password: 'anypassword',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload) as { success: boolean };
      expect(body.success).toBe(true);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('returns 200 on successful logout', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);

      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/logout',
        headers: {
          authorization: 'Bearer valid-token',
        },
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('returns new tokens', async () => {
      mockAuthService.refreshToken.mockResolvedValue({
        access_token: 'new-at',
        refresh_token: 'new-rt',
        expires_in: 3600,
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/refresh',
        payload: { refresh_token: 'old-rt' },
      });

      expect(response.statusCode).toBe(200);
    });

    it('returns 400 when refresh_token missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/refresh',
        payload: {},
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/verify-email', () => {
    it('returns 200 on valid token', async () => {
      mockAuthService.verifyEmail.mockResolvedValue(undefined);

      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/verify-email',
        payload: { token: 'valid-token' },
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('POST /api/auth/resend-verification', () => {
    it('returns 200', async () => {
      mockAuthService.resendVerification.mockResolvedValue(undefined);

      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/resend-verification',
        payload: { email: 'test@example.com' },
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('returns 200', async () => {
      mockAuthService.forgotPassword.mockResolvedValue(undefined);

      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/forgot-password',
        payload: { email: 'test@example.com' },
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('returns 200 on valid input', async () => {
      mockAuthService.resetPassword.mockResolvedValue(undefined);

      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/reset-password',
        payload: {
          token: 'reset-token',
          password: 'NewSecure123!Pass',
        },
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('POST /api/auth/change-password', () => {
    it('returns 200 on valid input', async () => {
      mockAuthService.changePassword.mockResolvedValue(undefined);

      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/change-password',
        headers: {
          authorization: 'Bearer valid-token',
        },
        payload: {
          current_password: 'OldPass123!',
          new_password: 'NewSecure123!Pass',
        },
      });

      expect(response.statusCode).toBe(200);
    });
  });
});
