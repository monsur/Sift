import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import {
  useStartConversation,
  useSendMessage,
  useGenerateSummary,
  useFinalizeSummary,
} from './useConversation';

vi.mock('@services/conversation.api', () => ({
  conversationApi: {
    start: vi.fn(),
    sendMessage: vi.fn(),
  },
}));

vi.mock('@services/summary.api', () => ({
  summaryApi: {
    generate: vi.fn(),
    finalize: vi.fn(),
  },
}));

import { conversationApi } from '@services/conversation.api';
import { summaryApi } from '@services/summary.api';

const mockConversationApi = vi.mocked(conversationApi);
const mockSummaryApi = vi.mocked(summaryApi);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useConversation hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useStartConversation', () => {
    it('starts a conversation and returns result', async () => {
      const turnResult = {
        message: 'How was your day?',
        is_done: false,
        token_usage: { input_tokens: 10, output_tokens: 20, total_tokens: 30 },
      };

      mockConversationApi.start.mockResolvedValue({
        data: { success: true, data: turnResult },
      } as never);

      const { result } = renderHook(() => useStartConversation(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate('entry-1');
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(turnResult);
      expect(mockConversationApi.start).toHaveBeenCalledWith('entry-1');
    });
  });

  describe('useSendMessage', () => {
    it('sends a message and returns result', async () => {
      const turnResult = {
        message: 'That sounds nice!',
        is_done: false,
        token_usage: { input_tokens: 15, output_tokens: 25, total_tokens: 40 },
      };

      mockConversationApi.sendMessage.mockResolvedValue({
        data: { success: true, data: turnResult },
      } as never);

      const { result } = renderHook(() => useSendMessage(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate({ entryId: 'entry-1', message: 'It was great' });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(turnResult);
      expect(mockConversationApi.sendMessage).toHaveBeenCalledWith('entry-1', 'It was great');
    });
  });

  describe('useGenerateSummary', () => {
    it('generates a summary', async () => {
      const summaryResult = {
        summary: {
          refined_entry: 'A nice day.',
          key_moments: ['Had fun'],
          tldr: 'Good day',
          ai_suggested_score: 8,
          score_justification: 'Positive vibes',
        },
        token_usage: { input_tokens: 100, output_tokens: 200, total_tokens: 300 },
      };

      mockSummaryApi.generate.mockResolvedValue({
        data: { success: true, data: summaryResult },
      } as never);

      const { result } = renderHook(() => useGenerateSummary(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate('entry-1');
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.summary.tldr).toBe('Good day');
    });
  });

  describe('useFinalizeSummary', () => {
    it('finalizes a summary with score', async () => {
      const entry = {
        id: 'entry-1',
        user_id: 'user-1',
        entry_date: '2026-01-15',
        raw_entry: 'test',
        refined_entry: 'A nice day.',
        tldr: 'Good day',
        key_moments: ['Had fun'],
        score: 8,
        ai_suggested_score: 8,
        score_justification: 'Positive',
        input_method: 'text' as const,
        voice_duration_seconds: null,
        conversation_transcript: null,
        token_count: 300,
        estimated_cost: 0.001,
        created_at: '2026-01-15T00:00:00Z',
        updated_at: '2026-01-15T00:00:00Z',
      };

      mockSummaryApi.finalize.mockResolvedValue({
        data: { success: true, data: entry },
      } as never);

      const { result } = renderHook(() => useFinalizeSummary(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate({
          entryId: 'entry-1',
          score: 8,
          scoreJustification: 'Positive',
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockSummaryApi.finalize).toHaveBeenCalledWith('entry-1', 8, 'Positive');
    });
  });
});
