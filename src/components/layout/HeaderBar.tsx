import { useAuthStore } from '../../store/authStore';

export const HeaderBar = () => {
  const { user, logout } = useAuthStore();

  return (
    <header className="shell-header">
      <div className="shell-header-left">
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
