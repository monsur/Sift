import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInterface } from './ChatInterface';

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

describe('ChatInterface', () => {
  const messages = [
    { role: 'assistant' as const, content: 'How was your day?' },
    { role: 'user' as const, content: 'It was great!' },
  ];

  it('renders messages', () => {
    render(
      <ChatInterface
        messages={messages}
        onSend={vi.fn()}
        isLoading={false}
        isDone={false}
      />
    );

    expect(screen.getByText('How was your day?')).toBeInTheDocument();
    expect(screen.getByText('It was great!')).toBeInTheDocument();
  });

  it('shows loading indicator when isLoading is true', () => {
    render(
      <ChatInterface
        messages={messages}
        onSend={vi.fn()}
        isLoading={true}
        isDone={false}
      />
    );

    expect(screen.getByText('Thinking...')).toBeInTheDocument();
  });

  it('hides input when isDone is true', () => {
    render(
      <ChatInterface
        messages={messages}
        onSend={vi.fn()}
        isLoading={false}
        isDone={true}
      />
    );

    expect(screen.queryByPlaceholderText('Type your reply...')).not.toBeInTheDocument();
  });

  it('shows input when isDone is false', () => {
    render(
      <ChatInterface
        messages={messages}
        onSend={vi.fn()}
        isLoading={false}
        isDone={false}
      />
    );

    expect(screen.getByPlaceholderText('Type your reply...')).toBeInTheDocument();
  });

  it('calls onSend when user submits a message', async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();

    render(
      <ChatInterface
        messages={messages}
        onSend={onSend}
        isLoading={false}
        isDone={false}
      />
    );

    await user.type(screen.getByPlaceholderText('Type your reply...'), 'Hello');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(onSend).toHaveBeenCalledWith('Hello');
  });

  it('does not send empty messages', async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();

    render(
      <ChatInterface
        messages={messages}
        onSend={onSend}
        isLoading={false}
        isDone={false}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Send' }));
    expect(onSend).not.toHaveBeenCalled();
  });
});
