import { Link } from 'react-router-dom';
import type { Entry } from 'shared/types';

interface RecentEntriesProps {
  entries: Entry[];
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year!, month! - 1, day);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function RecentEntries({ entries }: RecentEntriesProps) {
  return (
    <div className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[var(--color-foreground)]">Recent Entries</h3>
        <Link
          to="/history"
          className="text-sm text-[var(--color-primary)] hover:underline"
        >
          View all
        </Link>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-[var(--color-muted-foreground)]">No entries yet.</p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <Link
              key={entry.id}
              to={`/entries/${entry.id}`}
              className="block py-2 border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-muted)] -mx-2 px-2 rounded transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-muted-foreground)]">
                  {formatDate(entry.entry_date)}
                </span>
                {entry.score != null && (
                  <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-[var(--color-primary)] text-white text-xs font-medium">
                    {entry.score}
                  </span>
                )}
              </div>
              <p className="text-sm text-[var(--color-foreground)] truncate mt-0.5">
                {entry.tldr ?? entry.raw_entry}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
