import { Link } from 'react-router-dom';
import { Button } from '@components/ui/button';

function EmptyState() {
  return (
    <div className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg p-12 md:p-16 text-center shadow-sm">
      <div className="text-6xl mb-6 opacity-50">&#x270D;&#xFE0F;</div>
      <h1 className="text-3xl font-semibold mb-4">Welcome to Sift</h1>
      <p className="text-[var(--color-muted-foreground)] text-lg leading-relaxed max-w-xl mx-auto mb-8">
        A daily reflection tool that helps you understand your emotional
        wellbeing over time. Start by writing about your day, and we&apos;ll
        help you notice patterns and gain perspective.
      </p>
      <Link to="/new-entry">
        <Button size="lg" className="px-10 py-3 text-base mb-10">
          Write Your First Entry
        </Button>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mt-12">
        <div className="bg-[var(--color-muted)] p-5 rounded-md">
          <h3 className="font-medium mb-2">Daily Reflection</h3>
          <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
            Write freely about your day, your feelings, and what&apos;s on your
            mind. The AI can help you explore deeper if you choose.
          </p>
        </div>
        <div className="bg-[var(--color-muted)] p-5 rounded-md">
          <h3 className="font-medium mb-2">Track Patterns</h3>
          <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
            See your wellbeing scores over time and identify trends that help
            you understand what affects your mood.
          </p>
        </div>
        <div className="bg-[var(--color-muted)] p-5 rounded-md">
          <h3 className="font-medium mb-2">Gain Perspective</h3>
          <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
            Humans catastrophize bad days and romanticize good ones. Sift helps
            you see the fuller picture.
          </p>
        </div>
      </div>

      <div className="border-l-3 border-[var(--color-primary)] bg-[var(--color-muted)] p-5 rounded-r-md text-left mt-8">
        <h4 className="font-medium mb-1">Important to know</h4>
        <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
          Sift is a reflection and self-awareness tool, not therapy or mental
          health treatment. If you&apos;re experiencing a crisis or need
          professional support, please reach out to a mental health professional
          or crisis service.
        </p>
      </div>
    </div>
  );
}

export { EmptyState };
