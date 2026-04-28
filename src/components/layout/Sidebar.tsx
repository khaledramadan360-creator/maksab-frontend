import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore, usePermissions } from '../../store/authStore';

const roleLabels: Record<string, string> = {
  admin: 'مشرف',
  manager: 'مدير',
  employee: 'موظف',
  viewer: 'مشاهد',
};

export const Sidebar = () => {
  const { user } = useAuthStore();
  const { hasRole, isReadOnlyUser } = usePermissions();
  const { pathname } = useLocation();

  const isAdminOrManager = hasRole(['admin', 'manager']);
  const isAdminOnly = hasRole(['admin']);
  const canViewAdminModules = isAdminOrManager || isReadOnlyUser;
  const canViewAuditModule = isAdminOnly || isReadOnlyUser;
  const canViewTeamOverview = isAdminOrManager || isReadOnlyUser;
  const isTeamOverviewRoute = pathname.startsWith('/clients/team-overview');
  const isClientsRoute = pathname === '/clients' || pathname.startsWith('/clients/');
  const isClientsLinkActive = isClientsRoute && !isTeamOverviewRoute;
  const isClientEmailCampaignsRoute = pathname.startsWith('/client-email-campaigns');

  const initials =
    user?.fullName
      ?.split(' ')
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase() ?? '?';

  return (
    <aside className="shell-sidebar">
      <div className="shell-sidebar-brand">
        <div className="shell-brand-dot" />
        <div>
          <div className="shell-brand-text">مكسب</div>
          <div className="shell-brand-sub">نظام إدارة الصلاحيات</div>
        </div>
      </div>

      <nav className="shell-nav">
        <span className="shell-nav-section-label">الرئيسية</span>

        <NavLink
          to="/home"
          className={({ isActive }) => `shell-nav-link${isActive ? ' active' : ''}`}
        >
          <span className="shell-nav-icon">🏠</span>
          لوحة التحكم
        </NavLink>

        <NavLink
          to="/lead-search"
          className={({ isActive }) => `shell-nav-link${isActive ? ' active' : ''}`}
        >
          <span className="shell-nav-icon">🔍</span>
          البحث عن العملاء
        </NavLink>

        <NavLink
          to="/clients"
          className={() => `shell-nav-link${isClientsLinkActive ? ' active' : ''}`}
        >
          <span className="shell-nav-icon">🗂️</span>
          العملاء
        </NavLink>

        <NavLink
          to="/reports"
          className={({ isActive }) => `shell-nav-link${isActive ? ' active' : ''}`}
        >
          <span className="shell-nav-icon">📄</span>
          التقارير
        </NavLink>

        <NavLink
          to="/client-email-campaigns"
          className={() =>
            `shell-nav-link${isClientEmailCampaignsRoute ? ' active' : ''}`
          }
        >
          <span className="shell-nav-icon">✉️</span>
          حملات البريد الإلكتروني
        </NavLink>

        {canViewTeamOverview && (
          <NavLink
            to="/clients/team-overview"
            className={({ isActive }) => `shell-nav-link${isActive ? ' active' : ''}`}
            end
          >
            <span className="shell-nav-icon">📊</span>
            نظرة الفريق
          </NavLink>
        )}

        <span className="shell-nav-section-label">الإعدادات</span>
        <NavLink
          to="/marketing-seasons"
          className={({ isActive }) => `shell-nav-link${isActive ? ' active' : ''}`}
        >
          <span className="shell-nav-icon">📅</span>
          المواسم التسويقية
        </NavLink>

        {isAdminOrManager && (
          <NavLink
            to="/admin/system-settings"
            className={({ isActive }) => `shell-nav-link${isActive ? ' active' : ''}`}
          >
            <span className="shell-nav-icon">⚙️</span>
            إعدادات النظام
          </NavLink>
        )}

        {canViewAdminModules && (
          <>
            <span className="shell-nav-section-label">إدارة المصادقة</span>
            <NavLink
              to="/admin/invites"
              className={({ isActive }) => `shell-nav-link${isActive ? ' active' : ''}`}
            >
              <span className="shell-nav-icon">✉️</span>
              الدعوات
            </NavLink>
            <NavLink
              to="/admin/users"
              className={({ isActive }) => `shell-nav-link${isActive ? ' active' : ''}`}
            >
              <span className="shell-nav-icon">👥</span>
              المستخدمون
            </NavLink>
          </>
        )}

        {canViewAuditModule && (
          <>
            <span className="shell-nav-section-label">التدقيق</span>
            <NavLink
              to="/admin/audit"
              className={({ isActive }) => `shell-nav-link${isActive ? ' active' : ''}`}
            >
              <span className="shell-nav-icon">📋</span>
              سجلات التدقيق
            </NavLink>
          </>
        )}
      </nav>

      <div className="shell-sidebar-footer">
        <div className="shell-user-tile">
          <div className="shell-user-avatar">{initials}</div>
          <div className="shell-user-info">
            <div className="shell-user-fullname">{user?.fullName}</div>
            <div className="shell-user-role">
              {roleLabels[user?.role ?? ''] ?? user?.role}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
