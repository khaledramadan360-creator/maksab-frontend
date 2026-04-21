import { useState, useEffect, useCallback } from 'react';
import { usePermissions } from '../../store/authStore';
import { getAuditLogs } from '../../services/api/admin';
import { Pagination } from '../../components/admin/Pagination';
import type { AuditLog, AuditLogFilters } from '../../types/admin';
import '../../components/admin/Admin.css';

export const AuditLogsPage = () => {
  const { isReadOnlyUser } = usePermissions();

  const [filters, setFilters] = useState<AuditLogFilters>({
    action: '',
    entityType: '',
    actorUserId: '',
    dateFrom: '',
    dateTo: '',
    page: 1,
    pageSize: 20,
  });

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loadState, setLoadState] = useState<'loading' | 'ok' | 'error'>('loading');

  const load = useCallback(async () => {
    if (isReadOnlyUser) {
      setLogs([]);
      setTotal(0);
      setLoadState('ok');
      return;
    }

    setLoadState('loading');
    try {
      const res = await getAuditLogs(filters);
      setLogs(res.data.items);
      setTotal(res.data.total);
      setLoadState('ok');
    } catch {
      setLoadState('error');
    }
  }, [filters, isReadOnlyUser]);

  useEffect(() => {
    load();
  }, [load]);

  const setFilter = (key: keyof AuditLogFilters, value: AuditLogFilters[keyof AuditLogFilters]) => {
    if (isReadOnlyUser) return;
    setFilters((prev) => ({ ...prev, [key]: value, ...(key !== 'pageSize' ? { page: 1 } : {}) }));
  };

  const readOnlyTitle = isReadOnlyUser ? 'وضع مشاهدة فقط' : '';

  return (
    <div>
      <div className="admin-action-bar">
        <h2 className="admin-page-title">سجلات التدقيق</h2>
      </div>

      <div className="admin-filter-bar">
        <div className="admin-filter-group">
          <label className="admin-filter-label">الحدث (Action)</label>
          <input
            className="admin-filter-input"
            placeholder="مثال: auth.invite.sent"
            value={filters.action}
            onChange={(e) => setFilter('action', e.target.value)}
            dir="ltr"
            disabled={isReadOnlyUser}
            title={readOnlyTitle}
          />
        </div>
        <div className="admin-filter-group">
          <label className="admin-filter-label">نوع الكيان</label>
          <input
            className="admin-filter-input"
            placeholder="مثال: invite"
            value={filters.entityType}
            onChange={(e) => setFilter('entityType', e.target.value)}
            dir="ltr"
            disabled={isReadOnlyUser}
            title={readOnlyTitle}
          />
        </div>
        <div className="admin-filter-group">
          <label className="admin-filter-label">معرف المنفذ</label>
          <input
            className="admin-filter-input"
            placeholder="UUID..."
            value={filters.actorUserId}
            onChange={(e) => setFilter('actorUserId', e.target.value)}
            dir="ltr"
            disabled={isReadOnlyUser}
            title={readOnlyTitle}
          />
        </div>
        <div className="admin-filter-group">
          <label className="admin-filter-label">من تاريخ</label>
          <input
            className="admin-filter-input"
            type="date"
            value={filters.dateFrom?.slice(0, 10) ?? ''}
            onChange={(e) => setFilter('dateFrom', e.target.value ? `${e.target.value}T00:00:00Z` : '')}
            disabled={isReadOnlyUser}
            title={readOnlyTitle}
          />
        </div>
        <div className="admin-filter-group">
          <label className="admin-filter-label">إلى تاريخ</label>
          <input
            className="admin-filter-input"
            type="date"
            value={filters.dateTo?.slice(0, 10) ?? ''}
            onChange={(e) => setFilter('dateTo', e.target.value ? `${e.target.value}T23:59:59Z` : '')}
            disabled={isReadOnlyUser}
            title={readOnlyTitle}
          />
        </div>
        <div className="admin-filter-group">
          <label className="admin-filter-label">عناصر الصفحة</label>
          <select
            className="admin-filter-select"
            value={filters.pageSize}
            onChange={(e) => setFilter('pageSize', Number(e.target.value) as AuditLogFilters['pageSize'])}
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
          <p className="admin-state-title">فشل تحميل السجلات</p>
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
              <col style={{ width: '18%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '15%' }} />
            </colgroup>
            <thead>
              <tr>
                <th>الحدث</th>
                <th>نوع الكيان</th>
                <th>معرف الكيان</th>
                <th>معرف المنفذ</th>
                <th>التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
                    لا توجد سجلات للفترة أو الفلاتر المحددة
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span className="admin-truncate" title={log.action} dir="ltr">
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <span className="admin-truncate" title={log.entityType}>
                        {log.entityType}
                      </span>
                    </td>
                    <td>
                      <span className="admin-truncate" title={log.entityId} dir="ltr">
                        {log.entityId}
                      </span>
                    </td>
                    <td>
                      <span className="admin-truncate" title={log.actorUserId} dir="ltr">
                        {log.actorUserId}
                      </span>
                    </td>
                    <td>{new Date(log.createdAt).toLocaleString('ar-EG')}</td>
                  </tr>
                ))
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
    </div>
  );
};
