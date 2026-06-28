import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore, usePermissions } from '../../store/authStore';

const roleLabels: Record<string, string> = {
  admin: 'مشرف',
  manager: 'مدير',
  employee: 'موظف',
  viewer: 'مشاهد',
};

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar = ({ isOpen = false, onClose }: SidebarProps) => {
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
  const isClientEmailTrackingRoute = pathname.startsWith('/client-email-tracking');
  const isMarketingSeasonsRoute = pathname.startsWith('/marketing-seasons');
  const isSystemSettingsRoute = pathname.startsWith('/admin/system-settings');
  const isInvitesRoute = pathname.startsWith('/admin/invites');
  const isUsersRoute = pathname.startsWith('/admin/users');
  const isEmailModuleRoute = isClientEmailCampaignsRoute || isClientEmailTrackingRoute;
  const isSettingsRoute = isMarketingSeasonsRoute || isSystemSettingsRoute;
  const isAuthManagementRoute = isInvitesRoute || isUsersRoute;
  const [isEmailExpanded, setIsEmailExpanded] = useState(isEmailModuleRoute);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(isSettingsRoute);
  const [isAuthManagementExpanded, setIsAuthManagementExpanded] =
    useState(isAuthManagementRoute);

  useEffect(() => {
    if (isEmailModuleRoute) {
      setIsEmailExpanded(true);
    }
  }, [isEmailModuleRoute]);

  useEffect(() => {
    if (isSettingsRoute) {
      setIsSettingsExpanded(true);
    }
  }, [isSettingsRoute]);

  useEffect(() => {
    if (isAuthManagementRoute) {
      setIsAuthManagementExpanded(true);
    }
  }, [isAuthManagementRoute]);

  const initials =
    user?.fullName
      ?.split(' ')
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase() ?? '?';

  return (
    <aside className={`shell-sidebar${isOpen ? ' mobile-open' : ''}`}>
      <div className="shell-sidebar-brand">
        <div className="shell-sidebar-brand-main">
          <img src="/logo.png" alt="لوجو مكسب" className="shell-brand-logo" />
          <div>
            <div className="shell-brand-text">مكسب</div>
            <div className="shell-brand-sub">نظام إدارة الصلاحيات</div>
          </div>
        </div>
        <button
          type="button"
          className="shell-sidebar-close"
          onClick={onClose}
          aria-label="إغلاق القائمة الجانبية"
        >
          ×
        </button>
      </div>

      <nav className="shell-nav">
        <span className="shell-nav-section-label">الرئيسية</span>

        <NavLink
          to="/home"
          className={({ isActive }) => `shell-nav-link${isActive ? ' active' : ''}`}
          onClick={onClose}
        >
          <span className="shell-nav-icon">🏠</span>
          لوحة التحكم
        </NavLink>

        <NavLink
          to="/lead-search"
          className={({ isActive }) => `shell-nav-link${isActive ? ' active' : ''}`}
          onClick={onClose}
        >
          <span className="shell-nav-icon">🔍</span>
          البحث عن العملاء
        </NavLink>

        <NavLink
          to="/clients"
          className={() => `shell-nav-link${isClientsLinkActive ? ' active' : ''}`}
          onClick={onClose}
        >
          <span className="shell-nav-icon">🗂️</span>
          العملاء
        </NavLink>

        <NavLink
          to="/reports"
          className={({ isActive }) => `shell-nav-link${isActive ? ' active' : ''}`}
          onClick={onClose}
        >
          <span className="shell-nav-icon">📄</span>
          التقارير
        </NavLink>

        <div className={`shell-nav-group${isEmailModuleRoute ? ' active' : ''}`}>
          <button
            type="button"
            className={`shell-nav-link shell-nav-group-trigger${isEmailModuleRoute ? ' active' : ''}`}
            onClick={() => setIsEmailExpanded((current) => !current)}
            aria-expanded={isEmailExpanded}
          >
            <span className="shell-nav-icon">✉️</span>
            <span className="shell-nav-group-label">البريد</span>
            <span className={`shell-nav-caret${isEmailExpanded ? ' expanded' : ''}`}>⌄</span>
          </button>

          {isEmailExpanded && (
            <div className="shell-nav-submenu">
              <NavLink
                to="/client-email-campaigns"
                className={() =>
                  `shell-nav-link shell-nav-sublink${isClientEmailCampaignsRoute ? ' active' : ''}`
                }
                onClick={onClose}
              >
                <span className="shell-nav-icon">✉️</span>
                حملات البريد الإلكتروني
              </NavLink>

              <NavLink
                to="/client-email-tracking"
                className={() =>
                  `shell-nav-link shell-nav-sublink${isClientEmailTrackingRoute ? ' active' : ''}`
                }
                onClick={onClose}
              >
                <span className="shell-nav-icon">📬</span>
                تتبع البريد الإلكتروني
              </NavLink>
            </div>
          )}
        </div>

        {canViewTeamOverview && (
          <NavLink
            to="/clients/team-overview"
            className={({ isActive }) => `shell-nav-link${isActive ? ' active' : ''}`}
            end
            onClick={onClose}
          >
            <span className="shell-nav-icon">📊</span>
            نظرة الفريق
          </NavLink>
        )}

        <div className={`shell-nav-group${isSettingsRoute ? ' active' : ''}`}>
          <button
            type="button"
            className={`shell-nav-link shell-nav-group-trigger${isSettingsRoute ? ' active' : ''}`}
            onClick={() => setIsSettingsExpanded((current) => !current)}
            aria-expanded={isSettingsExpanded}
          >
            <span className="shell-nav-icon">⚙️</span>
            <span className="shell-nav-group-label">الإعدادات</span>
            <span className={`shell-nav-caret${isSettingsExpanded ? ' expanded' : ''}`}>⌄</span>
          </button>

          {isSettingsExpanded && (
            <div className="shell-nav-submenu">
              <NavLink
                to="/marketing-seasons"
                className={() =>
                  `shell-nav-link shell-nav-sublink${isMarketingSeasonsRoute ? ' active' : ''}`
                }
                onClick={onClose}
              >
                <span className="shell-nav-icon">📅</span>
                المواسم التسويقية
              </NavLink>

              {isAdminOrManager && (
                <NavLink
                  to="/admin/system-settings"
                  className={() =>
                    `shell-nav-link shell-nav-sublink${isSystemSettingsRoute ? ' active' : ''}`
                  }
                  onClick={onClose}
                >
                  <span className="shell-nav-icon">⚙️</span>
                  إعدادات النظام
                </NavLink>
              )}
            </div>
          )}
        </div>

        {canViewAdminModules && (
          <div className={`shell-nav-group${isAuthManagementRoute ? ' active' : ''}`}>
            <button
              type="button"
              className={`shell-nav-link shell-nav-group-trigger${isAuthManagementRoute ? ' active' : ''}`}
              onClick={() => setIsAuthManagementExpanded((current) => !current)}
              aria-expanded={isAuthManagementExpanded}
            >
              <span className="shell-nav-icon">🔐</span>
              <span className="shell-nav-group-label">إدارة المصادقة</span>
              <span className={`shell-nav-caret${isAuthManagementExpanded ? ' expanded' : ''}`}>⌄</span>
            </button>

            {isAuthManagementExpanded && (
              <div className="shell-nav-submenu">
                <NavLink
                  to="/admin/invites"
                  className={() =>
                    `shell-nav-link shell-nav-sublink${isInvitesRoute ? ' active' : ''}`
                  }
                  onClick={onClose}
                >
                  <span className="shell-nav-icon">✉️</span>
                  الدعوات
                </NavLink>
                <NavLink
                  to="/admin/users"
                  className={() =>
                    `shell-nav-link shell-nav-sublink${isUsersRoute ? ' active' : ''}`
                  }
                  onClick={onClose}
                >
                  <span className="shell-nav-icon">👥</span>
                  المستخدمون
                </NavLink>
              </div>
            )}
          </div>
        )}

        {canViewAuditModule && (
          <>
            <span className="shell-nav-section-label">التدقيق</span>
            <NavLink
              to="/admin/audit"
              className={({ isActive }) => `shell-nav-link${isActive ? ' active' : ''}`}
              onClick={onClose}
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
