import { Link } from 'react-router-dom';
import type { Entry } from 'shared/types';

interface EntryCardProps {
  entry: Entry;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function EntryCard({ entry }: EntryCardProps) {
  const preview =
    entry.tldr ?? (entry.raw_entry.length > 150
      ? entry.raw_entry.slice(0, 150) + '...'
      : entry.raw_entry);

  return (
    <div className="py-5 border-b border-[var(--color-border)] last:border-b-0">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm text-[var(--color-muted-foreground)]">
          {formatDate(entry.entry_date)}
        </span>
        {entry.score !== null && (
          <span className="inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-full bg-[var(--color-primary)] text-white text-xs font-medium">
            {entry.score}
          </span>
        )}
      </div>
      <p className="text-[var(--color-foreground)] mb-2 leading-relaxed">
        {preview}
      </p>
      <Link
        to={`/entries/${entry.id}`}
        className="text-sm font-semibold text-[var(--color-primary)] hover:underline"
      >
        Read more &rarr;
      </Link>
    </div>
  );
}

export { EntryCard };
