import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEntry } from '@hooks/useEntries';
import {
  useStartConversation,
  useSendMessage,
  useGenerateSummary,
  useFinalizeSummary,
} from '@hooks/useConversation';
import { ChatInterface } from '@components/chat/ChatInterface';
import { Button } from '@components/ui/button';
import { ScoreSlider } from '@components/ui/slider';
import { Alert } from '@components/ui/alert';
import type { AISummaryResult } from 'shared/types';

type Phase = 'conversation' | 'generating' | 'review';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function RefinePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: entry, isLoading: entryLoading } = useEntry(id);

  const startConversation = useStartConversation();
  const sendMessage = useSendMessage();
  const generateSummary = useGenerateSummary();
  const finalizeSummary = useFinalizeSummary();

  const [phase, setPhase] = useState<Phase>('conversation');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isDone, setIsDone] = useState(false);
  const [summary, setSummary] = useState<AISummaryResult | null>(null);
  const [score, setScore] = useState(5);
  const [justification, setJustification] = useState('');
  const [error, setError] = useState('');
  const [conversationStarted, setConversationStarted] = useState(false);

  // Start the conversation when entry loads
  const doStart = useCallback(() => {
    if (!id || conversationStarted) return;
    setConversationStarted(true);
    startConversation.mutate(id, {
      onSuccess: (result) => {
        setMessages([{ role: 'assistant', content: result.message }]);
        if (result.is_done) {
          setIsDone(true);
        }
      },
      onError: () => {
        setError('Failed to start conversation. Please try again.');
      },
    });
  }, [id, conversationStarted, startConversation]);

  useEffect(() => {
    if (entry && !conversationStarted) {
      doStart();
    }
  }, [entry, conversationStarted, doStart]);

  function handleSend(message: string) {
    if (!id) return;
    setMessages((prev) => [...prev, { role: 'user', content: message }]);

    sendMessage.mutate(
      { entryId: id, message },
      {
        onSuccess: (result) => {
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: result.message },
          ]);
          if (result.is_done) {
            setIsDone(true);
          }
        },
        onError: () => {
          setError('Failed to send message. Please try again.');
        },
      }
    );
  }

  function handleGenerateSummary() {
    if (!id) return;
    setPhase('generating');
    setError('');

    generateSummary.mutate(id, {
      onSuccess: (result) => {
        setSummary(result.summary);
        setScore(result.summary.ai_suggested_score);
        setJustification(result.summary.score_justification);
        setPhase('review');
      },
      onError: () => {
        setError('Failed to generate summary. Please try again.');
        setPhase('conversation');
      },
    });
  }

  function handleFinalize() {
    if (!id) return;
    setError('');

    finalizeSummary.mutate(
      { entryId: id, score, scoreJustification: justification },
      {
        onSuccess: () => {
          navigate(`/entry-saved/${id}`);
        },
        onError: () => {
          setError('Failed to save summary. Please try again.');
        },
      }
    );
  }

  function handleSkip() {
    navigate(`/entries/${id}`);
  }

  if (entryLoading) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <p className="text-[var(--color-muted-foreground)]">Loading...</p>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <p className="text-[var(--color-muted-foreground)]">Entry not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-4">
      {error && <Alert variant="destructive">{error}</Alert>}

      {/* Conversation Phase */}
      {phase === 'conversation' && (
        <div className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg shadow-sm overflow-hidden">
          <div className="border-b border-[var(--color-border)] px-6 py-4">
            <h2 className="text-lg font-semibold">Reflect on your day</h2>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Have a brief conversation to explore your thoughts
            </p>
          </div>

          <div className="h-[400px]">
            <ChatInterface
              messages={messages}
              onSend={handleSend}
              isLoading={startConversation.isPending || sendMessage.isPending}
              isDone={isDone}
            />
          </div>

          {isDone && (
            <div className="border-t border-[var(--color-border)] px-6 py-4 flex justify-between">
              <Button variant="secondary" onClick={handleSkip}>
                Skip Summary
              </Button>
              <Button onClick={handleGenerateSummary}>
                Generate Summary
              </Button>
            </div>
          )}

          {!isDone && messages.length > 0 && (
            <div className="border-t border-[var(--color-border)] px-6 py-3 flex justify-end">
              <Button variant="ghost" size="sm" onClick={handleGenerateSummary}>
                End conversation & summarize
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Generating Phase */}
      {phase === 'generating' && (
        <div className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg p-12 text-center shadow-sm">
          <div className="text-lg font-semibold mb-2">Generating your summary...</div>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Analyzing your conversation and writing a thoughtful reflection
          </p>
        </div>
      )}

      {/* Review Phase */}
      {phase === 'review' && summary && (
        <div className="space-y-4">
          <div className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg p-8 shadow-sm space-y-6">
            <h2 className="text-lg font-semibold">Review Your Summary</h2>

            <div className="bg-[var(--color-muted)] border-l-3 border-[var(--color-primary)] p-5 rounded-r-md">
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted-foreground)] mb-1">
                TL;DR
              </div>
              <p className="font-medium">{summary.tldr}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3">Refined Entry</h3>
              <div className="font-serif text-base leading-[1.8] whitespace-pre-wrap">
                {summary.refined_entry}
              </div>
            </div>

            {summary.key_moments.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3">Key Moments</h3>
                <ul className="space-y-2">
                  {summary.key_moments.map((moment, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm leading-relaxed"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] mt-1.5 shrink-0" />
                      {moment}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg p-8 shadow-sm">
            <h3 className="text-sm font-medium mb-4">
              Adjust your score (AI suggested: {summary.ai_suggested_score}/10)
            </h3>
            <ScoreSlider
              value={score}
              onChange={setScore}
              justification={justification}
              onJustificationChange={setJustification}
            />
          </div>

          <div className="flex justify-between">
            <Button variant="secondary" onClick={handleSkip}>
              Discard Summary
            </Button>
            <Button
              onClick={handleFinalize}
              disabled={finalizeSummary.isPending}
            >
              {finalizeSummary.isPending ? 'Saving...' : 'Save Entry'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RefinePage;
