import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthApiError } from '../../../services/api/auth';
import {
  previewClientEmailCampaign,
  sendClientEmailCampaign,
} from '../../../services/api/client-email-campaigns';
import { usePermissions } from '../../../store/authStore';
import type { ClientEmailCampaignPreviewData } from '../../../types/client-email-campaigns';
import { ClientEmailCampaignClientSelector } from '../components/ClientEmailCampaignClientSelector';
import { ClientEmailCampaignConfirmSendModal } from '../components/ClientEmailCampaignConfirmSendModal';
import { ClientEmailCampaignPreviewSummary } from '../components/ClientEmailCampaignPreviewSummary';
import { ClientEmailCampaignRecipientsTabs } from '../components/ClientEmailCampaignRecipientsTabs';
import '../styles/client-email-campaigns.css';

interface CampaignFormState {
  title: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  htmlContent: string;
  textContent: string;
}

const DEFAULT_FORM: CampaignFormState = {
  title: '',
  subject: '',
  senderName: 'Maksab',
  senderEmail: '',
  htmlContent: '',
  textContent: '',
};

const ERROR_MESSAGES_BY_STATUS: Record<number, string> = {
  422: 'تأكد من بيانات الحملة المدخلة.',
  400: 'بيانات Override غير صحيحة أو سبب الإرسال رغم التحذير ناقص.',
  403: 'ليس لديك صلاحية لتنفيذ هذه العملية.',
  404: 'لم يتم العثور على البيانات المطلوبة.',
  409: 'لا يوجد عملاء صالحون للإرسال.',
  429: 'تم تجاوز حد الإرسال مؤقتًا، حاول لاحقًا.',
  502: 'مزود الإرسال رفض الطلب.',
  503: 'خدمة الإرسال غير متاحة حاليًا.',
  504: 'انتهت مهلة الاتصال بمزود الإرسال.',
};

const getClientEmailCampaignErrorMessage = (error: unknown) => {
  if (error instanceof AuthApiError) {
    const rawMessage = error.message?.trim() ?? '';
    const normalized = rawMessage.toLowerCase();

    if (normalized.includes('key not found')) {
      return 'مفتاح مزود الإرسال (Brevo API Key) غير مضبوط أو غير صحيح في إعدادات الباك اند.';
    }

    if (normalized.includes('sender') && normalized.includes('not')) {
      return 'بريد المرسل غير مقبول لدى مزود الإرسال. استخدم Sender موثق في Brevo.';
    }

    if (error.message?.trim()) {
      return error.message;
    }
    if (error.httpStatus && ERROR_MESSAGES_BY_STATUS[error.httpStatus]) {
      return ERROR_MESSAGES_BY_STATUS[error.httpStatus];
    }
  }
  return 'حدث خطأ أثناء تنفيذ حملة البريد الإلكتروني.';
};

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const CreateClientEmailCampaignPage = () => {
  const navigate = useNavigate();
  const { isReadOnlyUser } = usePermissions();
  const [form, setForm] = useState<CampaignFormState>(DEFAULT_FORM);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<ClientEmailCampaignPreviewData | null>(null);
  const [selectedWarningClientIds, setSelectedWarningClientIds] = useState<string[]>([]);
  const [overrideReason, setOverrideReason] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isSendLoading, setIsSendLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3500);
  };

  const validateBaseForm = () => {
    if (!form.title.trim()) return 'عنوان الحملة مطلوب.';
    if (!form.subject.trim()) return 'موضوع البريد مطلوب.';
    if (!form.senderName.trim()) return 'اسم المرسل مطلوب.';
    if (!form.senderEmail.trim()) return 'بريد المرسل مطلوب.';
    if (!isValidEmail(form.senderEmail.trim())) {
      return 'صيغة بريد المرسل غير صحيحة.';
    }
    if (!form.htmlContent.trim() && !form.textContent.trim()) {
      return 'مطلوب إدخال HTML أو Text على الأقل.';
    }
    if (selectedClientIds.length === 0) return 'اختر عميلًا واحدًا على الأقل.';
    return '';
  };

  const normalizedBasePayload = useMemo(
    () => ({
      title: form.title.trim(),
      subject: form.subject.trim(),
      senderName: form.senderName.trim(),
      senderEmail: form.senderEmail.trim(),
      htmlContent: form.htmlContent.trim() || undefined,
      textContent: form.textContent.trim() || undefined,
      clientIds: selectedClientIds,
    }),
    [form, selectedClientIds],
  );

  const handlePreview = async () => {
    if (isReadOnlyUser) return;

    const validationMessage = validateBaseForm();
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    setIsPreviewLoading(true);
    setFormError('');

    try {
      const response = await previewClientEmailCampaign(normalizedBasePayload);
      setPreviewData(response.data);
      setSelectedWarningClientIds((previous) => {
        const allowed = new Set(
          response.data.warningRecipients
            .filter((recipient) => recipient.canOverride)
            .map((recipient) => recipient.clientId),
        );
        return previous.filter((id) => allowed.has(id));
      });
      showToast('تمت المعاينة بنجاح.', 'success');
    } catch (error) {
      setPreviewData(null);
      setSelectedWarningClientIds([]);
      setOverrideReason('');
      setFormError(getClientEmailCampaignErrorMessage(error));
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleToggleWarningClient = (clientId: string) => {
    if (isReadOnlyUser) return;
    setSelectedWarningClientIds((previous) =>
      previous.includes(clientId)
        ? previous.filter((id) => id !== clientId)
        : [...previous, clientId],
    );
  };

  const finalRecipientsCount = (previewData?.sendableCount ?? 0) + selectedWarningClientIds.length;
  const skippedRecipientsCount = Math.max(
    0,
    (previewData?.totalSelected ?? 0) - finalRecipientsCount,
  );

  const openSendConfirm = () => {
    if (isReadOnlyUser) return;
    if (!previewData) {
      setFormError('قم بعمل معاينة قبل الإرسال.');
      return;
    }
    if (finalRecipientsCount === 0) {
      setFormError('لا يوجد عملاء صالحون للإرسال.');
      return;
    }
    if (selectedWarningClientIds.length > 0 && !overrideReason.trim()) {
      setFormError('سبب الإرسال رغم التحذير مطلوب.');
      return;
    }
    setFormError('');
    setIsConfirmModalOpen(true);
  };

  const handleSend = async () => {
    if (!previewData || isReadOnlyUser) return;

    setIsSendLoading(true);
    setFormError('');

    try {
      const response = await sendClientEmailCampaign({
        ...normalizedBasePayload,
        overrideWarningClientIds:
          selectedWarningClientIds.length > 0 ? selectedWarningClientIds : undefined,
        overrideReason:
          selectedWarningClientIds.length > 0 ? overrideReason.trim() : undefined,
      });

      const status = response.data.status;
      if (status === 'sent') {
        showToast('تم إرسال الحملة بنجاح.', 'success');
      } else if (status === 'partially_failed') {
        showToast('تم إرسال الحملة جزئيًا، وبعض الرسائل فشلت.', 'error');
      } else {
        showToast('فشلت الحملة.', 'error');
      }

      setIsConfirmModalOpen(false);
      navigate(`/client-email-campaigns/${response.data.campaignId}`);
    } catch (error) {
      setFormError(getClientEmailCampaignErrorMessage(error));
      showToast(getClientEmailCampaignErrorMessage(error), 'error');
      setIsConfirmModalOpen(false);
    } finally {
      setIsSendLoading(false);
    }
  };

  return (
    <div className="clients-page client-email-campaigns-page">
      <header className="clients-header">
        <div>
          <h2 className="clients-title">إنشاء حملة بريد إلكتروني</h2>
          <p className="clients-muted">
            اختر العملاء، ثم اعمل معاينة قبل الإرسال.
          </p>
        </div>
        <div className="clients-header-actions">
          {isReadOnlyUser && <span className="clients-preview-pill-text">Preview Mode</span>}
          <Link to="/client-email-campaigns" className="clients-btn clients-btn-ghost">
            العودة للقائمة
          </Link>
        </div>
      </header>

      <section className="clients-card">
        <h3 className="clients-section-title">بيانات الحملة</h3>
        <div className="clients-form-grid">
          <label className="clients-field">
            <span>عنوان الحملة</span>
            <input
              value={form.title}
              onChange={(event) =>
                setForm((previous) => ({ ...previous, title: event.target.value }))
              }
              disabled={isReadOnlyUser}
            />
          </label>

          <label className="clients-field">
            <span>موضوع البريد</span>
            <input
              value={form.subject}
              onChange={(event) =>
                setForm((previous) => ({ ...previous, subject: event.target.value }))
              }
              disabled={isReadOnlyUser}
            />
          </label>

          <label className="clients-field">
            <span>اسم المرسل</span>
            <input
              value={form.senderName}
              onChange={(event) =>
                setForm((previous) => ({ ...previous, senderName: event.target.value }))
              }
              disabled={isReadOnlyUser}
            />
          </label>

          <label className="clients-field">
            <span>بريد المرسل</span>
            <input
              value={form.senderEmail}
              onChange={(event) =>
                setForm((previous) => ({ ...previous, senderEmail: event.target.value }))
              }
              dir="ltr"
              disabled={isReadOnlyUser}
            />
          </label>
        </div>

        <div className="clients-form-grid">
          <label className="clients-field">
            <span>محتوى HTML</span>
            <textarea
              rows={6}
              value={form.htmlContent}
              onChange={(event) =>
                setForm((previous) => ({ ...previous, htmlContent: event.target.value }))
              }
              disabled={isReadOnlyUser}
            />
          </label>

          <label className="clients-field">
            <span>محتوى نصي</span>
            <textarea
              rows={6}
              value={form.textContent}
              onChange={(event) =>
                setForm((previous) => ({ ...previous, textContent: event.target.value }))
              }
              disabled={isReadOnlyUser}
            />
          </label>
        </div>
      </section>

      <ClientEmailCampaignClientSelector
        selectedClientIds={selectedClientIds}
        onSelectionChange={(nextIds) => {
          setSelectedClientIds(nextIds);
          setPreviewData(null);
        }}
        disabled={isReadOnlyUser}
        isPreviewMode={isReadOnlyUser}
      />

      <section className="clients-card">
        <div className="clients-form-actions">
          <button
            type="button"
            className="clients-btn clients-btn-ghost"
            onClick={handlePreview}
            disabled={isReadOnlyUser || isPreviewLoading || isSendLoading}
          >
            {isPreviewLoading ? 'جاري فحص العملاء...' : 'معاينة قبل الإرسال'}
          </button>

          <button
            type="button"
            className="clients-btn clients-btn-primary"
            onClick={openSendConfirm}
            disabled={
              isReadOnlyUser ||
              isPreviewLoading ||
              isSendLoading ||
              previewData === null
            }
          >
            {isSendLoading ? 'جاري إرسال الحملة...' : 'إرسال الحملة'}
          </button>
        </div>
      </section>

      {formError && <div className="clients-inline-error">{formError}</div>}

      {previewData && (
        <>
          <ClientEmailCampaignPreviewSummary data={previewData} />

          <ClientEmailCampaignRecipientsTabs
            preview={previewData}
            selectedWarningClientIds={selectedWarningClientIds}
            onToggleWarningClient={handleToggleWarningClient}
            canEditOverrides={!isReadOnlyUser}
          />

          {selectedWarningClientIds.length > 0 && (
            <section className="clients-card">
              <label className="clients-field">
                <span>سبب الإرسال رغم التحذير</span>
                <textarea
                  rows={3}
                  value={overrideReason}
                  onChange={(event) => setOverrideReason(event.target.value)}
                  placeholder="مثال: تم التأكد يدويًا من صحة البريد"
                  disabled={isReadOnlyUser}
                />
              </label>
            </section>
          )}
        </>
      )}

      {isConfirmModalOpen && previewData && (
        <ClientEmailCampaignConfirmSendModal
          sendableCount={previewData.sendableCount}
          selectedWarningCount={selectedWarningClientIds.length}
          skippedCount={skippedRecipientsCount}
          isLoading={isSendLoading}
          onCancel={() => {
            if (isSendLoading) return;
            setIsConfirmModalOpen(false);
          }}
          onConfirm={handleSend}
        />
      )}

      {toast && <div className={`clients-toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
};
