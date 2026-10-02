import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { homeForRole, useAuth } from '../context/auth-context';
import { PageLoader } from './ui/Spinner';
import type { UserRole } from '../types';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole: UserRole;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader label="Vérification…" />;

  if (!user) return <Navigate to="/auth" state={{ from: location.pathname }} replace />;

  if (role === 'disabled' || role === null) {
    return <Navigate to="/auth" state={{ error: role === 'disabled' ? 'disabled' : 'unauthorized' }} replace />;
  }

  // Un client qui tente /admin va sur son espace, et inversement.
  if (role !== requiredRole) return <Navigate to={homeForRole(role)} replace />;

  return <>{children}</>;
}
