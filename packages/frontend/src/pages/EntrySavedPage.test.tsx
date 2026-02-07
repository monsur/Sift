import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import EntrySavedPage from './EntrySavedPage';

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: 'entry-1' }),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

const mockUseEntry = vi.fn();

vi.mock('@hooks/useEntries', () => ({
  useEntry: (...args: unknown[]) => mockUseEntry(...args),
}));

describe('EntrySavedPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state', () => {
    mockUseEntry.mockReturnValue({ data: undefined, isLoading: true });
    render(<EntrySavedPage />);
    expect(screen.getByText('Entry Saved')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows entry date when loaded', () => {
    mockUseEntry.mockReturnValue({
      data: {
        id: 'entry-1',
        entry_date: '2026-01-15',
      },
      isLoading: false,
    });
    render(<EntrySavedPage />);

    expect(screen.getByText('Entry Saved')).toBeInTheDocument();
    expect(screen.getByText('January 15, 2026')).toBeInTheDocument();
    expect(screen.getByText('Back to Dashboard')).toBeInTheDocument();
  });

  it('shows streak section', () => {
    mockUseEntry.mockReturnValue({
      data: { id: 'entry-1', entry_date: '2026-01-15' },
      isLoading: false,
    });
    render(<EntrySavedPage />);

    expect(screen.getByText('Days in a row')).toBeInTheDocument();
  });
});
