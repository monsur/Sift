import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildApp } from '../app.js';
import type { FastifyInstance } from 'fastify';

const {
  mockEntryService,
  mockAuthMiddleware,
  mockRequireVerified,
  mockGetRecentEntries,
  mockGenerateSummary,
  mockEstimateTotalCost,
} = vi.hoisted(() => ({
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
  mockGetRecentEntries: vi.fn().mockResolvedValue([]),
  mockGenerateSummary: vi.fn(),
  mockEstimateTotalCost: vi.fn().mockReturnValue(0.01),
}));

vi.mock('../middleware/auth.middleware.js', () => ({
  authMiddleware: mockAuthMiddleware,
  requireVerified: mockRequireVerified,
}));

vi.mock('../services/entry.service.js', () => ({
  entryService: mockEntryService,
}));

vi.mock('../services/context.service.js', () => ({
  getRecentEntries: mockGetRecentEntries,
}));

vi.mock('../services/summary.service.js', () => ({
  generateSummary: mockGenerateSummary,
  estimateTotalCost: mockEstimateTotalCost,
}));

vi.mock('../services/conversation.service.js', () => ({
  startConversation: vi.fn(),
  continueConversation: vi.fn(),
}));

vi.mock('../services/dashboard.service.js', () => ({
  dashboardService: { getStats: vi.fn(), getTimeline: vi.fn(), updateCachedStats: vi.fn() },
}));

vi.mock('../config/supabase.js', () => ({
  createAnonClient: vi.fn().mockReturnValue({ from: vi.fn() }),
  getServiceClient: vi.fn().mockReturnValue({ from: vi.fn() }),
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

const mockEntryWithTranscript = {
  id: 'entry-1',
  user_id: 'user-123',
  entry_date: '2026-01-15',
  raw_entry: 'Today was a good day.',
  refined_entry: null,
  tldr: null,
  key_moments: null,
  score: null,
  ai_suggested_score: null,
  score_justification: null,
  input_method: 'text',
  voice_duration_seconds: null,
  conversation_transcript: [
    { role: 'user', content: 'Today was a good day.', timestamp: '2026-01-15T00:00:00Z' },
    { role: 'assistant', content: 'What made it good?', timestamp: '2026-01-15T00:00:00Z' },
    { role: 'user', content: 'Got promoted!', timestamp: '2026-01-15T00:00:01Z' },
  ],
  token_count: null,
  estimated_cost: null,
  created_at: '2026-01-15T00:00:00Z',
  updated_at: '2026-01-15T00:00:00Z',
};

const mockSummaryResult = {
  summary: {
    refined_entry: 'Today was a wonderful day of professional growth.',
    key_moments: ['got promoted'],
    tldr: 'A great day capped by a promotion',
    ai_suggested_score: 9,
    score_justification: 'Very positive day with career milestone',
  },
  token_usage: { input_tokens: 200, output_tokens: 100, total_tokens: 300 },
};

describe('Summary Routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = await buildApp();
  });

  describe('POST /api/summary/generate', () => {
    it('generates a summary from entry with transcript', async () => {
      mockEntryService.getById.mockResolvedValue(mockEntryWithTranscript);
      mockGenerateSummary.mockResolvedValue(mockSummaryResult);

      const response = await app.inject({
        method: 'POST',
        url: '/api/summary/generate',
        headers: { authorization: 'Bearer valid-token' },
        payload: { entry_id: 'entry-1' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload) as {
        success: boolean;
        data: { summary: typeof mockSummaryResult.summary };
      };
      expect(body.data.summary.tldr).toBe('A great day capped by a promotion');
    });

    it('returns 400 when entry has no transcript', async () => {
      const entryNoTranscript = { ...mockEntryWithTranscript, conversation_transcript: null };
      mockEntryService.getById.mockResolvedValue(entryNoTranscript);

      const response = await app.inject({
        method: 'POST',
        url: '/api/summary/generate',
        headers: { authorization: 'Bearer valid-token' },
        payload: { entry_id: 'entry-1' },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /api/summary/finalize', () => {
    it('finalizes summary and returns updated entry', async () => {
      const updatedEntry = {
        ...mockEntryWithTranscript,
        refined_entry: mockSummaryResult.summary.refined_entry,
        tldr: mockSummaryResult.summary.tldr,
        score: 9,
      };
      mockEntryService.getById.mockResolvedValue(mockEntryWithTranscript);
      mockGenerateSummary.mockResolvedValue(mockSummaryResult);
      mockEntryService.saveRefinement.mockResolvedValue(updatedEntry);

      const response = await app.inject({
        method: 'POST',
        url: '/api/summary/finalize',
        headers: { authorization: 'Bearer valid-token' },
        payload: { entry_id: 'entry-1', score: 9 },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload) as {
        success: boolean;
        data: typeof updatedEntry;
      };
      expect(body.data.refined_entry).toBe(
        'Today was a wonderful day of professional growth.'
      );
    });

    it('returns 400 for missing entry_id', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/summary/finalize',
        headers: { authorization: 'Bearer valid-token' },
        payload: {},
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
