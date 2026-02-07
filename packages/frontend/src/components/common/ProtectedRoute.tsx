import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@stores/authStore';

function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const profile = useAuthStore((s) => s.profile);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (profile && !profile.email_verified) {
    return <Navigate to="/email-sent" replace />;
  }

  return <Outlet />;
}

export { ProtectedRoute };
