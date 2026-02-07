import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockFrom } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
}));

vi.mock('../config/supabase.js', () => ({
  getServiceClient: vi.fn().mockReturnValue({ from: mockFrom }),
}));

import { getRecentEntries } from './context.service.js';

const mockEntryRow = {
  id: 'entry-1',
  user_id: 'user-1',
  entry_date: '2026-01-15',
  raw_entry: 'Good day.',
  refined_entry: null,
  tldr: 'Good day',
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

describe('Context Service', () => {
  beforeEach(() => {
    mockFrom.mockReset();
  });

  it('returns recent entries for a user', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          gte: vi.fn().mockReturnValue({
            order: vi
              .fn()
              .mockResolvedValue({ data: [mockEntryRow], error: null }),
          }),
        }),
      }),
    });

    const entries = await getRecentEntries('user-1');
    expect(entries).toHaveLength(1);
    expect(entries[0]?.id).toBe('entry-1');
  });

  it('returns empty array on error', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          gte: vi.fn().mockReturnValue({
            order: vi
              .fn()
              .mockResolvedValue({ data: null, error: { message: 'DB error' } }),
          }),
        }),
      }),
    });

    const entries = await getRecentEntries('user-1');
    expect(entries).toEqual([]);
  });

  it('returns empty array when no entries exist', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          gte: vi.fn().mockReturnValue({
            order: vi
              .fn()
              .mockResolvedValue({ data: [], error: null }),
          }),
        }),
      }),
    });

    const entries = await getRecentEntries('user-1');
    expect(entries).toEqual([]);
  });
});
