import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { usePermissions } from '../../../store/authStore';
import { useClientReport } from '../hooks/useClientReport';
import { useGenerateClientReport } from '../hooks/useGenerateClientReport';
import { GenerateReportModal } from '../components/GenerateReportModal';
import { ReportEmptyState } from '../components/ReportEmptyState';
import { ReportErrorState } from '../components/ReportErrorState';
import { ReportLoadingState } from '../components/ReportLoadingState';
import { ReportFixedCoverPage } from '../components/ReportFixedCoverPage';
import '../styles/reports.css';

const REPORT_STATUS_LABELS: Record<string, string> = {
  generating: 'قيد التوليد',
  ready: 'جاهز',
  failed: 'فشل',
  pending: 'قيد التوليد',
  completed: 'جاهز',
};

export const ReportPreviewPage = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const { isReadOnlyUser, hasRole } = usePermissions();

  const canGenerate = !isReadOnlyUser && hasRole(['admin', 'manager', 'employee']);

  const { report, loadState, errorMessage, hasReport, refetch } = useClientReport({
    clientId,
    isPreviewMode: isReadOnlyUser,
  });

  const { generate, isGenerating, errorMessage: generateError, clearError } =
    useGenerateClientReport();

  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  const handleGenerate = async () => {
    if (!clientId || !canGenerate) return;

    const result = await generate(clientId);
    if (!result.ok) return;

    setIsGenerateModalOpen(false);
    await refetch();
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
              : 'عرض التقرير النهائي مع خيار تحميل PDF أو إعادة التوليد.'}
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
            title={!canGenerate ? 'لا توجد صلاحية لإنشاء التقرير.' : ''}
          >
            {isGenerating
              ? 'جارٍ التنفيذ...'
              : hasReport
                ? 'إعادة توليد'
                : 'إنشاء تقرير'}
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
        <div className="reports-inline-notice">جارٍ إعادة توليد التقرير...</div>
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
              : 'لا يوجد تقرير محفوظ لهذا العميل حالياً.'
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
          clientName={report?.title || 'العميل'}
          isRegenerate={hasReport}
          isReadOnly={!canGenerate}
          isLoading={isGenerating}
          onCancel={() => setIsGenerateModalOpen(false)}
          onConfirm={handleGenerate}
        />
      )}
    </div>
  );
};
