import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { HeaderBar } from './HeaderBar';
import { usePermissions } from '../../store/authStore';
import '../layout/Shell.css';

interface AppShellProps {
  children: ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => {
  const { isReadOnlyUser } = usePermissions();

  return (
    <div className="shell-root">
      <Sidebar />
      <HeaderBar />
      <main className="shell-main">
        <div className="shell-main-inner">
          {isReadOnlyUser && (
            <div className="shell-readonly-banner" role="status" aria-live="polite">
              أنت في وضع المشاهدة فقط. يمكنك استعراض النظام لكن لا يمكنك تنفيذ أي إجراء.
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
};
