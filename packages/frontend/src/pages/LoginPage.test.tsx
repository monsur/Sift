import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from './LoginPage';

const mockLogin = vi.fn();
const mockResendVerification = vi.fn();

vi.mock('@hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
    resendVerification: mockResendVerification,
    isLoading: false,
  }),
}));

vi.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form', () => {
    render(<LoginPage />);
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log In' })).toBeInTheDocument();
  });

  it('calls login with valid input', async () => {
    mockLogin.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Log In' }));

    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('shows resend button when email not verified', async () => {
    const error = new Error('Email not verified') as Error & { code?: string };
    error.code = 'EMAIL_NOT_VERIFIED';
    mockLogin.mockRejectedValue(error);

    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Log In' }));

    expect(
      screen.getByText('Resend verification email')
    ).toBeInTheDocument();
  });

  it('shows rate limit message', async () => {
    const error = new Error('Too many requests') as Error & { code?: string };
    error.code = 'RATE_LIMIT_EXCEEDED';
    mockLogin.mockRejectedValue(error);

    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Log In' }));

    expect(screen.getByText('Please try again later.')).toBeInTheDocument();
  });
});
