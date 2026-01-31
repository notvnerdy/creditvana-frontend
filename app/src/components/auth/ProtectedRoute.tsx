import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.ts';

interface Props {
  children: React.ReactNode;
  requireKBA?: boolean;
}

/**
 * Wraps routes that require authentication.
 *
 * - If not authenticated → redirect to /login
 * - If authenticated but KBA not passed and requireKBA → redirect to /verify
 */
export default function ProtectedRoute({ children, requireKBA = true }: Props) {
  const { isAuthenticated, kbaPassed } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireKBA && !kbaPassed) {
    return <Navigate to="/verify" replace />;
  }

  return <>{children}</>;
}
