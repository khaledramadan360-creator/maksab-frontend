import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ClientReport } from '../../../types/reports';
import { getClientReport } from '../../../services/api/reports';
import { AuthApiError } from '../../../services/api/auth';

type LoadState = 'loading' | 'ok' | 'error';

interface UseClientReportOptions {
  clientId?: string;
  isPreviewMode?: boolean;
}

const PREVIEW_REPORT: ClientReport = {
  id: 'preview-report',
  clientId: 'preview-client',
  analysisId: null,
  ownerUserId: null,
  ownerName: null,
  status: 'ready',
  format: 'pdf',
  title: 'تقرير العميل (وضع المشاهدة)',
  htmlContent:
    '<h2>معاينة التقرير</h2><p>هذا عرض شكلي فقط في وضع المشاهدة بدون بيانات حقيقية.</p>',
  pdfUrl: null,
  pdfStoragePath: null,
  generatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  client: {
    id: 'preview-client',
    name: 'عميل تجريبي',
    saudiCity: 'Riyadh',
  },
  preview: {
    overallScore: 88,
    analysisSummary: 'هذه معاينة شكلية فقط لبيانات التقرير في وضع المشاهدة.',
    analyzedAt: new Date().toISOString(),
    platformScores: [
      { platform: 'website', score: 90 },
      { platform: 'linkedin', score: 84 },
      { platform: 'instagram', score: 82 },
    ],
    screenshots: [],
  },
};

export const useClientReport = ({
  clientId,
  isPreviewMode = false,
}: UseClientReportOptions) => {
  const [report, setReport] = useState<ClientReport | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const load = useCallback(async () => {
    if (!clientId) {
      setReport(null);
      setLoadState('error');
      setErrorMessage('معرف العميل غير متوفر.');
      return;
    }

    if (isPreviewMode) {
      setReport({ ...PREVIEW_REPORT, clientId });
      setLoadState('ok');
      setErrorMessage('');
      return;
    }

    setLoadState('loading');
    setErrorMessage('');

    try {
      const response = await getClientReport(clientId);
      setReport(response.data);
      setLoadState('ok');
    } catch (error) {
      setReport(null);
      setLoadState('error');
      setErrorMessage(
        error instanceof AuthApiError ? error.message : 'تعذر تحميل تقرير العميل.',
      );
    }
  }, [clientId, isPreviewMode]);

  useEffect(() => {
    load();
  }, [load]);

  const hasReport = useMemo(() => Boolean(report), [report]);

  return {
    report,
    loadState,
    errorMessage,
    hasReport,
    refetch: load,
    setReport,
  };
};
