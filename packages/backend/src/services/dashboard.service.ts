import type {
  DashboardStats,
  DashboardTimeline,
  TimelineDataPoint,
  ScoreDistributionPoint,
} from 'shared/types';
import type { TimelinePeriod } from 'shared/constants';
import { TREND_ANALYSIS_MIN_ENTRIES, TREND_LOOKBACK_DAYS } from 'shared/constants';
import { getServiceClient } from '../config/supabase.js';
import { AppError } from '../utils/errors.js';

function toDateStr(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export class DashboardService {
  async getStats(userId: string): Promise<DashboardStats> {
    const supabase = getServiceClient();

    // Fetch cached stats from user_profiles
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select(
        'total_entries, current_streak, longest_streak, avg_score_7_day, avg_score_30_day, avg_score_all_time'
      )
      .eq('user_id', userId)
      .single();

    if (profileError || !profile) {
      throw new AppError('Failed to fetch dashboard stats', 500, 'DASHBOARD_STATS_FAILED');
    }

    // Fetch score distribution
    const { data: entries, error: distError } = await supabase
      .from('entries')
      .select('score')
      .eq('user_id', userId)
      .not('score', 'is', null);

    if (distError) {
      throw new AppError('Failed to fetch score distribution', 500, 'DASHBOARD_STATS_FAILED');
    }

    const distribution = this.calculateDistribution(entries ?? []);

    // Use actual entry count to guard against stale cached stats
    const { count: actualCount } = await supabase
      .from('entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const totalEntries = actualCount ?? (profile.total_entries as number) ?? 0;

    // If cache is stale, refresh it in the background
    if (totalEntries !== ((profile.total_entries as number) ?? 0)) {
      this.updateCachedStats(userId).catch(console.error);
    }

    // Calculate trend
    const trend = await this.calculateTrend(userId);

    // Get last entry date
    const { data: lastEntry } = await supabase
      .from('entries')
      .select('entry_date')
      .eq('user_id', userId)
      .order('entry_date', { ascending: false })
      .limit(1)
      .single();

    return {
      total_entries: totalEntries,
      current_streak: (profile.current_streak as number) ?? 0,
      longest_streak: (profile.longest_streak as number) ?? 0,
      avg_score_7_day: (profile.avg_score_7_day as number) ?? null,
      avg_score_30_day: (profile.avg_score_30_day as number) ?? null,
      avg_score_all_time: (profile.avg_score_all_time as number) ?? null,
      score_distribution: distribution,
      score_trend: trend,
      last_entry_date: lastEntry ? (lastEntry.entry_date as string) : null,
    };
  }

  async getTimeline(userId: string, period: TimelinePeriod): Promise<DashboardTimeline> {
    const supabase = getServiceClient();

    let query = supabase
      .from('entries')
      .select('entry_date, score, id')
      .eq('user_id', userId)
      .not('score', 'is', null)
      .order('entry_date', { ascending: true });

    if (period !== 'all') {
      const fromDate = this.getPeriodStartDate(period);
      query = query.gte('entry_date', fromDate);
    }

    const { data, error } = await query;

    if (error) {
      throw new AppError('Failed to fetch timeline', 500, 'DASHBOARD_TIMELINE_FAILED');
    }

    const dataPoints: TimelineDataPoint[] = (data ?? []).map((row) => ({
      entry_date: row.entry_date as string,
      score: row.score as number,
      entry_id: row.id as string,
    }));

    return {
      data_points: dataPoints,
      period,
    };
  }

  async updateCachedStats(userId: string): Promise<void> {
    const supabase = getServiceClient();

    // Fetch all entries for calculations
    const { data: entries, error } = await supabase
      .from('entries')
      .select('entry_date, score')
      .eq('user_id', userId)
      .order('entry_date', { ascending: true });

    if (error) {
      console.error('Failed to update cached stats:', error);
      return;
    }

    const allEntries = entries ?? [];
    const totalEntries = allEntries.length;

    // Calculate streaks
    const dates = allEntries.map((e) => e.entry_date as string).sort();
    const currentStreak = this.calculateCurrentStreak(dates);
    const longestStreak = this.calculateLongestStreak(dates);

    // Calculate averages
    const scoredEntries = allEntries.filter((e) => e.score != null);
    const now = new Date();
    const avgScore7Day = this.calculateAvgScore(scoredEntries, now, 7);
    const avgScore30Day = this.calculateAvgScore(scoredEntries, now, 30);
    const avgScoreAllTime =
      scoredEntries.length > 0
        ? scoredEntries.reduce((sum, e) => sum + (e.score as number), 0) / scoredEntries.length
        : null;

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        total_entries: totalEntries,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        avg_score_7_day: avgScore7Day,
        avg_score_30_day: avgScore30Day,
        avg_score_all_time: avgScoreAllTime,
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Failed to update cached stats:', updateError);
    }
  }

  private calculateDistribution(
    entries: Array<Record<string, unknown>>
  ): ScoreDistributionPoint[] {
    const counts = new Map<number, number>();
    for (const entry of entries) {
      const score = entry.score as number;
      counts.set(score, (counts.get(score) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([score, count]) => ({ score, count }))
      .sort((a, b) => a.score - b.score);
  }

  private async calculateTrend(
    userId: string
  ): Promise<'up' | 'down' | 'stable' | 'insufficient_data'> {
    const supabase = getServiceClient();
    const now = new Date();
    const lookbackStart = new Date(now);
    lookbackStart.setDate(lookbackStart.getDate() - TREND_LOOKBACK_DAYS);
    const midpoint = new Date(now);
    midpoint.setDate(midpoint.getDate() - TREND_LOOKBACK_DAYS / 2);

    const { data: recentEntries, error } = await supabase
      .from('entries')
      .select('entry_date, score')
      .eq('user_id', userId)
      .not('score', 'is', null)
      .gte('entry_date', toDateStr(lookbackStart));

    if (error || !recentEntries || recentEntries.length < TREND_ANALYSIS_MIN_ENTRIES) {
      return 'insufficient_data';
    }

    const midpointStr = toDateStr(midpoint);
    const olderScores = recentEntries
      .filter((e) => (e.entry_date as string) < midpointStr)
      .map((e) => e.score as number);
    const newerScores = recentEntries
      .filter((e) => (e.entry_date as string) >= midpointStr)
      .map((e) => e.score as number);

    if (olderScores.length === 0 || newerScores.length === 0) {
      return 'insufficient_data';
    }

    const olderAvg = olderScores.reduce((a, b) => a + b, 0) / olderScores.length;
    const newerAvg = newerScores.reduce((a, b) => a + b, 0) / newerScores.length;
    const diff = newerAvg - olderAvg;

    if (diff > 0.5) return 'up';
    if (diff < -0.5) return 'down';
    return 'stable';
  }

  private calculateCurrentStreak(sortedDates: string[]): number {
    if (sortedDates.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = toDateStr(today);
    const yesterdayStr = toDateStr(yesterday);

    const lastDate = sortedDates[sortedDates.length - 1]!;
    if (lastDate !== todayStr && lastDate !== yesterdayStr) {
      return 0;
    }

    let streak = 1;
    for (let i = sortedDates.length - 2; i >= 0; i--) {
      const current = new Date(sortedDates[i + 1]!);
      const prev = new Date(sortedDates[i]!);
      const diffDays = Math.round(
        (current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  private calculateLongestStreak(sortedDates: string[]): number {
    if (sortedDates.length === 0) return 0;

    let longest = 1;
    let current = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]!);
      const currDate = new Date(sortedDates[i]!);
      const diffDays = Math.round(
        (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays === 1) {
        current++;
        longest = Math.max(longest, current);
      } else {
        current = 1;
      }
    }

    return longest;
  }

  private calculateAvgScore(
    entries: Array<Record<string, unknown>>,
    now: Date,
    days: number
  ): number | null {
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = toDateStr(cutoff);

    const filtered = entries.filter((e) => (e.entry_date as string) >= cutoffStr);
    if (filtered.length === 0) return null;

    return filtered.reduce((sum, e) => sum + (e.score as number), 0) / filtered.length;
  }

  private getPeriodStartDate(period: Exclude<TimelinePeriod, 'all'>): string {
    const now = new Date();
    switch (period) {
      case 'week':
        now.setDate(now.getDate() - 7);
        break;
      case 'month':
        now.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        now.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        now.setFullYear(now.getFullYear() - 1);
        break;
    }
    return toDateStr(now);
  }
}

export const dashboardService = new DashboardService();
