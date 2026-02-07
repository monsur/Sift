import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useEntryList, useEntry } from './useEntries';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@services/entries.api', () => ({
  entriesApi: {
    list: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import { entriesApi } from '@services/entries.api';

const mockEntriesApi = vi.mocked(entriesApi);

const mockEntry = {
  id: 'entry-1',
  user_id: 'user-123',
  entry_date: '2026-01-15',
  raw_entry: 'A good day.',
  refined_entry: null,
  tldr: null,
  key_moments: null,
  score: 7,
  ai_suggested_score: null,
  score_justification: null,
  input_method: 'text' as const,
  voice_duration_seconds: null,
  conversation_transcript: null,
  token_count: null,
  estimated_cost: null,
  created_at: '2026-01-15T00:00:00Z',
  updated_at: '2026-01-15T00:00:00Z',
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useEntries hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useEntryList', () => {
    it('fetches entries list', async () => {
      mockEntriesApi.list.mockResolvedValue({
        data: {
          success: true,
          data: {
            items: [mockEntry],
            total: 1,
            page: 1,
            limit: 20,
            hasMore: false,
          },
        },
      } as never);

      const { result } = renderHook(() => useEntryList(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.items).toHaveLength(1);
      expect(result.current.data?.items[0].id).toBe('entry-1');
    });
  });

  describe('useEntry', () => {
    it('fetches single entry', async () => {
      mockEntriesApi.getById.mockResolvedValue({
        data: { success: true, data: mockEntry },
      } as never);

      const { result } = renderHook(() => useEntry('entry-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.id).toBe('entry-1');
    });

    it('does not fetch when id is undefined', () => {
      const { result } = renderHook(() => useEntry(undefined), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(mockEntriesApi.getById).not.toHaveBeenCalled();
    });
  });
});
