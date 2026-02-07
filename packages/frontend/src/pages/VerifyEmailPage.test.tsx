import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import VerifyEmailPage from './VerifyEmailPage';

const mockVerifyEmail = vi.fn();

vi.mock('@hooks/useAuth', () => ({
  useAuth: () => ({
    verifyEmail: mockVerifyEmail,
  }),
}));

let mockSearchParams = new URLSearchParams('token=valid-token');

vi.mock('react-router-dom', () => ({
  useSearchParams: () => [mockSearchParams],
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams('token=valid-token');
  });

  it('shows loading state initially', () => {
    mockVerifyEmail.mockReturnValue(new Promise(() => {})); // Never resolves
    render(<VerifyEmailPage />);
    expect(screen.getByText('Verifying your email...')).toBeInTheDocument();
  });

  it('shows success on valid token', async () => {
    mockVerifyEmail.mockResolvedValue(undefined);
    render(<VerifyEmailPage />);

    await waitFor(() => {
      expect(
        screen.getByText('Your email has been verified successfully!')
      ).toBeInTheDocument();
    });
  });

  it('shows error on invalid token', async () => {
    mockVerifyEmail.mockRejectedValue(new Error('Invalid token'));
    render(<VerifyEmailPage />);

    await waitFor(() => {
      expect(screen.getByText('Invalid token')).toBeInTheDocument();
    });
  });

  it('shows error when token is missing', () => {
    mockSearchParams = new URLSearchParams('');
    render(<VerifyEmailPage />);

    expect(
      screen.getByText('Missing verification token')
    ).toBeInTheDocument();
  });
});
