import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function RequireAuth() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function RedirectIfAuthed() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}

/** Gates the Admin Dashboard. This is a UX convenience only — it hides the
 * admin UI and redirects non-admins away, so people don't stumble onto a
 * dashboard that will fail to load their data. It is NOT the security
 * boundary: every Firestore read/write the admin pages perform is enforced
 * server-side by firestore.rules' isAdmin() check, so a user who bypasses
 * this component (e.g. by editing client code) still cannot read or write
 * admin-only data — Firestore itself will reject it regardless of what the
 * UI does. */
export function RequireAdmin() {
  const { user, userData, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (userData?.role !== 'admin') return <Navigate to="/" replace />;
  return <Outlet />;
}
