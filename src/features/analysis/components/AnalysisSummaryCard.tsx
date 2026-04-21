import type { ClientAnalysis } from '../../../types/analysis';
import { cleanAnalysisSummary } from '../utils/analysisSummary';

interface AnalysisSummaryCardProps {
  analysis: ClientAnalysis;
}

export const AnalysisSummaryCard = ({ analysis }: AnalysisSummaryCardProps) => {
  const analyzedAtLabel = analysis.analyzedAt
    ? new Date(analysis.analyzedAt).toLocaleString('ar-EG')
    : '-';
  const cleanedSummary = cleanAnalysisSummary(analysis.summary || '');

  return (
    <div className="analysis-summary-card">
      <div className="analysis-summary-top">
        <div>
          <h3>ملخص التحليل</h3>
          <p>{cleanedSummary || 'لا يوجد ملخص تحليل متاح.'}</p>
        </div>
        <div className="analysis-score-pill" aria-label="Overall score">
          <span>الإجمالي</span>
          <strong>{Math.round(analysis.overallScore)}</strong>
        </div>
      </div>

      <div className="analysis-summary-meta">
        <span>الحالة: {analysis.status}</span>
        <span>تاريخ التحليل: {analyzedAtLabel}</span>
      </div>
    </div>
  );
};
