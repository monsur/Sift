import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useTheme } from '@hooks/useTheme';
import { Button } from '@components/ui/button';
import { cn } from '@lib/utils';

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const { pathname } = useLocation();
  const isActive = pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        'text-sm transition-colors',
        isActive
          ? 'text-[var(--color-primary)] font-medium'
          : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
      )}
    >
      {children}
    </Link>
  );
}

function Layout() {
  const { user, logout } = useAuth();
  useTheme();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--color-border)] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-lg font-semibold">
            Sift
          </Link>
          <nav className="flex items-center gap-4">
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/new-entry">New Entry</NavLink>
            <NavLink to="/history">History</NavLink>
            <NavLink to="/settings">Settings</NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[var(--color-muted-foreground)]">
            {user?.email}
          </span>
          <Button variant="ghost" size="sm" onClick={logout}>
            Log out
          </Button>
        </div>
      </header>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}

export { Layout };
