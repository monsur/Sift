import type { DashboardStats, DashboardTimeline, ApiResponse } from 'shared/types';
import type { TimelinePeriod } from 'shared/constants';
import { api } from './api';

export const dashboardApi = {
  getStats() {
    return api.get<ApiResponse<DashboardStats>>('/dashboard/stats');
  },

  getTimeline(period: TimelinePeriod) {
    return api.get<ApiResponse<DashboardTimeline>>('/dashboard/timeline', {
      params: { period },
    });
  },
};
