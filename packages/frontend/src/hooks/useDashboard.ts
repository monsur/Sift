import { useQuery } from '@tanstack/react-query';
import type { TimelinePeriod } from 'shared/constants';
import { dashboardApi } from '@services/dashboard.api';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const { data } = await dashboardApi.getStats();
      return data.data!;
    },
  });
}

export function useDashboardTimeline(period: TimelinePeriod) {
  return useQuery({
    queryKey: ['dashboard', 'timeline', period],
    queryFn: async () => {
      const { data } = await dashboardApi.getTimeline(period);
      return data.data!;
    },
  });
}
