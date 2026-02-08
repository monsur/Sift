import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildApp } from '../app.js';
import type { FastifyInstance } from 'fastify';
import type { DashboardStats, DashboardTimeline } from 'shared/types';

const { mockDashboardService, mockAuthMiddleware, mockRequireVerified } = vi.hoisted(() => ({
  mockDashboardService: {
    getStats: vi.fn(),
    getTimeline: vi.fn(),
    updateCachedStats: vi.fn(),
  },
  mockAuthMiddleware: vi.fn().mockImplementation(async (request: { user: unknown }) => {
    request.user = {
      id: 'user-123',
      email: 'test@example.com',
      email_verified: true,
    };
  }),
  mockRequireVerified: vi.fn().mockImplementation(async () => {}),
}));

vi.mock('../middleware/auth.middleware.js', () => ({
  authMiddleware: mockAuthMiddleware,
  requireVerified: mockRequireVerified,
}));

vi.mock('../services/dashboard.service.js', () => ({
  dashboardService: mockDashboardService,
}));

// Mock other services needed by buildApp()
vi.mock('../services/entry.service.js', () => ({
  entryService: {
    create: vi.fn(),
    getById: vi.fn(),
    list: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    saveTranscript: vi.fn(),
    saveRefinement: vi.fn(),
  },
}));

vi.mock('../config/supabase.js', () => ({
  createAnonClient: vi.fn().mockReturnValue({ from: vi.fn() }),
  getServiceClient: vi.fn().mockReturnValue({ from: vi.fn() }),
}));

vi.mock('../services/context.service.js', () => ({
  getRecentEntries: vi.fn().mockResolvedValue([]),
}));

vi.mock('../services/conversation.service.js', () => ({
  startConversation: vi.fn(),
  continueConversation: vi.fn(),
}));

vi.mock('../services/summary.service.js', () => ({
  generateSummary: vi.fn(),
  estimateTotalCost: vi.fn(),
}));

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

const mockStats: DashboardStats = {
  total_entries: 10,
  current_streak: 3,
  longest_streak: 5,
  avg_score_7_day: 7.5,
  avg_score_30_day: 6.8,
  avg_score_all_time: 6.5,
  score_distribution: [
    { score: 7, count: 5 },
    { score: 8, count: 3 },
  ],
  score_trend: 'up',
  last_entry_date: '2026-01-15',
};

const mockTimeline: DashboardTimeline = {
  data_points: [
    { entry_date: '2026-01-10', score: 7, entry_id: 'e1' },
    { entry_date: '2026-01-11', score: 8, entry_id: 'e2' },
  ],
  period: 'month',
};

describe('Dashboard Routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = await buildApp();
  });

  describe('GET /api/dashboard/stats', () => {
    it('returns dashboard stats', async () => {
      mockDashboardService.getStats.mockResolvedValue(mockStats);

      const response = await app.inject({
        method: 'GET',
        url: '/api/dashboard/stats',
        headers: { authorization: 'Bearer valid-token' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload) as { success: boolean; data: DashboardStats };
      expect(body.success).toBe(true);
      expect(body.data.total_entries).toBe(10);
      expect(body.data.current_streak).toBe(3);
      expect(body.data.score_trend).toBe('up');
    });
  });

  describe('GET /api/dashboard/timeline', () => {
    it('returns timeline data with default period', async () => {
      mockDashboardService.getTimeline.mockResolvedValue(mockTimeline);

      const response = await app.inject({
        method: 'GET',
        url: '/api/dashboard/timeline',
        headers: { authorization: 'Bearer valid-token' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload) as { success: boolean; data: DashboardTimeline };
      expect(body.success).toBe(true);
      expect(body.data.data_points).toHaveLength(2);
    });

    it('accepts period query parameter', async () => {
      mockDashboardService.getTimeline.mockResolvedValue({ ...mockTimeline, period: 'week' });

      const response = await app.inject({
        method: 'GET',
        url: '/api/dashboard/timeline?period=week',
        headers: { authorization: 'Bearer valid-token' },
      });

      expect(response.statusCode).toBe(200);
      expect(mockDashboardService.getTimeline).toHaveBeenCalledWith('user-123', 'week');
    });

    it('returns 400 for invalid period', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/dashboard/timeline?period=invalid',
        headers: { authorization: 'Bearer valid-token' },
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
