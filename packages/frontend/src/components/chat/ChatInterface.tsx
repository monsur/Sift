import { useRef, useEffect } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSend: (message: string) => void;
  isLoading: boolean;
  isDone: boolean;
}

function ChatInterface({ messages, onSend, isLoading, isDone }: ChatInterfaceProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-3 p-4">
        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} content={msg.content} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[var(--color-muted)] rounded-lg px-4 py-3 text-sm text-[var(--color-muted-foreground)]">
              Thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      {!isDone && (
        <div className="border-t border-[var(--color-border)] p-4">
          <ChatInput onSend={onSend} disabled={isLoading} />
        </div>
      )}
    </div>
  );
}

export { ChatInterface };
