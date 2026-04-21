import { useState, useEffect, useCallback } from 'react';
import { useAuthStore, usePermissions } from '../../store/authStore';
import { getUsers, changeUserRole, suspendUser, reactivateUser } from '../../services/api/admin';
import { AuthApiError } from '../../services/api/auth';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { RoleBadge } from '../../components/admin/RoleBadge';
import { Pagination } from '../../components/admin/Pagination';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import type { AdminUser, UserFilters } from '../../types/admin';
import type { UserRole } from '../../types/auth';
import '../../components/admin/Admin.css';

const ALL_ROLES: UserRole[] = ['admin', 'manager', 'employee', 'viewer'];

export const UsersPage = () => {
  const { user: currentUser } = useAuthStore();
  const { hasRole, isReadOnlyUser } = usePermissions();
  const isAdmin = hasRole(['admin']);

  const [filters, setFilters] = useState<UserFilters>({
    email: '',
    role: '',
    status: '',
    page: 1,
    pageSize: 20,
  });

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loadState, setLoadState] = useState<'loading' | 'ok' | 'error'>('loading');

  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<AdminUser | null>(null);
  const [reactivateTarget, setReactivateTarget] = useState<AdminUser | null>(null);

  const [roleTarget, setRoleTarget] = useState<AdminUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('employee');
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleError, setRoleError] = useState('');

  const load = useCallback(async () => {
    if (isReadOnlyUser) {
      setUsers([]);
      setTotal(0);
      setLoadState('ok');
      return;
    }

    setLoadState('loading');
    try {
      const res = await getUsers(filters);
      setUsers(res.data.items);
      setTotal(res.data.total);
      setLoadState('ok');
    } catch {
      setLoadState('error');
    }
  }, [filters, isReadOnlyUser]);

  useEffect(() => {
    load();
  }, [load]);

  const setFilter = (key: keyof UserFilters, value: UserFilters[keyof UserFilters]) => {
    if (isReadOnlyUser) return;
    setFilters((prev) => ({ ...prev, [key]: value, ...(key !== 'pageSize' ? { page: 1 } : {}) }));
  };

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSuspendConfirm = async () => {
    if (isReadOnlyUser || !suspendTarget) return;

    setActionLoading((prev) => ({ ...prev, [suspendTarget.id]: true }));
    try {
      await suspendUser(suspendTarget.id);
      showToast('تم إيقاف المستخدم بنجاح', 'success');
      setSuspendTarget(null);
      load();
    } catch (error) {
      showToast(error instanceof AuthApiError ? error.message : 'حدث خطأ', 'error');
      setSuspendTarget(null);
    } finally {
      setActionLoading((prev) => ({ ...prev, [suspendTarget.id]: false }));
    }
  };

  const handleReactivateConfirm = async () => {
    if (isReadOnlyUser || !reactivateTarget) return;

    setActionLoading((prev) => ({ ...prev, [reactivateTarget.id]: true }));
    try {
      await reactivateUser(reactivateTarget.id);
      showToast('تم تفعيل المستخدم بنجاح', 'success');
      setReactivateTarget(null);
      load();
    } catch (error) {
      showToast(error instanceof AuthApiError ? error.message : 'حدث خطأ', 'error');
      setReactivateTarget(null);
    } finally {
      setActionLoading((prev) => ({ ...prev, [reactivateTarget.id]: false }));
    }
  };

  const openRoleModal = (targetUser: AdminUser) => {
    if (isReadOnlyUser) return;

    setRoleTarget(targetUser);
    setSelectedRole(targetUser.role);
    setRoleError('');
  };

  const handleRoleChange = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isReadOnlyUser || !roleTarget) return;

    if (selectedRole === roleTarget.role) {
      setRoleTarget(null);
      return;
    }

    setRoleLoading(true);
    setRoleError('');
    try {
      await changeUserRole(roleTarget.id, selectedRole);
      showToast('تم تغيير الدور بنجاح', 'success');
      setRoleTarget(null);
      load();
    } catch (error) {
      setRoleError(error instanceof AuthApiError ? error.message : 'حدث خطأ أثناء تغيير الدور');
    } finally {
      setRoleLoading(false);
    }
  };

  const canActOnUser = (target: AdminUser) => {
    if (isAdmin) return true;
    return target.role !== 'admin';
  };

  const availableRoles = isAdmin ? ALL_ROLES : (['manager', 'employee', 'viewer'] as UserRole[]);

  return (
    <div>
      <div className="admin-action-bar">
        <h2 className="admin-page-title">إدارة المستخدمين</h2>
      </div>

      <div className="admin-filter-bar">
        <div className="admin-filter-group">
          <label className="admin-filter-label">البريد الإلكتروني</label>
          <input
            className="admin-filter-input"
            placeholder="ابحث بالبريد..."
            value={filters.email}
            onChange={(e) => setFilter('email', e.target.value)}
            dir="ltr"
            disabled={isReadOnlyUser}
            title={isReadOnlyUser ? 'وضع مشاهدة فقط' : ''}
          />
        </div>
        <div className="admin-filter-group">
          <label className="admin-filter-label">الدور</label>
          <select
            className="admin-filter-select"
            value={filters.role}
            onChange={(e) => setFilter('role', e.target.value as UserRole | '')}
            disabled={isReadOnlyUser}
            title={isReadOnlyUser ? 'وضع مشاهدة فقط' : ''}
          >
            <option value="">الكل</option>
            {ALL_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-filter-group">
          <label className="admin-filter-label">الحالة</label>
          <select
            className="admin-filter-select"
            value={filters.status}
            onChange={(e) => setFilter('status', e.target.value as 'active' | 'suspended' | '')}
            disabled={isReadOnlyUser}
            title={isReadOnlyUser ? 'وضع مشاهدة فقط' : ''}
          >
            <option value="">الكل</option>
            <option value="active">نشط</option>
            <option value="suspended">موقوف</option>
          </select>
        </div>
        <div className="admin-filter-group">
          <label className="admin-filter-label">عناصر الصفحة</label>
          <select
            className="admin-filter-select"
            value={filters.pageSize}
            onChange={(e) => setFilter('pageSize', Number(e.target.value) as UserFilters['pageSize'])}
            disabled={isReadOnlyUser}
            title={isReadOnlyUser ? 'وضع مشاهدة فقط' : ''}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {loadState === 'loading' && (
        <div className="admin-state-screen">
          <div className="admin-state-icon">⏳</div>
          <p className="admin-state-title">جاري التحميل...</p>
        </div>
      )}

      {loadState === 'error' && (
        <div className="admin-state-screen">
          <div className="admin-state-icon">⚠️</div>
          <p className="admin-state-title">فشل تحميل المستخدمين</p>
          <button
            className="admin-btn admin-btn-primary"
            style={{ marginTop: '1rem' }}
            onClick={load}
            disabled={isReadOnlyUser}
            title={isReadOnlyUser ? 'وضع مشاهدة فقط' : ''}
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {loadState === 'ok' && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <colgroup>
              <col style={{ width: '20%' }} />
              <col style={{ width: '22%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '180px' }} />
            </colgroup>
            <thead>
              <tr>
                <th>الاسم</th>
                <th>البريد الإلكتروني</th>
                <th>الدور</th>
                <th>الحالة</th>
                <th>أنشئ في</th>
                <th className="col-actions">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
                    لا توجد نتائج مطابقة
                  </td>
                </tr>
              ) : (
                users.map((userRow) => {
                  const loading = actionLoading[userRow.id];
                  const canAct = canActOnUser(userRow);
                  const isSelf = userRow.id === currentUser?.id;
                  const readOnlyTitle = isReadOnlyUser ? 'وضع مشاهدة فقط' : '';

                  return (
                    <tr key={userRow.id}>
                      <td>
                        <span className="admin-truncate" title={userRow.fullName}>
                          {userRow.fullName}
                        </span>
                      </td>
                      <td>
                        <span className="admin-truncate" title={userRow.email} dir="ltr">
                          {userRow.email}
                        </span>
                      </td>
                      <td>
                        <RoleBadge role={userRow.role} />
                      </td>
                      <td>
                        <StatusBadge status={userRow.status} />
                      </td>
                      <td>{new Date(userRow.createdAt).toLocaleDateString('ar-EG')}</td>
                      <td className="col-actions">
                        <button
                          className="admin-btn admin-btn-ghost"
                          style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', marginLeft: '0.3rem' }}
                          onClick={() => openRoleModal(userRow)}
                          disabled={isReadOnlyUser || !canAct || loading || isSelf}
                          title={readOnlyTitle || (!canAct ? 'لا يمكن تعديل مشرف' : isSelf ? 'لا يمكنك تعديل نفسك' : '')}
                        >
                          تغيير الدور
                        </button>
                        {userRow.status === 'active' ? (
                          <button
                            className="admin-btn admin-btn-danger"
                            style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
                            onClick={() => setSuspendTarget(userRow)}
                            disabled={isReadOnlyUser || !canAct || loading || isSelf}
                            title={readOnlyTitle || (!canAct ? 'لا يمكن إيقاف مشرف' : '')}
                          >
                            إيقاف
                          </button>
                        ) : (
                          <button
                            className="admin-btn admin-btn-ghost"
                            style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
                            onClick={() => setReactivateTarget(userRow)}
                            disabled={isReadOnlyUser || !canAct || loading}
                            title={readOnlyTitle}
                          >
                            تفعيل
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <Pagination
            page={filters.page}
            pageSize={filters.pageSize}
            total={total}
            disabled={isReadOnlyUser}
            onPageChange={(newPage) => setFilters((prev) => ({ ...prev, page: newPage }))}
          />
        </div>
      )}

      {suspendTarget && !isReadOnlyUser && (
        <ConfirmDialog
          title="تأكيد إيقاف المستخدم"
          body={`هل أنت متأكد من إيقاف "${suspendTarget.fullName}"؟ سيفقد صلاحية الدخول فورًا.`}
          confirmLabel="نعم، إيقاف"
          isDanger
          isLoading={!!actionLoading[suspendTarget.id]}
          onConfirm={handleSuspendConfirm}
          onCancel={() => setSuspendTarget(null)}
        />
      )}

      {reactivateTarget && !isReadOnlyUser && (
        <ConfirmDialog
          title="تأكيد إعادة تفعيل المستخدم"
          body={`هل تريد إعادة تفعيل "${reactivateTarget.fullName}"؟`}
          confirmLabel="نعم، تفعيل"
          isLoading={!!actionLoading[reactivateTarget.id]}
          onConfirm={handleReactivateConfirm}
          onCancel={() => setReactivateTarget(null)}
        />
      )}

      {roleTarget && !isReadOnlyUser && (
        <div className="admin-modal-overlay" onClick={() => setRoleTarget(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="admin-modal-title">تغيير دور المستخدم</h2>
            <p className="admin-modal-body">
              تغيير دور <strong>{roleTarget.fullName}</strong> من <strong>{roleTarget.role}</strong> إلى:
            </p>
            {roleError && <div className="admin-error-inline" style={{ marginBottom: '1rem' }}>{roleError}</div>}
            <form onSubmit={handleRoleChange}>
              <select
                className="admin-modal-select"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                style={{ marginBottom: '1.5rem' }}
              >
                {availableRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-ghost"
                  onClick={() => setRoleTarget(null)}
                  disabled={roleLoading}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={roleLoading || selectedRole === roleTarget.role}
                  title={selectedRole === roleTarget.role ? 'الدور نفسه محدد حاليًا' : ''}
                >
                  {roleLoading ? 'جاري التغيير...' : 'تأكيد التغيير'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className="admin-toast-container">
          <div className={`admin-toast ${toast.type}`}>{toast.msg}</div>
        </div>
      )}
    </div>
  );
};
