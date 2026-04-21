import { Link } from 'react-router-dom';
import type { ReportsListItem } from '../../../types/reports';

interface ReportsListTableProps {
  items: ReportsListItem[];
  isPreviewMode?: boolean;
  canDelete?: boolean;
  onDelete?: (item: ReportsListItem) => void;
}

const REPORT_STATUS_LABELS: Record<string, string> = {
  generating: 'قيد التوليد',
  ready: 'جاهز',
  failed: 'فشل',
  pending: 'قيد التوليد',
  completed: 'جاهز',
};

export const ReportsListTable = ({
  items,
  isPreviewMode = false,
  canDelete = false,
  onDelete,
}: ReportsListTableProps) => {
  return (
    <div className="clients-card clients-table-wrap">
      <table className="clients-table reports-list-table">
        <thead>
          <tr>
            <th>العميل</th>
            <th>صاحب العميل</th>
            <th>الحالة</th>
            <th>آخر توليد</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {isPreviewMode ? (
            [1, 2, 3, 4].map((index) => (
              <tr key={`reports-preview-${index}`}>
                <td>
                  <span className="clients-preview-line" />
                </td>
                <td>
                  <span className="clients-preview-line" />
                </td>
                <td>
                  <span className="clients-preview-pill" />
                </td>
                <td>
                  <span className="clients-preview-line short" />
                </td>
                <td>
                  <div className="reports-table-actions">
                    <button className="clients-btn clients-btn-ghost" disabled>
                      فتح
                    </button>
                    <button className="clients-btn clients-btn-danger" disabled>
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : items.length === 0 ? (
            <tr>
              <td className="clients-empty-cell" colSpan={5}>
                لا توجد تقارير متاحة
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id}>
                <td>{item.clientName || '-'}</td>
                <td>{item.ownerName || '-'}</td>
                <td>
                  <span className={`reports-status reports-status-${item.status}`}>
                    {REPORT_STATUS_LABELS[item.status] ?? item.status}
                  </span>
                </td>
                <td>
                  {item.generatedAt
                    ? new Date(item.generatedAt).toLocaleString('ar-EG')
                    : '-'}
                </td>
                <td>
                  <div className="reports-table-actions">
                    {item.clientId ? (
                      <Link
                        to={`/clients/${item.clientId}/report`}
                        className="clients-btn clients-btn-ghost"
                      >
                        فتح التقرير
                      </Link>
                    ) : (
                      <button className="clients-btn clients-btn-ghost" disabled>
                        فتح التقرير
                      </button>
                    )}

                    {canDelete && onDelete && (
                      <button
                        type="button"
                        className="clients-btn clients-btn-danger"
                        onClick={() => onDelete(item)}
                      >
                        حذف
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
