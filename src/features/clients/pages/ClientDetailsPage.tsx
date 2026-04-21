import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuthStore, usePermissions } from '../../../store/authStore';
import {
  changeClientOwner,
  changeClientStatus,
  deleteClient,
  updateClient,
} from '../../../services/api/clients';
import { AuthApiError } from '../../../services/api/auth';
import type { ClientDetails } from '../../../types/clients';
import { CLIENT_PLATFORM_LABELS } from '../constants';
import { ClientStatusBadge } from '../components/ClientStatusBadge';
import { ClientTypeBadge } from '../components/ClientTypeBadge';
import { ClientLinksSection } from '../components/ClientLinksSection';
import { ClientForm, type ClientFormValues } from '../components/ClientForm';
import { ChangeStatusModal } from '../components/ChangeStatusModal';
import { ChangeOwnerModal } from '../components/ChangeOwnerModal';
import { DeleteClientDialog } from '../components/DeleteClientDialog';
import { useClientDetails } from '../hooks/useClientDetails';
import { sanitizePlatformLinks } from '../utils/payload';
import { ClientAnalysisSection } from '../../analysis/components/ClientAnalysisSection';
import { ClientReportSection } from '../../reports/components/ClientReportSection';
import '../styles/clients.css';

const normalizeOptional = (value?: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const toFormValues = (client: ClientDetails): ClientFormValues => ({
  name: client.name,
  type: client.type,
  city: client.city,
  mobilePhone: client.mobilePhone ?? '',
  whatsappNumber: client.whatsappNumber ?? '',
  email: client.email ?? '',
  notes: client.notes ?? '',
  primaryPlatform: client.primaryPlatform,
  sourceUrl: client.sourceUrl ?? '',
  platformLinks: {
    website: client.platformLinks.website ?? '',
    facebook: client.platformLinks.facebook ?? '',
    instagram: client.platformLinks.instagram ?? '',
    snapchat: client.platformLinks.snapchat ?? '',
    linkedin: client.platformLinks.linkedin ?? '',
    x: client.platformLinks.x ?? '',
    tiktok: client.platformLinks.tiktok ?? '',
  },
});

export const ClientDetailsPage = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { hasRole, isReadOnlyUser } = usePermissions();

  const isManagerOrAdmin = hasRole(['admin', 'manager']);
  const canChangeOwner = isManagerOrAdmin && !isReadOnlyUser;

  const { client, loadState, errorMessage, setClient, reload, isPreviewClient } = useClientDetails({
    clientId,
    isPreviewMode: isReadOnlyUser,
  });

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isOwnerOpen, setIsOwnerOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3500);
  };

  const canManageClient = useMemo(() => {
    if (!client || isReadOnlyUser) return false;
    if (isManagerOrAdmin) return true;
    return client.owner?.id === user?.id;
  }, [client, isManagerOrAdmin, isReadOnlyUser, user?.id]);

  const updateLocalClient = (nextClient: ClientDetails) => {
    setClient(nextClient);
    reload();
  };

  const runAction = async (action: () => Promise<void>) => {
    setActionLoading(true);
    try {
      await action();
    } catch (error) {
      showToast(error instanceof AuthApiError ? error.message : 'تعذر تنفيذ الإجراء', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loadState === 'loading') {
    return (
      <div className="clients-page">
        <div className="clients-card clients-state">جاري تحميل التفاصيل...</div>
      </div>
    );
  }

  if (loadState === 'error' || !client) {
    return (
      <div className="clients-page">
        <div className="clients-card clients-state">
          <p>{errorMessage || 'تعذر تحميل بيانات العميل'}</p>
          <button className="clients-btn clients-btn-primary" onClick={reload}>
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="clients-page">
      <div className="clients-header">
        <div>
          <h2 className="clients-title">{client.name}</h2>
          <p className="clients-muted">تفاصيل العميل وإجراءات الإدارة</p>
        </div>
        <div className="clients-header-actions">
          <Link to="/clients" className="clients-btn clients-btn-ghost">
            الرجوع للقائمة
          </Link>
          {isPreviewClient && <span className="clients-preview-pill-text">Preview Mode</span>}
          <button
            className="clients-btn clients-btn-primary"
            onClick={() => setIsEditOpen(true)}
            disabled={!canManageClient}
            title={!canManageClient ? 'وضع مشاهدة فقط أو بدون صلاحية' : ''}
          >
            تعديل
          </button>
          <button
            className="clients-btn clients-btn-ghost"
            onClick={() => setIsStatusOpen(true)}
            disabled={!canManageClient}
            title={!canManageClient ? 'وضع مشاهدة فقط أو بدون صلاحية' : ''}
          >
            تغيير الحالة
          </button>
          <button
            className="clients-btn clients-btn-ghost"
            onClick={() => setIsOwnerOpen(true)}
            disabled={!canChangeOwner}
            title={!canChangeOwner ? 'متاح للمدير أو المشرف فقط' : ''}
          >
            تغيير المالك
          </button>
          <button
            className="clients-btn clients-btn-danger"
            onClick={() => setIsDeleteOpen(true)}
            disabled={!canManageClient}
            title={!canManageClient ? 'وضع مشاهدة فقط أو بدون صلاحية' : ''}
          >
            حذف
          </button>
        </div>
      </div>

      <div className="clients-grid">
        <section className="clients-card">
          <h3 className="clients-section-title">معلومات أساسية</h3>
          <div className="clients-details-grid">
            <div>
              <span className="clients-muted">النوع</span>
              <div><ClientTypeBadge type={client.type} /></div>
            </div>
            <div>
              <span className="clients-muted">الحالة</span>
              <div><ClientStatusBadge status={client.status} /></div>
            </div>
            <div>
              <span className="clients-muted">المدينة</span>
              <div>{client.city}</div>
            </div>
            <div>
              <span className="clients-muted">المنصة الأساسية</span>
              <div>{CLIENT_PLATFORM_LABELS[client.primaryPlatform]}</div>
            </div>
            <div>
              <span className="clients-muted">المالك</span>
              <div>{client.owner?.fullName || 'غير محدد'}</div>
            </div>
            <div>
              <span className="clients-muted">المصدر</span>
              <div>{client.source}</div>
            </div>
            <div>
              <span className="clients-muted">Source URL</span>
              <div dir="ltr">{client.sourceUrl || '-'}</div>
            </div>
            <div>
              <span className="clients-muted">تاريخ الإنشاء</span>
              <div>{new Date(client.createdAt).toLocaleString('ar-EG')}</div>
            </div>
          </div>
        </section>

        <section className="clients-card">
          <h3 className="clients-section-title">بيانات التواصل</h3>
          <div className="clients-details-grid">
            <div>
              <span className="clients-muted">الموبايل</span>
              <div dir="ltr">{client.mobilePhone || '-'}</div>
            </div>
            <div>
              <span className="clients-muted">واتساب</span>
              <div dir="ltr">{client.whatsappNumber || '-'}</div>
            </div>
            <div>
              <span className="clients-muted">الإيميل</span>
              <div dir="ltr">{client.email || '-'}</div>
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <span className="clients-muted">ملاحظات</span>
            <p style={{ marginTop: '0.4rem' }}>{client.notes || '-'}</p>
          </div>
        </section>
      </div>

      <ClientAnalysisSection
        clientId={client.id}
        clientName={client.name}
        clientPlatformLinks={client.platformLinks}
        isReadOnly={isReadOnlyUser}
        canRunAnalysis={canManageClient}
        onToast={showToast}
      />

      <ClientReportSection
        clientId={client.id}
        clientName={client.name}
        isReadOnly={isReadOnlyUser}
        canGenerate={canManageClient}
        onToast={showToast}
      />

      <ClientLinksSection links={client.platformLinks} />

      {isEditOpen && (
        <div className="clients-modal-overlay" onClick={() => setIsEditOpen(false)}>
          <div className="clients-modal-card lg" onClick={(event) => event.stopPropagation()}>
            <ClientForm
              title="تعديل بيانات العميل"
              initialValues={toFormValues(client)}
              onSubmit={(values) =>
                runAction(async () => {
                  setIsEditSubmitting(true);
                  try {
                    const response = await updateClient(client.id, {
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
                    updateLocalClient(response.data);
                    setIsEditOpen(false);
                    showToast('تم تحديث بيانات العميل', 'success');
                  } finally {
                    setIsEditSubmitting(false);
                  }
                })
              }
              onCancel={() => setIsEditOpen(false)}
              submitLabel="حفظ التعديلات"
              isSubmitting={isEditSubmitting}
              isReadOnly={!canManageClient}
            />
          </div>
        </div>
      )}

      {isStatusOpen && (
        <ChangeStatusModal
          currentStatus={client.status}
          isReadOnly={!canManageClient}
          isLoading={actionLoading}
          onCancel={() => setIsStatusOpen(false)}
          onConfirm={(status) =>
            runAction(async () => {
              const response = await changeClientStatus(client.id, { status });
              updateLocalClient(response.data);
              setIsStatusOpen(false);
              showToast('تم تحديث حالة العميل', 'success');
            })
          }
        />
      )}

      {isOwnerOpen && (
        <ChangeOwnerModal
          currentOwnerId={client.owner?.id || ''}
          currentOwnerName={client.owner?.fullName || 'غير محدد'}
          isReadOnly={!canChangeOwner}
          isLoading={actionLoading}
          onCancel={() => setIsOwnerOpen(false)}
          onConfirm={(ownerUserId) =>
            runAction(async () => {
              const response = await changeClientOwner(client.id, { newOwnerUserId: ownerUserId });
              updateLocalClient(response.data);
              setIsOwnerOpen(false);
              showToast('تم تغيير مالك العميل', 'success');
            })
          }
        />
      )}

      {isDeleteOpen && (
        <DeleteClientDialog
          clientName={client.name}
          isReadOnly={!canManageClient}
          isLoading={actionLoading}
          onCancel={() => setIsDeleteOpen(false)}
          onConfirm={() =>
            runAction(async () => {
              await deleteClient(client.id);
              showToast('تم حذف العميل', 'success');
              setIsDeleteOpen(false);
              navigate('/clients');
            })
          }
        />
      )}

      {toast && <div className={`clients-toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
};
