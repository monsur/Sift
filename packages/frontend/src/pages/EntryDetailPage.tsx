import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEntry, useUpdateEntry, useDeleteEntry, useEntryList } from '@hooks/useEntries';
import { useDashboardStats } from '@hooks/useDashboard';
import { Button } from '@components/ui/button';
import { ScoreSlider } from '@components/ui/slider';
import { Dialog, DialogTitle, DialogDescription, DialogFooter } from '@components/ui/dialog';

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatWeekday(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', { weekday: 'long' });
}

function getPreviousDay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function getNextDay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function EntryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: entry, isLoading } = useEntry(id);
  const updateEntry = useUpdateEntry();
  const deleteEntry = useDeleteEntry();

  const { data: stats } = useDashboardStats();

  // Previous/next entry navigation
  const { data: prevEntryData } = useEntryList(
    entry ? {
      date_to: getPreviousDay(entry.entry_date),
      limit: 1,
      sort_by: 'entry_date',
      sort_order: 'desc',
    } : undefined
  );
  const { data: nextEntryData } = useEntryList(
    entry ? {
      date_from: getNextDay(entry.entry_date),
      limit: 1,
      sort_by: 'entry_date',
      sort_order: 'asc',
    } : undefined
  );

  const prevEntry = prevEntryData?.items[0];
  const nextEntry = nextEntryData?.items[0];

  const [isEditingScore, setIsEditingScore] = useState(false);
  const [editScore, setEditScore] = useState(5);
  const [editJustification, setEditJustification] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <p className="text-[var(--color-muted-foreground)]">Loading...</p>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <p className="text-[var(--color-muted-foreground)]">Entry not found.</p>
      </div>
    );
  }

  function handleEditScore() {
    setEditScore(entry!.score ?? 5);
    setEditJustification(entry!.score_justification ?? '');
    setIsEditingScore(true);
  }

  function handleSaveScore() {
    updateEntry.mutate(
      {
        id: entry!.id,
        input: {
          score: editScore,
          score_justification: editJustification || undefined,
        },
      },
      {
        onSuccess: () => setIsEditingScore(false),
      }
    );
  }

  function handleDelete() {
    deleteEntry.mutate(entry!.id);
  }

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-5">
      {/* Header */}
      <div className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg p-8 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold mb-1">
            {formatDate(entry.entry_date)}
          </h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            {formatWeekday(entry.entry_date)}
          </p>
        </div>
        {entry.score !== null && (
          <div className="text-center">
            <div className="text-5xl font-light text-[var(--color-primary)] leading-none">
              {entry.score}
            </div>
            <div className="text-xs text-[var(--color-muted-foreground)] uppercase tracking-wider mt-1">
              Wellbeing
            </div>
            {stats?.avg_score_30_day != null && (
              <div className="text-xs text-[var(--color-muted-foreground)] mt-1">
                {entry.score > stats.avg_score_30_day
                  ? `${(entry.score - stats.avg_score_30_day).toFixed(1)} above`
                  : entry.score < stats.avg_score_30_day
                    ? `${(stats.avg_score_30_day - entry.score).toFixed(1)} below`
                    : 'At'}{' '}
                your 30-day avg
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg p-8 shadow-sm space-y-8">
        {entry.tldr && (
          <div className="bg-[var(--color-muted)] border-l-3 border-[var(--color-primary)] p-5 rounded-r-md">
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted-foreground)] mb-1">
              TL;DR
            </div>
            <p className="font-medium">{entry.tldr}</p>
          </div>
        )}

        <div>
          <h2 className="text-sm font-medium mb-3">Your Entry</h2>
          <div className="font-serif text-base leading-[1.8] whitespace-pre-wrap">
            {entry.refined_entry ?? entry.raw_entry}
          </div>
        </div>

        {entry.key_moments && entry.key_moments.length > 0 && (
          <div>
            <h2 className="text-sm font-medium mb-3">Key Moments</h2>
            <ul className="space-y-2">
              {entry.key_moments.map((moment, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm leading-relaxed"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] mt-1.5 shrink-0" />
                  {moment}
                </li>
              ))}
            </ul>
          </div>
        )}

        {entry.score_justification && (
          <div className="bg-[var(--color-muted)] p-5 rounded-md">
            <div className="text-sm font-medium text-[var(--color-muted-foreground)] mb-1">
              Why this score
            </div>
            <p className="leading-relaxed">{entry.score_justification}</p>
          </div>
        )}
      </div>

      {/* Score editing */}
      {isEditingScore && (
        <div className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg p-8 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Edit Score</h2>
          <ScoreSlider
            value={editScore}
            onChange={setEditScore}
            justification={editJustification}
            onJustificationChange={setEditJustification}
          />
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="secondary"
              onClick={() => setIsEditingScore(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveScore} disabled={updateEntry.isPending}>
              {updateEntry.isPending ? 'Saving...' : 'Save Score'}
            </Button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg px-8 py-4 shadow-sm flex justify-between items-center">
        <div className="flex gap-5">
          <button
            onClick={handleEditScore}
            className="text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-destructive)] transition-colors"
          >
            Delete
          </button>
        </div>
        <Link to="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>

      {/* Entry metadata */}
      {(entry.token_count != null || entry.estimated_cost != null) && (
        <div className="flex flex-wrap gap-4 text-xs text-[var(--color-muted-foreground)]">
          {entry.input_method && (
            <span>Input: {entry.input_method}</span>
          )}
          {entry.token_count != null && (
            <span>Tokens: {entry.token_count.toLocaleString()}</span>
          )}
          {entry.estimated_cost != null && (
            <span>Est. cost: ${entry.estimated_cost.toFixed(4)}</span>
          )}
        </div>
      )}

      {/* Previous/Next navigation */}
      <div className="flex justify-between items-center">
        {prevEntry ? (
          <Link
            to={`/entries/${prevEntry.id}`}
            className="text-sm text-[var(--color-primary)] hover:underline"
          >
            &larr; {formatDate(prevEntry.entry_date)}
          </Link>
        ) : (
          <span />
        )}
        {nextEntry ? (
          <Link
            to={`/entries/${nextEntry.id}`}
            className="text-sm text-[var(--color-primary)] hover:underline"
          >
            {formatDate(nextEntry.entry_date)} &rarr;
          </Link>
        ) : (
          <span />
        )}
      </div>

      {/* Delete dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogTitle>Delete this entry?</DialogTitle>
        <DialogDescription>
          This action cannot be undone. This will permanently delete your entry.
        </DialogDescription>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteDialog(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteEntry.isPending}
          >
            {deleteEntry.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default EntryDetailPage;
