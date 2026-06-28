import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pagination } from '../../../components/admin/Pagination';
import { useAuthStore, usePermissions } from '../../../store/authStore';
import {
  changeClientOwner,
  changeClientStatus,
  createClient,
  deleteClient,
} from '../../../services/api/clients';
import { AuthApiError } from '../../../services/api/auth';
import type {
  ClientListItem,
  ClientsListFilters,
  CreateClientRequest,
} from '../../../types/clients';
import { ClientFilters } from '../components/ClientFilters';
import { ClientsTable } from '../components/ClientsTable';
import { ChangeStatusModal } from '../components/ChangeStatusModal';
import { ChangeOwnerModal } from '../components/ChangeOwnerModal';
import { DeleteClientDialog } from '../components/DeleteClientDialog';
import { ClientForm, type ClientFormValues } from '../components/ClientForm';
import { BulkUploadModal } from '../components/BulkUploadModal';
import { useClientsList } from '../hooks/useClientsList';
import { sanitizePlatformLinks } from '../utils/payload';
import '../styles/clients.css';

const buildDefaultFilters = (ownerUserId?: string): ClientsListFilters => ({
  keyword: '',
  city: '',
  status: '',
  type: '',
  primaryPlatform: '',
  ownerUserId: ownerUserId ?? '',
  createdFrom: '',
  createdTo: '',
  page: 1,
  pageSize: 20,
});

const normalizeOptional = (value?: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const EMPTY_FORM_VALUES: ClientFormValues = {
  name: '',
  type: 'company',
  city: 'Riyadh',
  mobilePhone: '',
  whatsappNumber: '',
  email: '',
  notes: '',
  primaryPlatform: 'website',
  sourceUrl: '',
  platformLinks: {
    website: '',
    facebook: '',
    instagram: '',
    snapchat: '',
    linkedin: '',
    x: '',
    tiktok: '',
  },
};

export const ClientsListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { hasRole, isReadOnlyUser } = usePermissions();

  const isManagerOrAdmin = hasRole(['admin', 'manager']);
  const isEmployee = hasRole(['employee']);
  const canCreate = !isReadOnlyUser && hasRole(['admin', 'manager', 'employee']);
  const canOpenCreateModal = canCreate || isReadOnlyUser;
  const ownerScopedUserId = isEmployee ? user?.id : undefined;

  const [filters, setFilters] = useState<ClientsListFilters>(() => buildDefaultFilters(ownerScopedUserId));
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const [statusTarget, setStatusTarget] = useState<ClientListItem | null>(null);
  const [ownerTarget, setOwnerTarget] = useState<ClientListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ClientListItem | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const {
    items,
    total,
    loadState,
    errorMessage,
    reload,
  } = useClientsList({
    filters,
    isPreviewMode: isReadOnlyUser,
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3500);
  };

  const setFilter = <K extends keyof ClientsListFilters>(key: K, value: ClientsListFilters[K]) => {
    if (isReadOnlyUser) return;
    setFilters((prev) => {
      const next = { ...prev, [key]: value, ...(key !== 'pageSize' ? { page: 1 } : {}) };
      if (isEmployee && user?.id) {
        next.ownerUserId = user.id;
      }
      return next;
    });
  };

  const resetFilters = () => {
    if (isReadOnlyUser) return;
    setFilters(buildDefaultFilters(ownerScopedUserId));
  };

const createPayload = (values: ClientFormValues): CreateClientRequest => ({
  name: values.name,
  type: values.type,
  city: values.city,
  mobilePhone: normalizeOptional(values.mobilePhone),
  whatsappNumber: normalizeOptional(values.whatsappNumber),
  email: normalizeOptional(values.email),
  notes: normalizeOptional(values.notes),
  primaryPlatform: values.primaryPlatform,
  platformLinks: sanitizePlatformLinks(values.platformLinks),
});

  const handleCreateClient = async (values: ClientFormValues) => {
    setIsCreateSubmitting(true);
    try {
      await createClient(createPayload(values));
      setIsCreateModalOpen(false);
      showToast('تم إنشاء العميل بنجاح', 'success');
      reload();
    } catch (error) {
      showToast(error instanceof AuthApiError ? error.message : 'تعذر إنشاء العميل', 'error');
    } finally {
      setIsCreateSubmitting(false);
    }
  };

  const runRowAction = async (target: ClientListItem, action: () => Promise<void>) => {
    setActionLoading((prev) => ({ ...prev, [target.id]: true }));
    try {
      await action();
      reload();
    } catch (error) {
      showToast(error instanceof AuthApiError ? error.message : 'تعذر تنفيذ الإجراء', 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, [target.id]: false }));
    }
  };

  const canManageAllClients = useMemo(() => isManagerOrAdmin, [isManagerOrAdmin]);

  return (
    <div className="clients-page">
      <div className="clients-header">
        <div>
          <h2 className="clients-title">قائمة العملاء</h2>
          <p className="clients-muted">إدارة ومراجعة العملاء المسجلين في النظام.</p>
        </div>
        <div className="clients-header-actions">
          {isReadOnlyUser && <span className="clients-preview-pill-text">Preview Mode</span>}
          {!isReadOnlyUser && canCreate && (
            <button
              className="clients-btn clients-btn-ghost"
              onClick={() => setIsBulkModalOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
            >
              📥 رفع جماعي (Excel/CSV)
            </button>
          )}
          <button
            className="clients-btn clients-btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
            disabled={!canOpenCreateModal}
            title={isReadOnlyUser ? 'وضع مشاهدة فقط: معاينة النموذج بدون حفظ' : !canCreate ? 'لا تملك صلاحية الإضافة' : ''}
          >
            {isReadOnlyUser ? 'معاينة نموذج العميل' : '+ عميل جديد'}
          </button>
        </div>
      </div>

      <ClientFilters
        filters={filters}
        onChange={setFilter}
        onReset={resetFilters}
        isReadOnly={isReadOnlyUser}
        showOwnerFilter={isManagerOrAdmin}
      />

      {loadState === 'error' ? (
        <div className="clients-card clients-state">
          <p>{errorMessage || 'فشل تحميل العملاء'}</p>
          <button className="clients-btn clients-btn-primary" onClick={reload} disabled={isReadOnlyUser}>
            إعادة المحاولة
          </button>
        </div>
      ) : (
        <>
          <ClientsTable
            items={items}
            isLoading={loadState === 'loading'}
            isPreviewMode={isReadOnlyUser}
            currentUserId={user?.id}
            canManageAllClients={canManageAllClients}
            canChangeOwner={isManagerOrAdmin && !isReadOnlyUser}
            onEdit={(client) => navigate(`/clients/${client.id}`)}
            onChangeStatus={(client) => setStatusTarget(client)}
            onChangeOwner={(client) => setOwnerTarget(client)}
            onDelete={(client) => setDeleteTarget(client)}
          />

          <Pagination
            page={filters.page}
            pageSize={filters.pageSize}
            total={total}
            disabled={isReadOnlyUser}
            onPageChange={(newPage) => setFilters((prev) => ({ ...prev, page: newPage }))}
          />
        </>
      )}

      {isCreateModalOpen && (
        <div className="clients-modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div className="clients-modal-card lg" onClick={(event) => event.stopPropagation()}>
            <ClientForm
              title="إضافة عميل جديد"
              initialValues={EMPTY_FORM_VALUES}
              onSubmit={handleCreateClient}
              onCancel={() => setIsCreateModalOpen(false)}
              submitLabel="إنشاء العميل"
              isSubmitting={isCreateSubmitting}
              isReadOnly={!canCreate}
            />
          </div>
        </div>
      )}

      {isBulkModalOpen && (
        <BulkUploadModal
          onCancel={() => setIsBulkModalOpen(false)}
          onSuccess={() => {
            reload();
          }}
          isReadOnly={isReadOnlyUser}
        />
      )}

      {statusTarget && (
        <ChangeStatusModal
          currentStatus={statusTarget.status}
          isReadOnly={isReadOnlyUser}
          isLoading={Boolean(actionLoading[statusTarget.id])}
          onCancel={() => setStatusTarget(null)}
          onConfirm={(status) =>
            runRowAction(statusTarget, async () => {
              await changeClientStatus(statusTarget.id, { status });
              setStatusTarget(null);
              showToast('تم تحديث حالة العميل', 'success');
            })
          }
        />
      )}

      {ownerTarget && (
        <ChangeOwnerModal
          currentOwnerId={ownerTarget.owner.id}
          currentOwnerName={ownerTarget.owner.fullName}
          isReadOnly={!isManagerOrAdmin || isReadOnlyUser}
          isLoading={Boolean(actionLoading[ownerTarget.id])}
          onCancel={() => setOwnerTarget(null)}
          onConfirm={(ownerUserId) =>
            runRowAction(ownerTarget, async () => {
              await changeClientOwner(ownerTarget.id, { newOwnerUserId: ownerUserId });
              setOwnerTarget(null);
              showToast('تم تغيير مالك العميل', 'success');
            })
          }
        />
      )}

      {deleteTarget && (
        <DeleteClientDialog
          clientName={deleteTarget.name}
          isReadOnly={isReadOnlyUser}
          isLoading={Boolean(actionLoading[deleteTarget.id])}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() =>
            runRowAction(deleteTarget, async () => {
              await deleteClient(deleteTarget.id);
              setDeleteTarget(null);
              showToast('تم حذف العميل', 'success');
            })
          }
        />
      )}

      {toast && <div className={`clients-toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
};
