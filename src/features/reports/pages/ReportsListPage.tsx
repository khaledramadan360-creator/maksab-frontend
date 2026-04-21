import { useMemo, useState } from 'react';
import { deleteReport } from '../../../services/api/reports';
import { AuthApiError } from '../../../services/api/auth';
import { useAuthStore, usePermissions } from '../../../store/authStore';
import type { ReportsListItem } from '../../../types/reports';
import { ReportErrorState } from '../components/ReportErrorState';
import { ReportLoadingState } from '../components/ReportLoadingState';
import { DeleteReportDialog } from '../components/DeleteReportDialog';
import { ReportsListEmptyState } from '../components/ReportsListEmptyState';
import {
  ReportsListFilters,
  type ReportsListFilterValues,
} from '../components/ReportsListFilters';
import { ReportsListTable } from '../components/ReportsListTable';
import { useReportsList } from '../hooks/useReportsList';
import '../styles/reports.css';

const DEFAULT_FILTERS: ReportsListFilterValues = {
  clientName: '',
  ownerName: '',
  status: 'all',
  generatedFrom: '',
  generatedTo: '',
};

const matchesDateRange = (
  isoDate: string | null,
  fromDate: string,
  toDate: string,
) => {
  if (!isoDate) {
    return !fromDate && !toDate;
  }

  const dateOnly = isoDate.slice(0, 10);
  if (fromDate && dateOnly < fromDate) return false;
  if (toDate && dateOnly > toDate) return false;
  return true;
};

export const ReportsListPage = () => {
  const { user } = useAuthStore();
  const { hasRole, isReadOnlyUser } = usePermissions();

  const isManagerOrAdmin = hasRole(['admin', 'manager']);
  const isEmployee = hasRole(['employee']);
  const canDeleteReports = isManagerOrAdmin && !isReadOnlyUser;

  const [filters, setFilters] = useState<ReportsListFilterValues>(DEFAULT_FILTERS);
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ReportsListItem | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const { items, setItems, loadState, errorMessage, refetch } = useReportsList({
    isPreviewMode: isReadOnlyUser,
  });

  const scopedItems = useMemo(() => {
    if (!isEmployee || !user?.id) {
      return items;
    }

    return items.filter((item) => !item.ownerUserId || item.ownerUserId === user.id);
  }, [items, isEmployee, user?.id]);

  const filteredItems = useMemo(() => {
    const clientName = filters.clientName.trim().toLowerCase();
    const ownerName = filters.ownerName.trim().toLowerCase();

    return scopedItems.filter((item) => {
      if (clientName && !item.clientName.toLowerCase().includes(clientName)) {
        return false;
      }

      if (ownerName && !(item.ownerName ?? '').toLowerCase().includes(ownerName)) {
        return false;
      }

      if (filters.status !== 'all' && item.status !== filters.status) {
        return false;
      }

      if (
        !matchesDateRange(item.generatedAt, filters.generatedFrom, filters.generatedTo)
      ) {
        return false;
      }

      return true;
    });
  }, [scopedItems, filters]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.clientName.trim().length > 0 ||
      filters.ownerName.trim().length > 0 ||
      filters.status !== 'all' ||
      filters.generatedFrom.trim().length > 0 ||
      filters.generatedTo.trim().length > 0
    );
  }, [filters]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3500);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || !canDeleteReports) return;

    setIsDeleteLoading(true);
    try {
      await deleteReport(deleteTarget.id);
      setItems((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      showToast('تم حذف التقرير بنجاح.', 'success');
      setDeleteTarget(null);
    } catch (error) {
      showToast(
        error instanceof AuthApiError ? error.message : 'تعذر حذف التقرير.',
        'error',
      );
    } finally {
      setIsDeleteLoading(false);
    }
  };

  return (
    <div className="reports-page reports-list-page">
      <div className="reports-page-header reports-list-header">
        <div>
          <h2 className="reports-page-title">التقارير المحفوظة</h2>
          <p className="reports-page-subtitle">
            عرض وإدارة تقارير العملاء حسب الصلاحيات.
          </p>
        </div>
        {isReadOnlyUser && <span className="clients-preview-pill-text">Preview Mode</span>}
      </div>

      <ReportsListFilters
        values={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
        disabled={isReadOnlyUser}
      />

      {loadState === 'loading' && <ReportLoadingState />}

      {loadState === 'error' && (
        <ReportErrorState message={errorMessage} onRetry={refetch} disabled={isReadOnlyUser} />
      )}

      {loadState === 'ok' && isReadOnlyUser && (
        <ReportsListTable items={[]} isPreviewMode />
      )}

      {loadState === 'ok' && !isReadOnlyUser && filteredItems.length === 0 && (
        <ReportsListEmptyState hasFilters={hasActiveFilters} />
      )}

      {loadState === 'ok' && !isReadOnlyUser && filteredItems.length > 0 && (
        <ReportsListTable
          items={filteredItems}
          canDelete={canDeleteReports}
          onDelete={canDeleteReports ? setDeleteTarget : undefined}
        />
      )}

      {deleteTarget && canDeleteReports && (
        <DeleteReportDialog
          reportTitle={deleteTarget.clientName || deleteTarget.id}
          isLoading={isDeleteLoading}
          onCancel={() => {
            if (isDeleteLoading) return;
            setDeleteTarget(null);
          }}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {toast && <div className={`reports-toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
};
