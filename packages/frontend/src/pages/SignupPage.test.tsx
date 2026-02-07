import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignupPage from './SignupPage';

const mockSignup = vi.fn();

vi.mock('@hooks/useAuth', () => ({
  useAuth: () => ({
    signup: mockSignup,
    isLoading: false,
  }),
}));

vi.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

describe('SignupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders signup form', () => {
    render(<SignupPage />);
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
  });

  it('shows validation error for weak password', async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'weak');
    await user.click(screen.getByRole('button', { name: 'Sign Up' }));

    expect(
      screen.getByText(/Password must be at least 12 characters/)
    ).toBeInTheDocument();
    expect(mockSignup).not.toHaveBeenCalled();
  });

  it('calls signup with valid input', async () => {
    mockSignup.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<SignupPage />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'SecurePass123!');
    await user.click(screen.getByRole('button', { name: 'Sign Up' }));

    expect(mockSignup).toHaveBeenCalledWith(
      'test@example.com',
      'SecurePass123!'
    );
  });

  it('shows error on signup failure', async () => {
    mockSignup.mockRejectedValue(new Error('Email already registered'));
    const user = userEvent.setup();
    render(<SignupPage />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'SecurePass123!');
    await user.click(screen.getByRole('button', { name: 'Sign Up' }));

    expect(
      screen.getByText('Email already registered')
    ).toBeInTheDocument();
  });

  it('shows password strength indicator', async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    await user.type(screen.getByLabelText('Password'), 'SecurePass123!');
    expect(screen.getByText('Strong')).toBeInTheDocument();
  });
});
