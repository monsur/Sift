import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TIMELINE_PERIODS, type TimelinePeriod } from 'shared/constants';
import { useDashboardTimeline } from '@hooks/useDashboard';

const PERIOD_LABELS: Record<TimelinePeriod, string> = {
  week: '7D',
  month: '1M',
  quarter: '3M',
  year: '1Y',
  all: 'All',
};

export function ScoreChart() {
  const [period, setPeriod] = useState<TimelinePeriod>('month');
  const { data: timeline, isLoading } = useDashboardTimeline(period);

  return (
    <div className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[var(--color-foreground)]">Score Timeline</h3>
        <div className="flex gap-1">
          {TIMELINE_PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                period === p
                  ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
                  : 'text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="h-[250px] flex items-center justify-center text-[var(--color-muted-foreground)]">
          Loading...
        </div>
      ) : !timeline || timeline.data_points.length === 0 ? (
        <div className="h-[250px] flex items-center justify-center text-[var(--color-muted-foreground)]">
          No data for this period
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={timeline.data_points}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
            />
            <XAxis
              dataKey="entry_date"
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
              tickFormatter={(val: string) => {
                const [, month, day] = val.split('-');
                return `${month}/${day}`;
              }}
            />
            <YAxis
              domain={[1, 10]}
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-background)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelFormatter={(label) => {
                const [year, month, day] = String(label).split('-').map(Number);
                return new Date(year!, month! - 1, day).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={{ fill: 'var(--color-primary)', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
