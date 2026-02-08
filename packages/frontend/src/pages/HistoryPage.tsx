import { useState, useEffect, useRef } from 'react';
import type { EntryListParams } from 'shared/schemas';
import { useEntryList } from '@hooks/useEntries';
import { EntryCard } from '@components/entries/EntryCard';
import { EmptyState } from '@components/entries/EmptyState';
import { Pagination } from '@components/entries/Pagination';
import { Button } from '@components/ui/button';

function HistoryPage() {
  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState<EntryListParams['sort_by']>('entry_date');
  const [sortOrder, setSortOrder] = useState<EntryListParams['sort_order']>('desc');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const limit = 20;

  const params: Partial<EntryListParams> = {
    page,
    limit,
    sort_by: sortBy,
    sort_order: sortOrder,
    ...(dateFrom ? { date_from: dateFrom } : {}),
    ...(dateTo ? { date_to: dateTo } : {}),
    ...(search ? { search } : {}),
  };

  const { data, isLoading } = useEntryList(params);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput]);

  const hasFilters = dateFrom || dateTo || search || sortBy !== 'entry_date' || sortOrder !== 'desc';

  function clearFilters() {
    setDateFrom('');
    setDateTo('');
    setSortBy('entry_date');
    setSortOrder('desc');
    setSearchInput('');
    setSearch('');
    setPage(1);
  }

  if (!isLoading && (!data || data.total === 0) && !hasFilters) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <EmptyState />
      </div>
    );
  }

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-6">Your Entries</h1>

      {/* Filter Bar */}
      <div className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg p-4 mb-4 shadow-sm">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-[var(--color-muted-foreground)] mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search entries..."
              className="w-full px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-md bg-[var(--color-background)] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-muted-foreground)] mb-1">
              From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-md bg-[var(--color-background)] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-muted-foreground)] mb-1">
              To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-md bg-[var(--color-background)] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-muted-foreground)] mb-1">
              Sort by
            </label>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value as EntryListParams['sort_by']); setPage(1); }}
              className="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-md bg-[var(--color-background)] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
            >
              <option value="entry_date">Date</option>
              <option value="score">Score</option>
              <option value="created_at">Created</option>
            </select>
          </div>
          <button
            onClick={() => { setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc'); setPage(1); }}
            className="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-md bg-[var(--color-background)] text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors"
            title={sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}
          >
            {sortOrder === 'desc' ? '\u2193' : '\u2191'}
          </button>
          {hasFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <p className="text-[var(--color-muted-foreground)]">Loading...</p>
      ) : !data || data.items.length === 0 ? (
        <p className="text-[var(--color-muted-foreground)] text-center py-8">
          No entries match your filters.
        </p>
      ) : (
        <>
          <div className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg px-8 shadow-sm">
            {data.items.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

export default HistoryPage;
