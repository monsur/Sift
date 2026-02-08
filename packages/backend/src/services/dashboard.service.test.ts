import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DashboardService } from './dashboard.service.js';

const { mockFrom } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
}));

vi.mock('../config/supabase.js', () => ({
  getServiceClient: vi.fn().mockReturnValue({ from: mockFrom }),
}));

const service = new DashboardService();
const userId = 'user-123';

describe('DashboardService', () => {
  beforeEach(() => {
    mockFrom.mockReset();
  });

  describe('getStats', () => {
    it('returns stats with correct shape', async () => {
      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // user_profiles query
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    total_entries: 10,
                    current_streak: 3,
                    longest_streak: 5,
                    avg_score_7_day: 7.5,
                    avg_score_30_day: 6.8,
                    avg_score_all_time: 6.5,
                  },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (callCount === 2) {
          // score distribution query
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                not: vi.fn().mockResolvedValue({
                  data: [{ score: 7 }, { score: 7 }, { score: 8 }],
                  error: null,
                }),
              }),
            }),
          };
        }
        if (callCount === 3) {
          // trend query
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                not: vi.fn().mockReturnValue({
                  gte: vi.fn().mockResolvedValue({
                    data: [],
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        // last entry query
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { entry_date: '2026-01-15' },
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        };
      });

      const stats = await service.getStats(userId);

      expect(stats.total_entries).toBe(10);
      expect(stats.current_streak).toBe(3);
      expect(stats.longest_streak).toBe(5);
      expect(stats.avg_score_7_day).toBe(7.5);
      expect(stats.score_distribution).toBeDefined();
      expect(stats.score_trend).toBe('insufficient_data');
      expect(stats.last_entry_date).toBe('2026-01-15');
    });

    it('handles zero entries', async () => {
      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    total_entries: 0,
                    current_streak: 0,
                    longest_streak: 0,
                    avg_score_7_day: null,
                    avg_score_30_day: null,
                    avg_score_all_time: null,
                  },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (callCount === 2) {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                not: vi.fn().mockResolvedValue({
                  data: [],
                  error: null,
                }),
              }),
            }),
          };
        }
        if (callCount === 3) {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                not: vi.fn().mockReturnValue({
                  gte: vi.fn().mockResolvedValue({
                    data: [],
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'No rows' },
                  }),
                }),
              }),
            }),
          }),
        };
      });

      const stats = await service.getStats(userId);

      expect(stats.total_entries).toBe(0);
      expect(stats.score_distribution).toEqual([]);
      expect(stats.last_entry_date).toBeNull();
    });
  });

  describe('getTimeline', () => {
    it('returns timeline data for a period', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            not: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                gte: vi.fn().mockResolvedValue({
                  data: [
                    { entry_date: '2026-01-10', score: 7, id: 'e1' },
                    { entry_date: '2026-01-11', score: 8, id: 'e2' },
                  ],
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      const timeline = await service.getTimeline(userId, 'month');

      expect(timeline.period).toBe('month');
      expect(timeline.data_points).toHaveLength(2);
      expect(timeline.data_points[0]!.score).toBe(7);
    });

    it('returns all data when period is all', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            not: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [{ entry_date: '2026-01-01', score: 5, id: 'e1' }],
                error: null,
              }),
            }),
          }),
        }),
      });

      const timeline = await service.getTimeline(userId, 'all');
      expect(timeline.data_points).toHaveLength(1);
    });
  });

  describe('updateCachedStats', () => {
    it('calculates and updates cached stats', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // entries query
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: [
                    { entry_date: '2026-01-13', score: 7 },
                    { entry_date: '2026-01-14', score: 8 },
                    { entry_date: '2026-01-15', score: 6 },
                  ],
                  error: null,
                }),
              }),
            }),
          };
        }
        // user_profiles update
        return { update: mockUpdate };
      });

      await service.updateCachedStats(userId);

      expect(mockUpdate).toHaveBeenCalled();
    });

    it('handles empty entries gracefully', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: [],
                  error: null,
                }),
              }),
            }),
          };
        }
        return { update: mockUpdate };
      });

      await service.updateCachedStats(userId);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          total_entries: 0,
          current_streak: 0,
          longest_streak: 0,
          avg_score_all_time: null,
        })
      );
    });
  });
});
