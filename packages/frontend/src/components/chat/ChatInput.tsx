import { type FormEvent, useState } from 'react';
import { Button } from '@components/ui/button';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [message, setMessage] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setMessage('');
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={placeholder ?? 'Type your reply...'}
        disabled={disabled}
        className="flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] disabled:opacity-50"
      />
      <Button type="submit" disabled={disabled || !message.trim()} size="default">
        Send
      </Button>
    </form>
  );
}

export { ChatInput };
