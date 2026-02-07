import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NewEntryPage from './NewEntryPage';

const mockNavigate = vi.fn();
const mockMutate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@hooks/useEntries', () => ({
  useCreateEntry: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}));

describe('NewEntryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the entry form', () => {
    render(<NewEntryPage />);
    expect(screen.getByText('How was your day?')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Start writing...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('shows validation error for empty entry', async () => {
    const user = userEvent.setup();
    render(<NewEntryPage />);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByText('Entry cannot be empty')).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('submits valid entry', async () => {
    const user = userEvent.setup();
    render(<NewEntryPage />);

    await user.type(
      screen.getByPlaceholderText('Start writing...'),
      'Today was great'
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(mockMutate).toHaveBeenCalled();
  });

  it('navigates on cancel', async () => {
    const user = userEvent.setup();
    render(<NewEntryPage />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});
