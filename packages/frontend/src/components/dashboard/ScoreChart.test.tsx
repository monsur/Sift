import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ScoreChart } from './ScoreChart';

const { mockUseDashboardTimeline } = vi.hoisted(() => ({
  mockUseDashboardTimeline: vi.fn(),
}));

vi.mock('@hooks/useDashboard', () => ({
  useDashboardTimeline: mockUseDashboardTimeline,
}));

// Mock Recharts to avoid SVG rendering issues in jsdom
vi.mock('recharts', () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="chart-line" />,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('ScoreChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state', () => {
    mockUseDashboardTimeline.mockReturnValue({ data: undefined, isLoading: true });

    render(<ScoreChart />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows empty state when no data', () => {
    mockUseDashboardTimeline.mockReturnValue({
      data: { data_points: [], period: 'month' },
      isLoading: false,
    });

    render(<ScoreChart />);
    expect(screen.getByText('No data for this period')).toBeInTheDocument();
  });

  it('renders chart with data', () => {
    mockUseDashboardTimeline.mockReturnValue({
      data: {
        data_points: [
          { entry_date: '2026-01-10', score: 7, entry_id: 'e1' },
          { entry_date: '2026-01-11', score: 8, entry_id: 'e2' },
        ],
        period: 'month',
      },
      isLoading: false,
    });

    render(<ScoreChart />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('renders period selector buttons', () => {
    mockUseDashboardTimeline.mockReturnValue({
      data: { data_points: [], period: 'month' },
      isLoading: false,
    });

    render(<ScoreChart />);
    expect(screen.getByText('7D')).toBeInTheDocument();
    expect(screen.getByText('1M')).toBeInTheDocument();
    expect(screen.getByText('3M')).toBeInTheDocument();
    expect(screen.getByText('1Y')).toBeInTheDocument();
    expect(screen.getByText('All')).toBeInTheDocument();
  });

  it('switches period when button clicked', async () => {
    mockUseDashboardTimeline.mockReturnValue({
      data: { data_points: [], period: 'month' },
      isLoading: false,
    });

    render(<ScoreChart />);
    const user = userEvent.setup();
    await user.click(screen.getByText('7D'));

    expect(mockUseDashboardTimeline).toHaveBeenCalledWith('week');
  });
});
