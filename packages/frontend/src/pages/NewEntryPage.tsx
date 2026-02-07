import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateEntry } from '@hooks/useEntries';
import { EntryForm } from '@components/entries/EntryForm';
import type { AxiosError } from 'axios';

function NewEntryPage() {
  const navigate = useNavigate();
  const createEntry = useCreateEntry();
  const [error, setError] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  function handleSubmit(data: {
    entry_date: string;
    raw_entry: string;
    score?: number;
    input_method: 'text' | 'voice';
  }) {
    setError('');
    createEntry.mutate(data, {
      onSuccess: (entry) => {
        navigate(`/entry-saved/${entry.id}`);
      },
      onError: (err) => {
        const axiosErr = err as AxiosError<{
          error?: { message?: string; code?: string };
        }>;
        const code = axiosErr.response?.data?.error?.code;
        if (code === 'DUPLICATE_ENTRY_DATE') {
          setError('You already have an entry for this date. Please choose a different date.');
        } else {
          setError(
            axiosErr.response?.data?.error?.message ?? 'Failed to save entry'
          );
        }
      },
    });
  }

  function handleRefine(data: {
    entry_date: string;
    raw_entry: string;
    input_method: 'text' | 'voice';
  }) {
    setError('');
    setIsRefining(true);

    // First save the entry, then redirect to refine page
    createEntry.mutate(data, {
      onSuccess: (entry) => {
        navigate(`/refine/${entry.id}`);
      },
      onError: (err) => {
        setIsRefining(false);
        const axiosErr = err as AxiosError<{
          error?: { message?: string; code?: string };
        }>;
        const code = axiosErr.response?.data?.error?.code;
        if (code === 'DUPLICATE_ENTRY_DATE') {
          setError('You already have an entry for this date. Please choose a different date.');
        } else {
          setError(
            axiosErr.response?.data?.error?.message ?? 'Failed to save entry'
          );
        }
      },
    });
  }

  return (
    <div className="max-w-3xl mx-auto">
      <EntryForm
        onSubmit={handleSubmit}
        onRefine={handleRefine}
        onCancel={() => navigate('/dashboard')}
        isSubmitting={createEntry.isPending && !isRefining}
        isRefining={isRefining}
        error={error}
      />
    </div>
  );
}

export default NewEntryPage;
