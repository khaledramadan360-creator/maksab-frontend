import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import '../../components/layout/Shell.css';

interface Props { children: ReactNode; }

export const PublicRoute = ({ children }: Props) => {
  const { status } = useAuthStore();

  if (status === 'bootstrapping') {
    return (
      <div className="shell-bootstrap">
        <div className="shell-spinner" />
        <p className="shell-bootstrap-text">جاري التحقق من جلستك...</p>
      </div>
    );
  }

  if (status === 'authenticated') {
    // Authenticated user tried to visit login/forgot-password etc. → send to home
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};
