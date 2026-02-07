import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildApp } from '../app.js';
import type { FastifyInstance } from 'fastify';

const { mockEntryService, mockAuthMiddleware, mockRequireVerified } = vi.hoisted(() => ({
  mockEntryService: {
    create: vi.fn(),
    getById: vi.fn(),
    list: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    saveTranscript: vi.fn(),
    saveRefinement: vi.fn(),
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

vi.mock('../services/entry.service.js', () => ({
  entryService: mockEntryService,
}));

// Mock supabase (needed by profile routes)
vi.mock('../config/supabase.js', () => ({
  createAnonClient: vi.fn().mockReturnValue({ from: vi.fn() }),
  getServiceClient: vi.fn().mockReturnValue({ from: vi.fn() }),
}));

// Mock context service (needed by conversation/summary routes)
vi.mock('../services/context.service.js', () => ({
  getRecentEntries: vi.fn().mockResolvedValue([]),
}));

// Mock conversation service (needed by conversation routes)
vi.mock('../services/conversation.service.js', () => ({
  startConversation: vi.fn(),
  continueConversation: vi.fn(),
}));

// Mock summary service (needed by summary routes)
vi.mock('../services/summary.service.js', () => ({
  generateSummary: vi.fn(),
  estimateTotalCost: vi.fn(),
}));

// Mock auth service (needed by auth routes)
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

const mockEntry = {
  id: 'entry-1',
  user_id: 'user-123',
  entry_date: '2026-01-15',
  raw_entry: 'Today was a good day.',
  refined_entry: null,
  tldr: null,
  key_moments: null,
  score: 7,
  ai_suggested_score: null,
  score_justification: null,
  input_method: 'text',
  voice_duration_seconds: null,
  conversation_transcript: null,
  token_count: null,
  estimated_cost: null,
  created_at: '2026-01-15T00:00:00Z',
  updated_at: '2026-01-15T00:00:00Z',
};

describe('Entry Routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = await buildApp();
  });

  describe('POST /api/entries', () => {
    it('creates an entry and returns 201', async () => {
      mockEntryService.create.mockResolvedValue(mockEntry);

      const response = await app.inject({
        method: 'POST',
        url: '/api/entries',
        headers: { authorization: 'Bearer valid-token' },
        payload: {
          entry_date: '2026-01-15',
          raw_entry: 'Today was a good day.',
          score: 7,
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload) as { success: boolean; data: typeof mockEntry };
      expect(body.success).toBe(true);
      expect(body.data.id).toBe('entry-1');
    });

    it('returns 400 for invalid input', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/entries',
        headers: { authorization: 'Bearer valid-token' },
        payload: {
          entry_date: 'invalid-date',
          raw_entry: '',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/entries', () => {
    it('returns paginated entries', async () => {
      const listResult = {
        items: [mockEntry],
        total: 1,
        page: 1,
        limit: 20,
        hasMore: false,
      };
      mockEntryService.list.mockResolvedValue(listResult);

      const response = await app.inject({
        method: 'GET',
        url: '/api/entries',
        headers: { authorization: 'Bearer valid-token' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload) as { success: boolean; data: typeof listResult };
      expect(body.data.items).toHaveLength(1);
      expect(body.data.total).toBe(1);
    });

    it('accepts query params', async () => {
      mockEntryService.list.mockResolvedValue({
        items: [],
        total: 0,
        page: 2,
        limit: 10,
        hasMore: false,
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/entries?page=2&limit=10&sort_by=score&sort_order=asc',
        headers: { authorization: 'Bearer valid-token' },
      });

      expect(response.statusCode).toBe(200);
      expect(mockEntryService.list).toHaveBeenCalledWith('user-123', {
        page: 2,
        limit: 10,
        sort_by: 'score',
        sort_order: 'asc',
      });
    });
  });

  describe('GET /api/entries/:id', () => {
    it('returns a single entry', async () => {
      mockEntryService.getById.mockResolvedValue(mockEntry);

      const response = await app.inject({
        method: 'GET',
        url: '/api/entries/entry-1',
        headers: { authorization: 'Bearer valid-token' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload) as { success: boolean; data: typeof mockEntry };
      expect(body.data.id).toBe('entry-1');
    });
  });

  describe('PATCH /api/entries/:id', () => {
    it('updates entry score', async () => {
      const updated = { ...mockEntry, score: 9 };
      mockEntryService.update.mockResolvedValue(updated);

      const response = await app.inject({
        method: 'PATCH',
        url: '/api/entries/entry-1',
        headers: { authorization: 'Bearer valid-token' },
        payload: { score: 9 },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload) as { success: boolean; data: typeof updated };
      expect(body.data.score).toBe(9);
    });

    it('returns 400 for invalid score', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: '/api/entries/entry-1',
        headers: { authorization: 'Bearer valid-token' },
        payload: { score: 11 },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('DELETE /api/entries/:id', () => {
    it('deletes entry and returns 204', async () => {
      mockEntryService.delete.mockResolvedValue(undefined);

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/entries/entry-1',
        headers: { authorization: 'Bearer valid-token' },
      });

      expect(response.statusCode).toBe(204);
    });
  });
});
