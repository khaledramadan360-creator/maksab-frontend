import { useAuthStore } from '../../store/authStore';
interface HeaderBarProps {
  isSidebarOpen: boolean;
  onMenuToggle: () => void;
}

export const HeaderBar = ({ isSidebarOpen, onMenuToggle }: HeaderBarProps) => {
  const { user, logout } = useAuthStore();

  return (
    <header className="shell-header">
      <div className="shell-header-left">
        <button
          type="button"
          className="shell-menu-btn"
          onClick={onMenuToggle}
          aria-label={isSidebarOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
          aria-expanded={isSidebarOpen}
        >
          <span className="shell-menu-line" />
          <span className="shell-menu-line" />
          <span className="shell-menu-line" />
        </button>
        <h1 className="shell-header-title">برنامج بحث مكسب</h1>
      </div>
      <div className="shell-header-right">
        <span className="shell-user-name">{user?.email}</span>
        <button
          className="shell-logout-btn"
          onClick={() => logout()}
        >
          تسجيل خروج
        </button>
      </div>
    </header>
  );
};
