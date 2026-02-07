import { type FormEvent, useState } from 'react';
import { createEntrySchema } from 'shared/schemas';
import { Button } from '@components/ui/button';
import { Textarea } from '@components/ui/textarea';
import { ScoreSlider } from '@components/ui/slider';
import { Alert } from '@components/ui/alert';

interface EntryFormProps {
  onSubmit: (data: {
    entry_date: string;
    raw_entry: string;
    score?: number;
    score_justification?: string;
    input_method: 'text' | 'voice';
  }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  error?: string;
}

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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

function EntryForm({ onSubmit, onCancel, isSubmitting, error }: EntryFormProps) {
  const [entryDate, setEntryDate] = useState(getTodayString);
  const [rawEntry, setRawEntry] = useState('');
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState(5);
  const [justification, setJustification] = useState('');
  const [validationError, setValidationError] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setValidationError('');

    const input = {
      entry_date: entryDate,
      raw_entry: rawEntry,
      input_method: 'text' as const,
      ...(showScore ? { score } : {}),
    };

    const result = createEntrySchema.safeParse(input);
    if (!result.success) {
      setValidationError(result.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    onSubmit({
      ...input,
      ...(showScore && justification
        ? { score_justification: justification }
        : {}),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-[var(--color-background)] p-8 md:p-12 rounded-lg border border-[var(--color-border)] shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[var(--color-muted-foreground)] text-sm">
            {formatDate(entryDate)}
          </span>
          <input
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            className="text-xs text-[var(--color-muted-foreground)] bg-transparent border border-[var(--color-border)] rounded px-2 py-0.5"
          />
        </div>

        <h1 className="text-2xl font-semibold mb-6">How was your day?</h1>

        <div className="border-l-3 border-[var(--color-primary)] bg-[var(--color-muted)] px-5 py-4 rounded-r-md mb-6">
          <h3 className="font-medium text-sm mb-1">What to write about</h3>
          <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
            Share how your day went, how you&apos;re feeling, any highs or lows,
            or whatever is on your mind. There&apos;s no right or wrong way to
            reflect.
          </p>
        </div>

        {(validationError || error) && (
          <Alert variant="destructive" className="mb-4">
            {validationError || error}
          </Alert>
        )}

        <Textarea
          value={rawEntry}
          onChange={(e) => setRawEntry(e.target.value)}
          placeholder="Start writing..."
          className="min-h-[300px] font-serif text-base leading-relaxed"
        />

        <p className="text-sm text-[var(--color-muted-foreground)] mt-2">
          Take your time. Write as much or as little as feels right.
        </p>

        <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showScore}
              onChange={(e) => setShowScore(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm font-medium">
              Add a score to your day
            </span>
          </label>

          {showScore && (
            <div className="mt-6">
              <ScoreSlider
                value={score}
                onChange={setScore}
                justification={justification}
                onJustificationChange={setJustification}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </form>
  );
}

export { EntryForm };
