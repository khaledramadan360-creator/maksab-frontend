import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { HeaderBar } from './HeaderBar';
import { usePermissions } from '../../store/authStore';
import '../layout/Shell.css';

interface AppShellProps {
  children: ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => {
  const { isReadOnlyUser } = usePermissions();
  const { pathname } = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isSidebarOpen) return undefined;

    const originalOverflow = document.body.style.overflow;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSidebarOpen(false);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isSidebarOpen]);

  return (
    <div className={`shell-root${isSidebarOpen ? ' sidebar-open' : ''}`}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <HeaderBar
        isSidebarOpen={isSidebarOpen}
        onMenuToggle={() => setIsSidebarOpen((current) => !current)}
      />
      {isSidebarOpen && (
        <button
          type="button"
          className="shell-sidebar-backdrop"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="إغلاق القائمة الجانبية"
        />
      )}
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
