import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { UserPermissions } from '@/types/user';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: keyof UserPermissions;
}

export function ProtectedRoute({ children, requiredPermission }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasPermission } = useUser();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-kiosk-bg flex items-center justify-center">
        <div className="animate-pulse text-kiosk-text/70">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
