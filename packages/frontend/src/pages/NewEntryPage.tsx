import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateEntry } from '@hooks/useEntries';
import { EntryForm } from '@components/entries/EntryForm';
import type { AxiosError } from 'axios';

function NewEntryPage() {
  const navigate = useNavigate();
  const createEntry = useCreateEntry();
  const [error, setError] = useState('');

  function handleSubmit(data: {
    entry_date: string;
    raw_entry: string;
    score?: number;
    input_method: 'text' | 'voice';
  }) {
    setError('');
    createEntry.mutate(data, {
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

  return (
    <div className="max-w-3xl mx-auto">
      <EntryForm
        onSubmit={handleSubmit}
        onCancel={() => navigate('/dashboard')}
        isSubmitting={createEntry.isPending}
        error={error}
      />
    </div>
  );
}

export default NewEntryPage;
