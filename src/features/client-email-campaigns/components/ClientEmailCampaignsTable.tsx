import { Link } from 'react-router-dom';
import type { ClientEmailCampaignListItem } from '../../../types/client-email-campaigns';
import { ClientEmailCampaignStatusBadge } from './ClientEmailCampaignStatusBadge';

interface ClientEmailCampaignsTableProps {
  items: ClientEmailCampaignListItem[];
  isPreviewMode?: boolean;
  actionLabel?: string;
  buildActionHref?: (item: ClientEmailCampaignListItem) => string;
}

const formatDate = (value: string | null) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('ar-EG');
};

export const ClientEmailCampaignsTable = ({
  items,
  isPreviewMode = false,
  actionLabel = 'فتح',
  buildActionHref = (item) => `/client-email-campaigns/${item.id}`,
}: ClientEmailCampaignsTableProps) => {
  return (
    <section className="clients-card clients-table-wrap">
      <table className="clients-table client-email-campaigns-table">
        <thead>
          <tr>
            <th>العنوان</th>
            <th>الموضوع</th>
            <th>الحالة</th>
            <th>الإجمالي</th>
            <th>صالح</th>
            <th>تحذير</th>
            <th>ممنوع</th>
            <th>تم الإرسال</th>
            <th>فشل</th>
            <th>تاريخ الإنشاء</th>
            <th>إجراء</th>
          </tr>
        </thead>
        <tbody>
          {isPreviewMode ? (
            <tr>
              <td className="clients-empty-cell" colSpan={11}>
                <div className="client-email-campaigns-preview-shape">
                  <span className="clients-preview-line" />
                  <span className="clients-preview-line short" />
                </div>
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td className="clients-empty-cell" colSpan={11}>
                لا توجد حملات متاحة.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id}>
                <td>{item.title || '-'}</td>
                <td>{item.subject || '-'}</td>
                <td>
                  <ClientEmailCampaignStatusBadge status={item.status} />
                </td>
                <td>{item.totalSelected}</td>
                <td>{item.sendableCount}</td>
                <td>{item.warningCount}</td>
                <td>{item.blockedCount}</td>
                <td>{item.sentCount}</td>
                <td>{item.failedCount}</td>
                <td>{formatDate(item.createdAt)}</td>
                <td>
                  <Link
                    to={buildActionHref(item)}
                    className="clients-btn clients-btn-ghost"
                  >
                    {actionLabel}
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
};
