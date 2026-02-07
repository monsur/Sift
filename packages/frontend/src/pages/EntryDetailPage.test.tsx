import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EntryDetailPage from './EntryDetailPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: 'entry-1' }),
  useNavigate: () => mockNavigate,
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

const mockUseEntry = vi.fn();
const mockUpdateMutate = vi.fn();
const mockDeleteMutate = vi.fn();

vi.mock('@hooks/useEntries', () => ({
  useEntry: (...args: unknown[]) => mockUseEntry(...args),
  useUpdateEntry: () => ({
    mutate: mockUpdateMutate,
    isPending: false,
  }),
  useDeleteEntry: () => ({
    mutate: mockDeleteMutate,
    isPending: false,
  }),
}));

const mockEntry = {
  id: 'entry-1',
  user_id: 'user-123',
  entry_date: '2026-01-15',
  raw_entry: 'Today was a good day.',
  refined_entry: null,
  tldr: 'Good day overall.',
  key_moments: ['Fixed a bug', 'Went for a walk'],
  score: 7,
  ai_suggested_score: null,
  score_justification: 'Productive and relaxing.',
  input_method: 'text',
  voice_duration_seconds: null,
  conversation_transcript: null,
  token_count: null,
  estimated_cost: null,
  created_at: '2026-01-15T00:00:00Z',
  updated_at: '2026-01-15T00:00:00Z',
};

describe('EntryDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state', () => {
    mockUseEntry.mockReturnValue({ data: undefined, isLoading: true });
    render(<EntryDetailPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows not found when no entry', () => {
    mockUseEntry.mockReturnValue({ data: undefined, isLoading: false });
    render(<EntryDetailPage />);
    expect(screen.getByText('Entry not found.')).toBeInTheDocument();
  });

  it('renders entry details', () => {
    mockUseEntry.mockReturnValue({ data: mockEntry, isLoading: false });
    render(<EntryDetailPage />);

    expect(screen.getByText('January 15, 2026')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('Good day overall.')).toBeInTheDocument();
    expect(screen.getByText('Today was a good day.')).toBeInTheDocument();
    expect(screen.getByText('Fixed a bug')).toBeInTheDocument();
    expect(screen.getByText('Went for a walk')).toBeInTheDocument();
    expect(screen.getByText('Productive and relaxing.')).toBeInTheDocument();
  });

  it('opens delete confirmation dialog', async () => {
    mockUseEntry.mockReturnValue({ data: mockEntry, isLoading: false });
    const user = userEvent.setup();
    render(<EntryDetailPage />);

    await user.click(screen.getByText('Delete'));

    expect(screen.getByText('Delete this entry?')).toBeInTheDocument();
    expect(
      screen.getByText(
        'This action cannot be undone. This will permanently delete your entry.'
      )
    ).toBeInTheDocument();
  });

  it('opens score editing', async () => {
    mockUseEntry.mockReturnValue({ data: mockEntry, isLoading: false });
    const user = userEvent.setup();
    render(<EntryDetailPage />);

    await user.click(screen.getByText('Edit'));

    expect(screen.getByText('Edit Score')).toBeInTheDocument();
    expect(screen.getByText('Save Score')).toBeInTheDocument();
  });
});
