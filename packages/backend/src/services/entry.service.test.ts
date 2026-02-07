import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EntryService } from './entry.service.js';

const { mockFrom } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
}));

vi.mock('../config/supabase.js', () => ({
  getServiceClient: vi.fn().mockReturnValue({ from: mockFrom }),
}));

const service = new EntryService();
const userId = 'user-123';

const mockEntryRow = {
  id: 'entry-1',
  user_id: userId,
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

describe('EntryService', () => {
  beforeEach(() => {
    mockFrom.mockReset();
  });

  describe('create', () => {
    it('creates an entry successfully', async () => {
      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // Duplicate check
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: null, error: null }),
                }),
              }),
            }),
          };
        }
        // Insert
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockEntryRow,
                error: null,
              }),
            }),
          }),
        };
      });

      const entry = await service.create(userId, {
        entry_date: '2026-01-15',
        raw_entry: 'Today was a good day.',
        score: 7,
        input_method: 'text',
      });

      expect(entry.id).toBe('entry-1');
      expect(entry.raw_entry).toBe('Today was a good day.');
      expect(entry.score).toBe(7);
    });

    it('throws 409 for duplicate date', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'existing-entry' },
                error: null,
              }),
            }),
          }),
        }),
      });

      await expect(
        service.create(userId, {
          entry_date: '2026-01-15',
          raw_entry: 'Another entry.',
          input_method: 'text',
        })
      ).rejects.toThrow('An entry already exists for this date');
    });
  });

  describe('getById', () => {
    it('returns entry for owner', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockEntryRow,
              error: null,
            }),
          }),
        }),
      });

      const entry = await service.getById(userId, 'entry-1');
      expect(entry.id).toBe('entry-1');
    });

    it('throws 404 when not found', async () => {
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

      await expect(service.getById(userId, 'nonexistent')).rejects.toThrow(
        'Entry not found'
      );
    });

    it('throws 403 for non-owner', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { ...mockEntryRow, user_id: 'other-user' },
              error: null,
            }),
          }),
        }),
      });

      await expect(service.getById(userId, 'entry-1')).rejects.toThrow(
        'You do not have access to this entry'
      );
    });
  });

  describe('list', () => {
    it('returns paginated entries', async () => {
      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // Count query
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ count: 2, error: null }),
            }),
          };
        }
        // Data query
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                range: vi.fn().mockResolvedValue({
                  data: [mockEntryRow],
                  error: null,
                }),
              }),
            }),
          }),
        };
      });

      const result = await service.list(userId, {
        page: 1,
        limit: 1,
        sort_by: 'entry_date',
        sort_order: 'desc',
      });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(2);
      expect(result.hasMore).toBe(true);
    });
  });

  describe('update', () => {
    it('updates score on entry', async () => {
      const updatedRow = { ...mockEntryRow, score: 9 };
      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // getById ownership check
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockEntryRow,
                  error: null,
                }),
              }),
            }),
          };
        }
        // Update
        return {
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: updatedRow,
                  error: null,
                }),
              }),
            }),
          }),
        };
      });

      const entry = await service.update(userId, 'entry-1', { score: 9 });
      expect(entry.score).toBe(9);
    });
  });

  describe('delete', () => {
    it('deletes entry for owner', async () => {
      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // getById ownership check
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockEntryRow,
                  error: null,
                }),
              }),
            }),
          };
        }
        // Delete
        return {
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        };
      });

      await expect(service.delete(userId, 'entry-1')).resolves.toBeUndefined();
    });
  });
});
