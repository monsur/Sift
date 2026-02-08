import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from './DashboardPage';

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

const { mockUseDashboardStats, mockUseEntryList } = vi.hoisted(() => ({
  mockUseDashboardStats: vi.fn(),
  mockUseEntryList: vi.fn(),
}));

vi.mock('@hooks/useDashboard', () => ({
  useDashboardStats: mockUseDashboardStats,
}));

vi.mock('@hooks/useEntries', () => ({
  useEntryList: mockUseEntryList,
}));

// Mock ScoreChart since it uses its own hooks internally
vi.mock('@components/dashboard/ScoreChart', () => ({
  ScoreChart: () => <div data-testid="score-chart">Score Chart</div>,
}));

const mockStats = {
  total_entries: 10,
  current_streak: 3,
  longest_streak: 5,
  avg_score_7_day: 7.5,
  avg_score_30_day: 6.8,
  avg_score_all_time: 6.5,
  score_distribution: [{ score: 7, count: 5 }],
  score_trend: 'up' as const,
  last_entry_date: '2026-01-15',
};

const mockEntry = {
  id: 'entry-1',
  user_id: 'user-123',
  entry_date: '2026-01-15',
  raw_entry: 'Good day.',
  refined_entry: null,
  tldr: 'Had a good day',
  key_moments: null,
  score: 7,
  ai_suggested_score: null,
  score_justification: null,
  input_method: 'text' as const,
  voice_duration_seconds: null,
  conversation_transcript: null,
  token_count: null,
  estimated_cost: null,
  created_at: '2026-01-15T00:00:00Z',
  updated_at: '2026-01-15T00:00:00Z',
};

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state', () => {
    mockUseDashboardStats.mockReturnValue({ data: undefined, isLoading: true });
    mockUseEntryList.mockReturnValue({ data: undefined, isLoading: true });

    renderPage();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows empty state when no entries', () => {
    mockUseDashboardStats.mockReturnValue({
      data: { ...mockStats, total_entries: 0 },
      isLoading: false,
    });
    mockUseEntryList.mockReturnValue({
      data: { items: [], total: 0, page: 1, limit: 5, hasMore: false },
      isLoading: false,
    });

    renderPage();
    expect(screen.getByText(/Welcome to Sift/i)).toBeInTheDocument();
  });

  it('renders stats cards and dashboard content', () => {
    mockUseDashboardStats.mockReturnValue({ data: mockStats, isLoading: false });
    mockUseEntryList.mockReturnValue({
      data: { items: [mockEntry], total: 1, page: 1, limit: 5, hasMore: false },
      isLoading: false,
    });

    renderPage();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument(); // total entries
    expect(screen.getByText('3 days')).toBeInTheDocument(); // current streak
    expect(screen.getByText('7.5')).toBeInTheDocument(); // 7-day avg
    expect(screen.getByText('6.8')).toBeInTheDocument(); // 30-day avg
    expect(screen.getByText('Trending up')).toBeInTheDocument();
    expect(screen.getByTestId('score-chart')).toBeInTheDocument();
    expect(screen.getByText('Had a good day')).toBeInTheDocument(); // recent entry
  });

  it('shows write entry button', () => {
    mockUseDashboardStats.mockReturnValue({ data: mockStats, isLoading: false });
    mockUseEntryList.mockReturnValue({
      data: { items: [mockEntry], total: 1, page: 1, limit: 5, hasMore: false },
      isLoading: false,
    });

    renderPage();
    expect(screen.getByText("Write Today's Entry")).toBeInTheDocument();
  });
});
