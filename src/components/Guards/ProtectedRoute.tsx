import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import '../../components/layout/Shell.css';

interface Props { children: ReactNode; }

export const ProtectedRoute = ({ children }: Props) => {
  const { status, user } = useAuthStore();
  const location = useLocation();

  if (status === 'bootstrapping') {
    return (
      <div className="shell-bootstrap">
        <div className="shell-spinner" />
        <p className="shell-bootstrap-text">جاري التحقق من جلستك...</p>
      </div>
    );
  }

  // User must be authenticated AND active
  if (status !== 'authenticated' || !user || user.status !== 'active') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
