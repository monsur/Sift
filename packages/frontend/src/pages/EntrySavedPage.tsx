import { useParams, Link } from 'react-router-dom';
import { useEntry } from '@hooks/useEntries';
import { Button } from '@components/ui/button';

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function EntrySavedPage() {
  const { id } = useParams<{ id: string }>();
  const { data: entry, isLoading } = useEntry(id);

  return (
    <div className="max-w-lg mx-auto py-12 px-4">
      <div
        className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg p-12 text-center shadow-sm animate-[fadeInUp_0.4s_ease-out]"
      >
        <div className="w-16 h-16 mx-auto mb-6 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white text-3xl animate-[fadeInUp_0.4s_ease-out_0.1s_both]">
          &#x2713;
        </div>

        <h1 className="text-2xl font-semibold mb-1">Entry Saved</h1>

        {isLoading ? (
          <p className="text-[var(--color-muted-foreground)] mb-8">Loading...</p>
        ) : entry ? (
          <p className="text-[var(--color-muted-foreground)] font-medium mb-8">
            {formatDate(entry.entry_date)}
          </p>
        ) : null}

        <div className="bg-sky-50 border border-sky-200 rounded-lg p-5 mb-6">
          <div className="text-4xl font-bold text-[var(--color-primary)] leading-none mb-1">
            1
          </div>
          <div className="text-lg font-medium mb-2">Days in a row</div>
          <p className="text-sm text-[var(--color-muted-foreground)] italic">
            You&apos;re building a practice of self-awareness
          </p>
        </div>

        <Link to="/dashboard">
          <Button size="lg" className="px-8">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default EntrySavedPage;
