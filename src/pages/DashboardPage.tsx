import type { CSSProperties, MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore, usePermissions } from '../store/authStore';
import '../components/layout/Shell.css';
import '../components/admin/Admin.css';

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '1rem',
  alignItems: 'stretch',
};

const cardLinkStyle: CSSProperties = {
  textDecoration: 'none',
  display: 'block',
  height: '100%',
};

const cardBaseStyle: CSSProperties = {
  background: '#fff',
  borderRadius: 10,
  padding: '1.5rem',
  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  transition: 'transform 0.15s',
  cursor: 'pointer',
  minHeight: 188,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
};

const cardTitleStyle: CSSProperties = {
  fontWeight: 700,
  marginBottom: '0.3rem',
  color: 'var(--color-primary-dark)',
};

const cardDescriptionStyle: CSSProperties = {
  fontSize: '0.85rem',
  color: '#888',
  lineHeight: 1.5,
};

const hoverUp = (event: MouseEvent<HTMLDivElement>) => {
  event.currentTarget.style.transform = 'translateY(-2px)';
};

const hoverDown = (event: MouseEvent<HTMLDivElement>) => {
  event.currentTarget.style.transform = 'translateY(0)';
};

export const DashboardPage = () => {
  const { user } = useAuthStore();
  const { hasRole, isReadOnlyUser } = usePermissions();

  const isAdminOrManager = hasRole(['admin', 'manager']);
  const isAdminOnly = hasRole(['admin']);
  const canViewAdminModules = isAdminOrManager || isReadOnlyUser;
  const canViewAuditModule = isAdminOnly || isReadOnlyUser;
  const canViewTeamOverview = isAdminOrManager || isReadOnlyUser;

  return (
    <div style={{ direction: 'rtl' }}>
      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          marginBottom: '0.5rem',
          color: 'var(--color-primary-dark)',
        }}
      >
        مرحباً، {user?.fullName}
      </h2>
      <p style={{ color: '#888', marginBottom: '2rem' }}>
        يمكنك الوصول إلى الأقسام التالية من القائمة الجانبية:
      </p>

      <div style={gridStyle}>
        <Link to="/lead-search" style={cardLinkStyle}>
          <div
            style={{ ...cardBaseStyle, borderTop: '3px solid #16a34a' }}
            onMouseOver={hoverUp}
            onMouseOut={hoverDown}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔎</div>
            <div style={cardTitleStyle}>البحث عن العملاء</div>
            <div style={cardDescriptionStyle}>
              ابحث عن عملاء محتملين حسب المدينة والمنصات.
            </div>
          </div>
        </Link>

        <Link to="/clients" style={cardLinkStyle}>
          <div
            style={{ ...cardBaseStyle, borderTop: '3px solid #0ea5e9' }}
            onMouseOver={hoverUp}
            onMouseOut={hoverDown}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🗂️</div>
            <div style={cardTitleStyle}>العملاء</div>
            <div style={cardDescriptionStyle}>
              عرض العملاء والتفاصيل والتحديثات حسب صلاحيات الدور.
            </div>
          </div>
        </Link>

        <Link to="/reports" style={cardLinkStyle}>
          <div
            style={{ ...cardBaseStyle, borderTop: '3px solid #f59e0b' }}
            onMouseOver={hoverUp}
            onMouseOut={hoverDown}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📄</div>
            <div style={cardTitleStyle}>التقارير</div>
            <div style={cardDescriptionStyle}>
              استعراض التقارير المحفوظة وفتح تقرير كل عميل.
            </div>
          </div>
        </Link>

        {canViewTeamOverview && (
          <Link to="/clients/team-overview" style={cardLinkStyle}>
            <div
              style={{ ...cardBaseStyle, borderTop: '3px solid #0f766e' }}
              onMouseOver={hoverUp}
              onMouseOut={hoverDown}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📊</div>
              <div style={cardTitleStyle}>نظرة الفريق</div>
              <div style={cardDescriptionStyle}>
                متابعة عدد العملاء لكل موظف داخل الفريق.
              </div>
            </div>
          </Link>
        )}

        {canViewAdminModules && (
          <>
            <Link to="/admin/invites" style={cardLinkStyle}>
              <div
                style={{ ...cardBaseStyle, borderTop: '3px solid var(--color-cta)' }}
                onMouseOver={hoverUp}
                onMouseOut={hoverDown}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>✉️</div>
                <div style={cardTitleStyle}>الدعوات</div>
                <div style={cardDescriptionStyle}>إدارة دعوات المستخدمين الجدد.</div>
              </div>
            </Link>

            <Link to="/admin/users" style={cardLinkStyle}>
              <div
                style={{ ...cardBaseStyle, borderTop: '3px solid var(--color-accent-gold)' }}
                onMouseOver={hoverUp}
                onMouseOut={hoverDown}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>👥</div>
                <div style={cardTitleStyle}>المستخدمون</div>
                <div style={cardDescriptionStyle}>عرض وإدارة حسابات النظام.</div>
              </div>
            </Link>
          </>
        )}

        {canViewAuditModule && (
          <Link to="/admin/audit" style={cardLinkStyle}>
            <div
              style={{ ...cardBaseStyle, borderTop: '3px solid var(--color-decorative-blue)' }}
              onMouseOver={hoverUp}
              onMouseOut={hoverDown}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📋</div>
              <div style={cardTitleStyle}>سجلات التدقيق</div>
              <div style={cardDescriptionStyle}>مراجعة سجل الأحداث الكاملة.</div>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
};
