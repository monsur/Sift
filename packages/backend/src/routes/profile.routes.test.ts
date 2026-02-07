import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildApp } from '../app.js';
import type { FastifyInstance } from 'fastify';

const { mockFrom, mockAuthMiddleware, mockRequireVerified } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockAuthMiddleware: vi.fn().mockImplementation(async (request: { user: unknown }) => {
    request.user = {
      id: 'user-123',
      email: 'test@example.com',
      email_verified: true,
    };
  }),
  mockRequireVerified: vi.fn().mockImplementation(async () => {}),
}));

// Mock auth middleware
vi.mock('../middleware/auth.middleware.js', () => ({
  authMiddleware: mockAuthMiddleware,
  requireVerified: mockRequireVerified,
}));

// Mock supabase
vi.mock('../config/supabase.js', () => ({
  createAnonClient: vi.fn().mockReturnValue({ from: mockFrom }),
  getServiceClient: vi.fn().mockReturnValue({ from: mockFrom }),
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

// Also mock auth service since auth routes are registered too
vi.mock('../services/auth.service.js', () => ({
  authService: {
    signup: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn(),
    verifyEmail: vi.fn(),
    resendVerification: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    changePassword: vi.fn(),
  },
}));

const mockProfile = {
  id: 'profile-1',
  user_id: 'user-123',
  email_verified: true,
  email_verified_at: '2024-01-01',
  settings: { theme: 'system', default_refine_enabled: true },
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

describe('Profile Routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    mockFrom.mockReset();
    app = await buildApp();
  });

  describe('GET /api/profile', () => {
    it('returns profile data', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/profile',
        headers: { authorization: 'Bearer valid-token' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload) as {
        success: boolean;
        data: { profile: { settings: { theme: string } } };
      };
      expect(body.success).toBe(true);
      expect(body.data.profile.settings.theme).toBe('system');
    });

    it('returns 404 when profile not found', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
            }),
          }),
        }),
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/profile',
        headers: { authorization: 'Bearer valid-token' },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/profile', () => {
    it('updates profile settings', async () => {
      const updatedProfile = {
        ...mockProfile,
        settings: { theme: 'dark', default_refine_enabled: true },
      };

      // from('user_profiles') is called twice: once for select (existing), once for update
      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // First call: select existing settings
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockProfile,
                  error: null,
                }),
              }),
            }),
          };
        }
        // Second call: update
        return {
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: updatedProfile,
                  error: null,
                }),
              }),
            }),
          }),
        };
      });

      const response = await app.inject({
        method: 'PATCH',
        url: '/api/profile',
        headers: { authorization: 'Bearer valid-token' },
        payload: { settings: { theme: 'dark' } },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload) as {
        success: boolean;
        data: { profile: { settings: { theme: string } } };
      };
      expect(body.data.profile.settings.theme).toBe('dark');
    });

    it('returns 400 on invalid settings', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: '/api/profile',
        headers: { authorization: 'Bearer valid-token' },
        payload: { settings: { theme: 'rainbow' } },
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
