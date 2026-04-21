import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ProtectedRoute } from './ProtectedRoute';
import { canAccessRoute } from '../../utils/permissions';
import type { UserRole } from '../../types/auth';

interface Props {
  children: ReactNode;
  allowedRoles: UserRole[];
}

export const RoleProtectedRoute = ({ children, allowedRoles }: Props) => {
  const { user, status } = useAuthStore();

  return (
    <ProtectedRoute>
      {status === 'authenticated' && user && canAccessRoute(user.role, allowedRoles) ? (
        <>{children}</>
      ) : (
        // Authenticated but wrong role → 403
        <Navigate to="/forbidden" replace />
      )}
    </ProtectedRoute>
  );
};
