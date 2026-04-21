import { Link } from 'react-router-dom';
import type { TeamAnalysisOverviewItem } from '../../../types/analysis';

interface TeamAnalysisTableProps {
  items: TeamAnalysisOverviewItem[];
  isPreviewMode?: boolean;
}

export const TeamAnalysisTable = ({
  items,
  isPreviewMode = false,
}: TeamAnalysisTableProps) => {
  return (
    <div className="clients-card clients-table-wrap">
      <table className="clients-table analysis-team-table">
        <thead>
          <tr>
            <th>العميل</th>
            <th>المالك</th>
            <th>الدرجة الإجمالية</th>
            <th>آخر تحليل</th>
            <th>حالة التحليل</th>
            <th>إجراء</th>
          </tr>
        </thead>
        <tbody>
          {isPreviewMode ? (
            [1, 2, 3, 4].map((index) => (
              <tr key={`analysis-preview-${index}`}>
                <td>
                  <span className="clients-preview-line" />
                </td>
                <td>
                  <span className="clients-preview-line" />
                </td>
                <td>
                  <span className="clients-preview-line short" />
                </td>
                <td>
                  <span className="clients-preview-line short" />
                </td>
                <td>
                  <span className="clients-preview-pill" />
                </td>
                <td>
                  <button className="clients-btn clients-btn-ghost" disabled>
                    فتح
                  </button>
                </td>
              </tr>
            ))
          ) : (
            items.map((item) => (
              <tr key={`${item.clientId}-${item.ownerUserId}`}>
                <td>{item.clientName || '-'}</td>
                <td>{item.ownerName || '-'}</td>
                <td>{item.overallScore === null ? '-' : Math.round(item.overallScore)}</td>
                <td>
                  {item.analyzedAt
                    ? new Date(item.analyzedAt).toLocaleString('ar-EG')
                    : '-'}
                </td>
                <td>{item.hasAnalysis ? 'يوجد' : 'لا يوجد'}</td>
                <td>
                  <Link to={`/clients/${item.clientId}`} className="clients-btn clients-btn-ghost">
                    فتح
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
