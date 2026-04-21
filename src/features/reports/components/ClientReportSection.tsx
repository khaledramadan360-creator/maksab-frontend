import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useClientReport } from '../hooks/useClientReport';
import { useGenerateClientReport } from '../hooks/useGenerateClientReport';
import { GenerateReportModal } from './GenerateReportModal';
import { ReportEmptyState } from './ReportEmptyState';
import { ReportErrorState } from './ReportErrorState';
import { ReportLoadingState } from './ReportLoadingState';
import '../styles/reports.css';

interface ClientReportSectionProps {
  clientId: string;
  clientName: string;
  isReadOnly?: boolean;
  canGenerate?: boolean;
  onToast?: (message: string, type: 'success' | 'error') => void;
}

const REPORT_STATUS_LABELS: Record<string, string> = {
  generating: 'قيد التوليد',
  ready: 'جاهز',
  failed: 'فشل',
  pending: 'قيد التوليد',
  completed: 'جاهز',
};

export const ClientReportSection = ({
  clientId,
  clientName,
  isReadOnly = false,
  canGenerate = true,
  onToast,
}: ClientReportSectionProps) => {
  const navigate = useNavigate();
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  const { report, loadState, errorMessage, hasReport, refetch } = useClientReport({
    clientId,
    isPreviewMode: isReadOnly,
  });

  const { generate, isGenerating, errorMessage: generateError, clearError } =
    useGenerateClientReport();

  const canGenerateAction = useMemo(() => !isReadOnly && canGenerate, [isReadOnly, canGenerate]);

  const openGenerateModal = () => {
    clearError();
    setIsGenerateModalOpen(true);
  };

  const handleGenerate = async () => {
    if (!clientId || !canGenerateAction) return;

    const wasRegenerate = hasReport;
    const result = await generate(clientId);
    if (!result.ok) {
      onToast?.(result.message, 'error');
      return;
    }

    setIsGenerateModalOpen(false);
    await refetch();
    onToast?.(
      wasRegenerate ? 'تمت إعادة توليد التقرير بنجاح.' : 'تم إنشاء التقرير بنجاح.',
      'success',
    );
    navigate(`/clients/${clientId}/report`);
  };

  return (
    <section className="clients-card reports-section">
      <header className="reports-header">
        <div>
          <h3 className="reports-title">تقرير العميل</h3>
          <p className="reports-subtitle">
            {isReadOnly
              ? 'وضع مشاهدة فقط: عرض شكلي للتقرير بدون بيانات حقيقية.'
              : 'توليد تقرير نهائي للعميل مع إمكانية العرض والتحميل بصيغة PDF.'}
          </p>
        </div>
      </header>

      {loadState === 'loading' && <ReportLoadingState />}

      {loadState === 'error' && (
        <ReportErrorState
          message={errorMessage}
          onRetry={refetch}
          disabled={isReadOnly || isGenerating}
        />
      )}

      {loadState === 'ok' && !report && (
        <ReportEmptyState
          isReadOnly={isReadOnly}
          disabled={!canGenerateAction || isGenerating}
          onGenerate={openGenerateModal}
        />
      )}

      {loadState === 'ok' && report && (
        <div className="reports-summary-card">
          <div className="reports-summary-head">
            <h4>{report.title || 'تقرير العميل'}</h4>
            <span className={`reports-status reports-status-${report.status}`}>
              {REPORT_STATUS_LABELS[report.status] ?? report.status}
            </span>
          </div>

          <div className="reports-summary-meta">
            <span>
              آخر توليد:{' '}
              {report.generatedAt ? new Date(report.generatedAt).toLocaleString('ar-EG') : '-'}
            </span>
            <span>المعرّف: {report.id || '-'}</span>
          </div>

          <div className="reports-actions">
            <Link to={`/clients/${clientId}/report`} className="clients-btn clients-btn-ghost">
              {isReadOnly ? 'معاينة التقرير' : 'عرض التقرير'}
            </Link>

            <button
              type="button"
              className="clients-btn clients-btn-primary"
              onClick={openGenerateModal}
              disabled={!canGenerateAction || isGenerating}
              title={!canGenerateAction ? 'لا توجد صلاحية لإعادة التوليد.' : ''}
            >
              {isGenerating ? 'جارٍ التنفيذ...' : 'إعادة توليد'}
            </button>

            {report.pdfUrl && !isReadOnly ? (
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
      )}

      {generateError && loadState !== 'error' && <ReportErrorState message={generateError} />}

      {isGenerateModalOpen && (
        <GenerateReportModal
          clientName={clientName}
          isRegenerate={hasReport}
          isReadOnly={isReadOnly}
          isLoading={isGenerating}
          onCancel={() => setIsGenerateModalOpen(false)}
          onConfirm={handleGenerate}
        />
      )}
    </section>
  );
};
