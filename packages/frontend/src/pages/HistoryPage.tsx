import { useState } from 'react';
import { useEntryList } from '@hooks/useEntries';
import { EntryCard } from '@components/entries/EntryCard';
import { EmptyState } from '@components/entries/EmptyState';
import { Pagination } from '@components/entries/Pagination';

function HistoryPage() {
  const [page, setPage] = useState(1);
  const limit = 20;
  const { data, isLoading } = useEntryList({ page, limit });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <h1 className="text-2xl font-semibold mb-6">Your Entries</h1>
        <p className="text-[var(--color-muted-foreground)]">Loading...</p>
      </div>
    );
  }

  if (!data || data.total === 0) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <EmptyState />
      </div>
    );
  }

  const totalPages = Math.ceil(data.total / limit);

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-6">Your Entries</h1>
      <div className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg px-8 shadow-sm">
        {data.items.map((entry) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

export default HistoryPage;
