import { useState, useEffect, useCallback } from 'react';
import { usePermissions } from '../../store/authStore';
import { getInvites, sendInvite, resendInvite, revokeInvite } from '../../services/api/admin';
import { AuthApiError } from '../../services/api/auth';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { RoleBadge } from '../../components/admin/RoleBadge';
import { Pagination } from '../../components/admin/Pagination';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import type { Invite, InviteFilters, SendInvitePayload } from '../../types/admin';
import type { UserRole } from '../../types/auth';
import '../../components/admin/Admin.css';

const MANAGEABLE_ROLES: UserRole[] = ['manager', 'employee', 'viewer'];
const ALL_ROLES: UserRole[] = ['admin', 'manager', 'employee', 'viewer'];

export const InvitesPage = () => {
  const { hasRole, isReadOnlyUser } = usePermissions();
  const isAdmin = hasRole(['admin']);

  const [filters, setFilters] = useState<InviteFilters>({
    email: '',
    role: '',
    status: '',
    page: 1,
    pageSize: 20,
  });

  const [invites, setInvites] = useState<Invite[]>([]);
  const [total, setTotal] = useState(0);
  const [loadState, setLoadState] = useState<'loading' | 'ok' | 'error'>('loading');

  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<Invite | null>(null);

  const [sendModal, setSendModal] = useState(false);
  const [sendForm, setSendForm] = useState<SendInvitePayload>({ email: '', role: 'employee' });
  const [sendLoading, setSendLoading] = useState(false);
  const [sendError, setSendError] = useState('');

  const load = useCallback(async () => {
    if (isReadOnlyUser) {
      setInvites([]);
      setTotal(0);
      setLoadState('ok');
      return;
    }

    setLoadState('loading');
    try {
      const res = await getInvites(filters);
      setInvites(res.data.items);
      setTotal(res.data.total);
      setLoadState('ok');
    } catch {
      setLoadState('error');
    }
  }, [filters, isReadOnlyUser]);

  useEffect(() => {
    load();
  }, [load]);

  const setFilter = (key: keyof InviteFilters, value: InviteFilters[keyof InviteFilters]) => {
    if (isReadOnlyUser) return;
    setFilters((prev) => ({ ...prev, [key]: value, ...(key !== 'pageSize' ? { page: 1 } : {}) }));
  };

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleResend = async (invite: Invite) => {
    if (isReadOnlyUser) return;

    setActionLoading((prev) => ({ ...prev, [invite.id]: true }));
    try {
      await resendInvite(invite.id);
      showToast('تم إعادة إرسال الدعوة بنجاح', 'success');
      load();
    } catch (error) {
      const message = error instanceof AuthApiError ? error.message : 'حدث خطأ';
      showToast(message, 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, [invite.id]: false }));
    }
  };

  const handleRevokeConfirm = async () => {
    if (isReadOnlyUser || !revokeTarget) return;

    setActionLoading((prev) => ({ ...prev, [revokeTarget.id]: true }));
    try {
      await revokeInvite(revokeTarget.id);
      showToast('تم إلغاء الدعوة بنجاح', 'success');
      setRevokeTarget(null);
      load();
    } catch (error) {
      const message = error instanceof AuthApiError ? error.message : 'حدث خطأ';
      showToast(message, 'error');
      setRevokeTarget(null);
    } finally {
      setActionLoading((prev) => ({ ...prev, [revokeTarget.id]: false }));
    }
  };

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isReadOnlyUser) return;

    setSendLoading(true);
    setSendError('');
    try {
      await sendInvite(sendForm);
      showToast('تم إرسال الدعوة بنجاح', 'success');
      setSendModal(false);
      setSendForm({ email: '', role: 'employee' });
      load();
    } catch (error) {
      const message = error instanceof AuthApiError ? error.message : 'حدث خطأ أثناء إرسال الدعوة';
      setSendError(message);
    } finally {
      setSendLoading(false);
    }
  };

  const allowedRolesForSend = isAdmin ? ALL_ROLES : MANAGEABLE_ROLES;
  const readOnlyTitle = isReadOnlyUser ? 'وضع مشاهدة فقط' : '';

  return (
    <div>
      <div className="admin-action-bar">
        <h2 className="admin-page-title">إدارة الدعوات</h2>
        <button
          className="admin-btn admin-btn-primary"
          onClick={() => setSendModal(true)}
          disabled={isReadOnlyUser}
          title={readOnlyTitle}
        >
          + إرسال دعوة جديدة
        </button>
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
            title={readOnlyTitle}
          />
        </div>
        <div className="admin-filter-group">
          <label className="admin-filter-label">الدور</label>
          <select
            className="admin-filter-select"
            value={filters.role}
            onChange={(e) => setFilter('role', e.target.value as UserRole | '')}
            disabled={isReadOnlyUser}
            title={readOnlyTitle}
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
            onChange={(e) => setFilter('status', e.target.value as Invite['status'] | '')}
            disabled={isReadOnlyUser}
            title={readOnlyTitle}
          >
            <option value="">الكل</option>
            <option value="pending">معلق</option>
            <option value="accepted">مقبول</option>
            <option value="expired">منتهي</option>
            <option value="revoked">ملغي</option>
          </select>
        </div>
        <div className="admin-filter-group">
          <label className="admin-filter-label">عناصر الصفحة</label>
          <select
            className="admin-filter-select"
            value={filters.pageSize}
            onChange={(e) => setFilter('pageSize', Number(e.target.value) as InviteFilters['pageSize'])}
            disabled={isReadOnlyUser}
            title={readOnlyTitle}
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
          <p className="admin-state-title">فشل تحميل الدعوات</p>
          <p className="admin-state-sub">يرجى المحاولة مجددًا</p>
          <button
            className="admin-btn admin-btn-primary"
            style={{ marginTop: '1rem' }}
            onClick={load}
            disabled={isReadOnlyUser}
            title={readOnlyTitle}
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {loadState === 'ok' && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <colgroup>
              <col style={{ width: '22%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '180px' }} />
            </colgroup>
            <thead>
              <tr>
                <th>البريد الإلكتروني</th>
                <th>الدور</th>
                <th>الحالة</th>
                <th>ينتهي في</th>
                <th>أنشئت في</th>
                <th className="col-actions">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {invites.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
                    {Object.values(filters).some((value) => value !== '' && value !== 1 && value !== 20)
                      ? 'لا توجد نتائج مطابقة للفلاتر'
                      : 'لا توجد دعوات حتى الآن'}
                  </td>
                </tr>
              ) : (
                invites.map((invite) => {
                  const loading = actionLoading[invite.id];
                  const isPending = invite.status === 'pending';

                  return (
                    <tr key={invite.id}>
                      <td>
                        <span className="admin-truncate" title={invite.email}>
                          {invite.email}
                        </span>
                      </td>
                      <td>
                        <RoleBadge role={invite.role} />
                      </td>
                      <td>
                        <StatusBadge status={invite.status} />
                      </td>
                      <td>{new Date(invite.expiresAt).toLocaleDateString('ar-EG')}</td>
                      <td>{new Date(invite.createdAt).toLocaleDateString('ar-EG')}</td>
                      <td className="col-actions">
                        <button
                          className="admin-btn admin-btn-ghost"
                          style={{ fontSize: '0.8rem', padding: '0.35rem 0.7rem', marginLeft: '0.4rem' }}
                          onClick={() => handleResend(invite)}
                          disabled={isReadOnlyUser || !isPending || loading}
                          title={readOnlyTitle || (!isPending ? 'الدعوة غير نشطة' : '')}
                        >
                          إعادة إرسال
                        </button>
                        <button
                          className="admin-btn admin-btn-danger"
                          style={{ fontSize: '0.8rem', padding: '0.35rem 0.7rem' }}
                          onClick={() => setRevokeTarget(invite)}
                          disabled={isReadOnlyUser || !isPending || loading}
                          title={readOnlyTitle || (!isPending ? 'الدعوة غير نشطة' : '')}
                        >
                          إلغاء
                        </button>
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

      {revokeTarget && !isReadOnlyUser && (
        <ConfirmDialog
          title="تأكيد إلغاء الدعوة"
          body={`هل أنت متأكد من إلغاء دعوة البريد "${revokeTarget.email}"؟ لا يمكن التراجع عن هذا الإجراء.`}
          confirmLabel="نعم، إلغاء الدعوة"
          isDanger
          isLoading={!!actionLoading[revokeTarget.id]}
          onConfirm={handleRevokeConfirm}
          onCancel={() => setRevokeTarget(null)}
        />
      )}

      {sendModal && !isReadOnlyUser && (
        <div className="admin-modal-overlay" onClick={() => setSendModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="admin-modal-title">إرسال دعوة جديدة</h2>
            {sendError && <div className="admin-error-inline" style={{ marginBottom: '1rem' }}>{sendError}</div>}
            <form className="admin-modal-form" onSubmit={handleSend}>
              <div>
                <label className="admin-modal-label">البريد الإلكتروني</label>
                <input
                  className="admin-modal-input"
                  type="email"
                  placeholder="email@example.com"
                  dir="ltr"
                  value={sendForm.email}
                  onChange={(e) => setSendForm((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="admin-modal-label">الدور</label>
                <select
                  className="admin-modal-select"
                  value={sendForm.role}
                  onChange={(e) => setSendForm((prev) => ({ ...prev, role: e.target.value as UserRole }))}
                >
                  {allowedRolesForSend.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-ghost"
                  onClick={() => setSendModal(false)}
                  disabled={sendLoading}
                >
                  إلغاء
                </button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={sendLoading || !sendForm.email}>
                  {sendLoading ? 'جاري الإرسال...' : 'إرسال الدعوة'}
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
