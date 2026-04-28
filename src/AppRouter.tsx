import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicRoute } from './components/Guards/PublicRoute';
import { ProtectedRoute } from './components/Guards/ProtectedRoute';
import { RoleProtectedRoute } from './components/Guards/RoleProtectedRoute';
import { AppShell } from './components/layout/AppShell';

// Public Auth Pages
import { Login } from './pages/auth/Login';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { AcceptInvite } from './pages/auth/AcceptInvite';

// Authenticated Pages (wrapped in AppShell)
import { DashboardPage } from './pages/DashboardPage';
import { InvitesPage } from './pages/admin/InvitesPage';
import { UsersPage } from './pages/admin/UsersPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';
import { ClientsListPage } from './features/clients/pages/ClientsListPage';
import { ClientDetailsPage } from './features/clients/pages/ClientDetailsPage';
import { TeamClientsOverviewPage } from './features/clients/pages/TeamClientsOverviewPage';
import { ReportPreviewPage } from './features/reports/pages/ReportPreviewPage';
import { ReportsListPage } from './features/reports/pages/ReportsListPage';
import { ClientEmailCampaignsListPage } from './features/client-email-campaigns/pages/ClientEmailCampaignsListPage';
import { CreateClientEmailCampaignPage } from './features/client-email-campaigns/pages/CreateClientEmailCampaignPage';
import { ClientEmailCampaignDetailsPage } from './features/client-email-campaigns/pages/ClientEmailCampaignDetailsPage';

// Utility Pages
import { ForbiddenPage } from './pages/ForbiddenPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Lead Search
import { LeadSearchPage } from './features/lead-search/pages/LeadSearchPage';

// Marketing Seasons
import { MarketingSeasonsPage } from './features/marketing-seasons/pages/MarketingSeasonsPage';

// System Settings
import { SystemSettingsPage } from './features/system-settings/pages/SystemSettingsPage';

// Helper: wraps a page inside AppShell + ProtectedRoute
const Shell = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <AppShell>{children}</AppShell>
  </ProtectedRoute>
);

// Helper: wraps a page inside AppShell + RoleProtectedRoute
const RoleShell = ({ children, roles }: { children: React.ReactNode; roles: Array<'admin' | 'manager' | 'employee' | 'viewer'> }) => (
  <RoleProtectedRoute allowedRoles={roles}>
    <AppShell>{children}</AppShell>
  </RoleProtectedRoute>
);

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public Auth Routes ──────────────────────────────────────── */}
        <Route path="/login"           element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/reset-password"  element={<PublicRoute><ResetPassword /></PublicRoute>} />
        <Route path="/accept-invite"   element={<PublicRoute><AcceptInvite /></PublicRoute>} />

        {/* ── Authenticated Routes (inside AppShell) ──────────────────── */}
        <Route path="/home" element={<Shell><DashboardPage /></Shell>} />
        <Route path="/lead-search" element={<Shell><LeadSearchPage /></Shell>} />
        <Route path="/clients" element={<Shell><ClientsListPage /></Shell>} />
        <Route path="/clients/team-overview" element={<RoleShell roles={['admin', 'manager', 'viewer']}><TeamClientsOverviewPage /></RoleShell>} />
        <Route path="/clients/:clientId" element={<Shell><ClientDetailsPage /></Shell>} />
        <Route path="/clients/:clientId/report" element={<Shell><ReportPreviewPage /></Shell>} />
        <Route path="/reports" element={<Shell><ReportsListPage /></Shell>} />
        <Route path="/client-email-campaigns" element={<Shell><ClientEmailCampaignsListPage /></Shell>} />
        <Route path="/client-email-campaigns/create" element={<Shell><CreateClientEmailCampaignPage /></Shell>} />
        <Route path="/client-email-campaigns/:campaignId" element={<Shell><ClientEmailCampaignDetailsPage /></Shell>} />
        <Route path="/marketing-seasons" element={<Shell><MarketingSeasonsPage /></Shell>} />

        {/* ── Admin + Manager Routes ──────────────────────────────────── */}
        <Route path="/admin/invites" element={<RoleShell roles={['admin', 'manager', 'viewer']}><InvitesPage /></RoleShell>} />
        <Route path="/admin/users"   element={<RoleShell roles={['admin', 'manager', 'viewer']}><UsersPage /></RoleShell>} />
        <Route path="/admin/system-settings" element={<RoleShell roles={['admin', 'manager', 'viewer']}><SystemSettingsPage /></RoleShell>} />

        {/* ── Admin Only ──────────────────────────────────────────────── */}
        <Route path="/admin/audit" element={<RoleShell roles={['admin', 'viewer']}><AuditLogsPage /></RoleShell>} />

        {/* ── Utility ────────────────────────────────────────────────── */}
        <Route path="/forbidden"   element={<Shell><ForbiddenPage /></Shell>} />
        <Route path="/"            element={<Navigate to="/login" replace />} />
        <Route path="*"            element={<Shell><NotFoundPage /></Shell>} />
      </Routes>
    </BrowserRouter>
  );
};
