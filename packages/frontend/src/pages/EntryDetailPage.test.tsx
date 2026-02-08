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
const mockUseEntryList = vi.fn();
const mockUpdateMutate = vi.fn();
const mockDeleteMutate = vi.fn();

vi.mock('@hooks/useEntries', () => ({
  useEntry: (...args: unknown[]) => mockUseEntry(...args),
  useEntryList: (...args: unknown[]) => mockUseEntryList(...args),
  useUpdateEntry: () => ({
    mutate: mockUpdateMutate,
    isPending: false,
  }),
  useDeleteEntry: () => ({
    mutate: mockDeleteMutate,
    isPending: false,
  }),
}));

const { mockUseDashboardStats } = vi.hoisted(() => ({
  mockUseDashboardStats: vi.fn(),
}));

vi.mock('@hooks/useDashboard', () => ({
  useDashboardStats: mockUseDashboardStats,
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
  token_count: 1500,
  estimated_cost: 0.0023,
  created_at: '2026-01-15T00:00:00Z',
  updated_at: '2026-01-15T00:00:00Z',
};

describe('EntryDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDashboardStats.mockReturnValue({ data: undefined });
    mockUseEntryList.mockReturnValue({ data: { items: [] } });
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

  it('shows score context relative to 30-day average', () => {
    mockUseEntry.mockReturnValue({ data: mockEntry, isLoading: false });
    mockUseDashboardStats.mockReturnValue({
      data: { avg_score_30_day: 6.0 },
    });
    render(<EntryDetailPage />);
    expect(screen.getByText(/1\.0 above/)).toBeInTheDocument();
    expect(screen.getByText(/your 30-day avg/)).toBeInTheDocument();
  });

  it('shows token and cost information', () => {
    mockUseEntry.mockReturnValue({ data: mockEntry, isLoading: false });
    render(<EntryDetailPage />);
    expect(screen.getByText(/Tokens: 1,500/)).toBeInTheDocument();
    expect(screen.getByText(/Est\. cost: \$0\.0023/)).toBeInTheDocument();
  });

  it('shows previous/next entry navigation', () => {
    mockUseEntry.mockReturnValue({ data: mockEntry, isLoading: false });
    const prevEntry = { ...mockEntry, id: 'entry-0', entry_date: '2026-01-14' };
    const nextEntry = { ...mockEntry, id: 'entry-2', entry_date: '2026-01-16' };

    let callCount = 0;
    mockUseEntryList.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return { data: { items: [prevEntry] } };
      return { data: { items: [nextEntry] } };
    });

    render(<EntryDetailPage />);
    expect(screen.getByText(/January 14, 2026/)).toBeInTheDocument();
    expect(screen.getByText(/January 16, 2026/)).toBeInTheDocument();
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
