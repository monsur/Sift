import { cn } from '@lib/utils';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-lg px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
            : 'bg-[var(--color-muted)] text-[var(--color-foreground)]'
        )}
      >
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}

export { ChatMessage };
