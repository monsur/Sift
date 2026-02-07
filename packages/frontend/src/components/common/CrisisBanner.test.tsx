import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CrisisBanner } from './CrisisBanner';

describe('CrisisBanner', () => {
  it('renders crisis resources', () => {
    render(<CrisisBanner onContinue={vi.fn()} onExit={vi.fn()} />);

    expect(
      screen.getByText(/if you're in crisis/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/988 Suicide & Crisis Lifeline/)).toBeInTheDocument();
    expect(screen.getByText(/Crisis Text Line/)).toBeInTheDocument();
    expect(screen.getByText(/Emergency Services/)).toBeInTheDocument();
    expect(screen.getByText(/Call or text: 988/)).toBeInTheDocument();
  });

  it('has alert role for accessibility', () => {
    render(<CrisisBanner onContinue={vi.fn()} onExit={vi.fn()} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('calls onContinue when continue button is clicked', async () => {
    const onContinue = vi.fn();
    const user = userEvent.setup();
    render(<CrisisBanner onContinue={onContinue} onExit={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /continue with entry/i }));
    expect(onContinue).toHaveBeenCalled();
  });

  it('calls onExit when exit button is clicked', async () => {
    const onExit = vi.fn();
    const user = userEvent.setup();
    render(<CrisisBanner onContinue={vi.fn()} onExit={onExit} />);

    await user.click(screen.getByRole('button', { name: /exit to dashboard/i }));
    expect(onExit).toHaveBeenCalled();
  });
});
