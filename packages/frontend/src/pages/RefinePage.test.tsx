import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import RefinePage from './RefinePage';

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

const mockNavigate = vi.fn();
const mockStartMutate = vi.fn();
const mockSendMutate = vi.fn();
const mockGenerateMutate = vi.fn();
const mockFinalizeMutate = vi.fn();

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: 'entry-1' }),
  useNavigate: () => mockNavigate,
}));

vi.mock('@hooks/useEntries', () => ({
  useEntry: () => ({
    data: {
      id: 'entry-1',
      raw_entry: 'Today was good',
      entry_date: '2026-01-15',
    },
    isLoading: false,
  }),
}));

vi.mock('@hooks/useConversation', () => ({
  useStartConversation: () => ({
    mutate: mockStartMutate,
    isPending: false,
  }),
  useSendMessage: () => ({
    mutate: mockSendMutate,
    isPending: false,
  }),
  useGenerateSummary: () => ({
    mutate: mockGenerateMutate,
    isPending: false,
  }),
  useFinalizeSummary: () => ({
    mutate: mockFinalizeMutate,
    isPending: false,
  }),
}));

describe('RefinePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the conversation header', () => {
    render(<RefinePage />);
    expect(screen.getByText('Reflect on your day')).toBeInTheDocument();
  });

  it('starts conversation when entry is loaded', () => {
    render(<RefinePage />);
    expect(mockStartMutate).toHaveBeenCalledWith('entry-1', expect.any(Object));
  });

  it('shows the chat input area', () => {
    render(<RefinePage />);
    expect(screen.getByPlaceholderText('Type your reply...')).toBeInTheDocument();
  });
});
