import { Link } from 'react-router-dom';
import { useDashboardStats } from '@hooks/useDashboard';
import { useEntryList } from '@hooks/useEntries';
import { RECENT_ENTRIES_LIMIT } from 'shared/constants';
import { EmptyState } from '@components/entries/EmptyState';
import { StatsCard } from '@components/dashboard/StatsCard';
import { ScoreChart } from '@components/dashboard/ScoreChart';
import { RecentEntries } from '@components/dashboard/RecentEntries';
import { Button } from '@components/ui/button';

function trendLabel(trend: string): string {
  switch (trend) {
    case 'up':
      return 'Trending up';
    case 'down':
      return 'Trending down';
    case 'stable':
      return 'Stable';
    default:
      return 'Not enough data';
  }
}

function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentEntries, isLoading: entriesLoading } = useEntryList({
    page: 1,
    limit: RECENT_ENTRIES_LIMIT,
  });

  if (statsLoading || entriesLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <p className="text-[var(--color-muted-foreground)]">Loading...</p>
      </div>
    );
  }

  if (!stats || stats.total_entries === 0) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Dashboard</h1>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
            Your wellbeing at a glance
          </p>
        </div>
        <Link to="/new-entry">
          <Button size="lg" className="shadow-md">Write Today&apos;s Entry</Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          label="Total Entries"
          value={stats.total_entries}
        />
        <StatsCard
          label="Current Streak"
          value={`${stats.current_streak} day${stats.current_streak !== 1 ? 's' : ''}`}
          sublabel={`Longest: ${stats.longest_streak} days`}
        />
        <StatsCard
          label="7-Day Average"
          value={stats.avg_score_7_day != null ? stats.avg_score_7_day.toFixed(1) : '--'}
          sublabel={trendLabel(stats.score_trend)}
        />
        <StatsCard
          label="30-Day Average"
          value={stats.avg_score_30_day != null ? stats.avg_score_30_day.toFixed(1) : '--'}
          sublabel={stats.avg_score_all_time != null ? `All-time: ${stats.avg_score_all_time.toFixed(1)}` : undefined}
        />
      </div>

      {/* Chart and Recent Entries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ScoreChart />
        </div>
        <div>
          <RecentEntries entries={recentEntries?.items ?? []} />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
