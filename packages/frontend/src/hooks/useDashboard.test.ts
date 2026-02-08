import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useDashboardStats, useDashboardTimeline } from './useDashboard';

vi.mock('@services/dashboard.api', () => ({
  dashboardApi: {
    getStats: vi.fn(),
    getTimeline: vi.fn(),
  },
}));

import { dashboardApi } from '@services/dashboard.api';

const mockDashboardApi = vi.mocked(dashboardApi);

const mockStats = {
  total_entries: 10,
  current_streak: 3,
  longest_streak: 5,
  avg_score_7_day: 7.5,
  avg_score_30_day: 6.8,
  avg_score_all_time: 6.5,
  score_distribution: [{ score: 7, count: 5 }],
  score_trend: 'up' as const,
  last_entry_date: '2026-01-15',
};

const mockTimeline = {
  data_points: [
    { entry_date: '2026-01-10', score: 7, entry_id: 'e1' },
    { entry_date: '2026-01-11', score: 8, entry_id: 'e2' },
  ],
  period: 'month',
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useDashboard hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useDashboardStats', () => {
    it('fetches dashboard stats', async () => {
      mockDashboardApi.getStats.mockResolvedValue({
        data: { success: true, data: mockStats },
      } as never);

      const { result } = renderHook(() => useDashboardStats(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.total_entries).toBe(10);
      expect(result.current.data?.score_trend).toBe('up');
    });
  });

  describe('useDashboardTimeline', () => {
    it('fetches timeline data for given period', async () => {
      mockDashboardApi.getTimeline.mockResolvedValue({
        data: { success: true, data: mockTimeline },
      } as never);

      const { result } = renderHook(() => useDashboardTimeline('month'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.data_points).toHaveLength(2);
      expect(result.current.data?.period).toBe('month');
    });
  });
});
