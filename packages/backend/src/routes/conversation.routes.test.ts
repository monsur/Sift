import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildApp } from '../app.js';
import type { FastifyInstance } from 'fastify';

const {
  mockEntryService,
  mockAuthMiddleware,
  mockRequireVerified,
  mockGetRecentEntries,
  mockStartConversation,
  mockContinueConversation,
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
  mockStartConversation: vi.fn(),
  mockContinueConversation: vi.fn(),
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

vi.mock('../services/conversation.service.js', () => ({
  startConversation: mockStartConversation,
  continueConversation: mockContinueConversation,
}));

vi.mock('../services/summary.service.js', () => ({
  generateSummary: vi.fn(),
  estimateTotalCost: vi.fn(),
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

const mockEntry = {
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
  conversation_transcript: null,
  token_count: null,
  estimated_cost: null,
  created_at: '2026-01-15T00:00:00Z',
  updated_at: '2026-01-15T00:00:00Z',
};

describe('Conversation Routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = await buildApp();
  });

  describe('POST /api/conversation/start', () => {
    it('starts a conversation and returns AI response', async () => {
      mockEntryService.getById.mockResolvedValue(mockEntry);
      mockEntryService.saveTranscript.mockResolvedValue(mockEntry);
      mockStartConversation.mockResolvedValue({
        message: 'How did that make you feel?',
        is_done: false,
        token_usage: { input_tokens: 50, output_tokens: 20, total_tokens: 70 },
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/conversation/start',
        headers: { authorization: 'Bearer valid-token' },
        payload: { entry_id: 'entry-1' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload) as {
        success: boolean;
        data: { message: string; is_done: boolean };
      };
      expect(body.success).toBe(true);
      expect(body.data.message).toBe('How did that make you feel?');
      expect(body.data.is_done).toBe(false);
    });

    it('returns 400 for missing entry_id', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/conversation/start',
        headers: { authorization: 'Bearer valid-token' },
        payload: {},
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /api/conversation/message', () => {
    it('continues conversation with user reply', async () => {
      const entryWithTranscript = {
        ...mockEntry,
        conversation_transcript: [
          { role: 'user', content: 'Today was a good day.', timestamp: '2026-01-15T00:00:00Z' },
          { role: 'assistant', content: 'How so?', timestamp: '2026-01-15T00:00:00Z' },
        ],
      };
      mockEntryService.getById.mockResolvedValue(entryWithTranscript);
      mockEntryService.saveTranscript.mockResolvedValue(entryWithTranscript);
      mockContinueConversation.mockResolvedValue({
        message: 'That sounds great!',
        is_done: false,
        token_usage: { input_tokens: 80, output_tokens: 15, total_tokens: 95 },
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/conversation/message',
        headers: { authorization: 'Bearer valid-token' },
        payload: { entry_id: 'entry-1', message: 'I got promoted!' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload) as {
        success: boolean;
        data: { message: string; is_done: boolean };
      };
      expect(body.data.message).toBe('That sounds great!');
    });

    it('returns 400 for empty message', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/conversation/message',
        headers: { authorization: 'Bearer valid-token' },
        payload: { entry_id: 'entry-1', message: '' },
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
