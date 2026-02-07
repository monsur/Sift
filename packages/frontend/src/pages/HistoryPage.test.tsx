import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import HistoryPage from './HistoryPage';

vi.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

const mockUseEntryList = vi.fn();

vi.mock('@hooks/useEntries', () => ({
  useEntryList: (...args: unknown[]) => mockUseEntryList(...args),
}));

const mockEntry = {
  id: 'entry-1',
  user_id: 'user-123',
  entry_date: '2026-01-15',
  raw_entry: 'A good day.',
  refined_entry: null,
  tldr: null,
  key_moments: null,
  score: 7,
  ai_suggested_score: null,
  score_justification: null,
  input_method: 'text',
  voice_duration_seconds: null,
  conversation_transcript: null,
  token_count: null,
  estimated_cost: null,
  created_at: '2026-01-15T00:00:00Z',
  updated_at: '2026-01-15T00:00:00Z',
};

describe('HistoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state', () => {
    mockUseEntryList.mockReturnValue({ data: undefined, isLoading: true });
    render(<HistoryPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows empty state when no entries', () => {
    mockUseEntryList.mockReturnValue({
      data: { items: [], total: 0, page: 1, limit: 20, hasMore: false },
      isLoading: false,
    });
    render(<HistoryPage />);
    expect(screen.getByText('Welcome to Sift')).toBeInTheDocument();
    expect(screen.getByText('Write Your First Entry')).toBeInTheDocument();
  });

  it('renders entry cards', () => {
    mockUseEntryList.mockReturnValue({
      data: {
        items: [mockEntry],
        total: 1,
        page: 1,
        limit: 20,
        hasMore: false,
      },
      isLoading: false,
    });
    render(<HistoryPage />);
    expect(screen.getByText('Your Entries')).toBeInTheDocument();
    expect(screen.getByText('A good day.')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });
});
