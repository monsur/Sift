import { Link } from 'react-router-dom';
import { Button } from '@components/ui/button';

function DashboardPlaceholder() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg p-8 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold mb-1">
              Your Wellbeing Overview
            </h2>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Trends and insights coming soon.
            </p>
          </div>
          <Link to="/new-entry">
            <Button size="lg" className="shadow-md">
              Write Today&apos;s Entry
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DashboardPlaceholder;
