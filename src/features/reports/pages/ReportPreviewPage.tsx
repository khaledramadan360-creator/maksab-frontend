import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AuthApiError } from '../../../services/api/auth';
import { getClientById } from '../../../services/api/clients';
import type { SendReportToWhatChimpRequest } from '../../../types/reports';
import { usePermissions } from '../../../store/authStore';
import { GenerateReportModal } from '../components/GenerateReportModal';
import { ReportEmptyState } from '../components/ReportEmptyState';
import { ReportErrorState } from '../components/ReportErrorState';
import { ReportFixedCoverPage } from '../components/ReportFixedCoverPage';
import { ReportLoadingState } from '../components/ReportLoadingState';
import { SendReportToWhatChimpModal } from '../components/SendReportToWhatChimpModal';
import {
  FRONTEND_WHATCHIMP_DEFAULT_SENDER_ID,
  FRONTEND_WHATCHIMP_SENDER_OPTIONS,
} from '../constants/whatchimpSenderOptions';
import { useClientReport } from '../hooks/useClientReport';
import { useGenerateClientReport } from '../hooks/useGenerateClientReport';
import { useSendReportToWhatChimp } from '../hooks/useSendReportToWhatChimp';
import '../styles/reports.css';

const REPORT_STATUS_LABELS: Record<string, string> = {
  generating: 'قيد التوليد',
  ready: 'جاهز',
  failed: 'فشل',
  pending: 'قيد التوليد',
  completed: 'جاهز',
};

interface ClientContactData {
  whatsappPhone: string;
  mobilePhone: string;
  recipientName: string;
}

const EMPTY_CONTACTS: ClientContactData = {
  whatsappPhone: '',
  mobilePhone: '',
  recipientName: '',
};

export const ReportPreviewPage = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const { isReadOnlyUser, hasRole } = usePermissions();
  const canGenerate = !isReadOnlyUser && hasRole(['admin', 'manager', 'employee']);
  const canSendToWhatChimp = !isReadOnlyUser && hasRole(['admin', 'manager', 'employee']);

  const { report, loadState, errorMessage, hasReport, refetch } = useClientReport({
    clientId,
    isPreviewMode: isReadOnlyUser,
  });

  const { generate, isGenerating, errorMessage: generateError, clearError } =
    useGenerateClientReport();
  const {
    send,
    isSending,
    errorMessage: sendErrorMessage,
    clearError: clearSendError,
  } = useSendReportToWhatChimp();

  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [contactsState, setContactsState] = useState<'idle' | 'loading' | 'ready' | 'error'>(
    'idle',
  );
  const [contactsErrorMessage, setContactsErrorMessage] = useState('');
  const [contacts, setContacts] = useState<ClientContactData>(EMPTY_CONTACTS);
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (!isSendModalOpen || !clientId || isReadOnlyUser) {
      return;
    }

    let isActive = true;
    setContactsState('loading');
    setContactsErrorMessage('');

    getClientById(clientId)
      .then((response) => {
        if (!isActive) return;

        setContacts({
          whatsappPhone: response.data.whatsappNumber ?? '',
          mobilePhone: response.data.mobilePhone ?? '',
          recipientName: response.data.name ?? report?.client?.name ?? '',
        });
        setContactsState('ready');
      })
      .catch((error) => {
        if (!isActive) return;

        setContacts((previous) => ({
          ...previous,
          recipientName: report?.client?.name ?? previous.recipientName,
        }));
        setContactsState('error');
        setContactsErrorMessage(
          error instanceof AuthApiError
            ? error.message
            : 'تعذر تحميل أرقام العميل، ويمكنك المتابعة برقم مخصص.',
        );
      });

    return () => {
      isActive = false;
    };
  }, [isSendModalOpen, clientId, isReadOnlyUser, report?.client?.name]);

  const handleGenerate = async () => {
    if (!clientId || !canGenerate) return;

    const result = await generate(clientId);
    if (!result.ok) {
      showToast(result.message, 'error');
      return;
    }

    setIsGenerateModalOpen(false);
    await refetch();
    showToast('تم توليد التقرير بنجاح.', 'success');
  };

  const handleOpenSendModal = () => {
    if (!canSendToWhatChimp) return;

    clearSendError();
    setContacts({
      whatsappPhone: '',
      mobilePhone: '',
      recipientName: report?.client?.name ?? '',
    });
    setContactsState('idle');
    setContactsErrorMessage('');
    setIsSendModalOpen(true);
  };

  const handleSendReport = async (payload: SendReportToWhatChimpRequest) => {
    if (!clientId || !canSendToWhatChimp) return;

    const result = await send(clientId, payload);
    if (!result.ok) {
      showToast(result.message, 'error');
      return;
    }

    setIsSendModalOpen(false);
    showToast(result.message, 'success');
  };

  if (!clientId) {
    return (
      <div className="reports-page">
        <ReportErrorState message="معرف العميل غير متوفر." />
      </div>
    );
  }

  return (
    <div className="reports-page">
      <div className="reports-page-header">
        <div>
          <h2 className="reports-page-title">معاينة تقرير العميل</h2>
          <p className="reports-page-subtitle">
            {isReadOnlyUser
              ? 'وضع مشاهدة فقط: هذه معاينة شكلية للتقرير.'
              : 'عرض التقرير النهائي مع خيارات تحميل PDF وإرسال التقرير عبر WhatChimp.'}
          </p>
        </div>

        <div className="reports-page-actions">
          <Link to={`/clients/${clientId}`} className="clients-btn clients-btn-ghost">
            العودة لصفحة العميل
          </Link>

          <button
            type="button"
            className="clients-btn clients-btn-primary"
            disabled={!canGenerate || isGenerating}
            onClick={() => {
              clearError();
              setIsGenerateModalOpen(true);
            }}
            title={!canGenerate ? 'لا توجد صلاحية لتوليد التقرير.' : ''}
          >
            {isGenerating ? 'جاري التنفيذ...' : hasReport ? 'إعادة توليد' : 'إنشاء تقرير'}
          </button>

          <button
            type="button"
            className="clients-btn clients-btn-ghost"
            disabled={!canSendToWhatChimp || !hasReport || isSending || isGenerating}
            onClick={handleOpenSendModal}
            title={
              !canSendToWhatChimp
                ? 'لا توجد صلاحية لإرسال التقرير.'
                : !hasReport
                  ? 'يجب إنشاء التقرير أولًا.'
                  : ''
            }
          >
            {isSending ? 'جاري الإرسال...' : 'إرسال عبر WhatChimp'}
          </button>

          {report?.pdfUrl && !isReadOnlyUser ? (
            <a
              href={report.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="clients-btn clients-btn-ghost"
            >
              تحميل PDF
            </a>
          ) : (
            <button className="clients-btn clients-btn-ghost" disabled>
              تحميل PDF
            </button>
          )}
        </div>
      </div>

      {isGenerating && hasReport && (
        <div className="reports-inline-notice">جاري إعادة توليد التقرير...</div>
      )}

      {loadState === 'loading' && <ReportLoadingState />}

      {loadState === 'error' && (
        <ReportErrorState
          message={errorMessage}
          onRetry={refetch}
          disabled={isReadOnlyUser || isGenerating}
        />
      )}

      {loadState === 'ok' && !report && (
        <ReportEmptyState
          isReadOnly={isReadOnlyUser}
          message={
            isReadOnlyUser
              ? 'وضع مشاهدة فقط: لا تتوفر بيانات تقرير حقيقية.'
              : 'لا يوجد تقرير محفوظ لهذا العميل حاليًا.'
          }
          actionLabel="إنشاء تقرير"
          disabled={!canGenerate || isGenerating}
          onGenerate={() => setIsGenerateModalOpen(true)}
        />
      )}

      {loadState === 'ok' && report && (
        <section className="clients-card reports-preview-card">
          <div className="reports-summary-head">
            <h3>{report.title || 'تقرير العميل'}</h3>
            <span className={`reports-status reports-status-${report.status}`}>
              {REPORT_STATUS_LABELS[report.status] ?? report.status}
            </span>
          </div>

          <div className="reports-summary-meta">
            <span>
              آخر توليد:{' '}
              {report.generatedAt ? new Date(report.generatedAt).toLocaleString('ar-EG') : '-'}
            </span>
            <span>Report ID: {report.id}</span>
          </div>

          <div className="reports-document">
            <ReportFixedCoverPage />
            <div className="reports-page-break" />

            {report.htmlContent ? (
              <article
                className="reports-preview-html"
                dangerouslySetInnerHTML={{ __html: report.htmlContent }}
              />
            ) : report.preview ? (
              <section className="reports-preview-fallback">
                <h4>ملخص التقرير</h4>
                <p>{report.preview.analysisSummary || 'لا يوجد ملخص متاح.'}</p>

                <div className="reports-preview-fallback-meta">
                  <span>
                    الدرجة الكلية:{' '}
                    {report.preview.overallScore === null
                      ? '-'
                      : Math.round(report.preview.overallScore)}
                  </span>
                  <span>
                    تاريخ التحليل:{' '}
                    {report.preview.analyzedAt
                      ? new Date(report.preview.analyzedAt).toLocaleString('ar-EG')
                      : '-'}
                  </span>
                </div>

                {report.preview.platformScores.length > 0 && (
                  <div className="reports-preview-fallback-platforms">
                    {report.preview.platformScores.map((item) => (
                      <div key={item.platform} className="reports-preview-fallback-platform">
                        <strong>{item.platform}</strong>
                        <span>{item.score === null ? '-' : Math.round(item.score)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ) : (
              <div className="reports-state reports-empty">
                <p>لا يوجد محتوى HTML للمعاينة.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {generateError && loadState !== 'error' && <ReportErrorState message={generateError} />}

      {isGenerateModalOpen && (
        <GenerateReportModal
          clientName={report?.client?.name || report?.title || 'العميل'}
          isRegenerate={hasReport}
          isReadOnly={!canGenerate}
          isLoading={isGenerating}
          onCancel={() => setIsGenerateModalOpen(false)}
          onConfirm={handleGenerate}
        />
      )}

      {isSendModalOpen && (
        <SendReportToWhatChimpModal
          clientName={report?.client?.name || report?.title || 'العميل'}
          whatsappPhone={contacts.whatsappPhone}
          mobilePhone={contacts.mobilePhone}
          defaultRecipientName={contacts.recipientName || report?.client?.name || ''}
          isLoadingContacts={contactsState === 'loading'}
          contactsErrorMessage={contactsErrorMessage}
          whatChimpPhoneNumberOptions={FRONTEND_WHATCHIMP_SENDER_OPTIONS}
          defaultWhatChimpPhoneNumberId={FRONTEND_WHATCHIMP_DEFAULT_SENDER_ID}
          isLoading={isSending}
          isReadOnly={!canSendToWhatChimp}
          errorMessage={sendErrorMessage}
          onCancel={() => {
            if (isSending) return;
            setIsSendModalOpen(false);
          }}
          onSubmit={handleSendReport}
        />
      )}

      {toast && <div className={`reports-toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
};
