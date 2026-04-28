import {
  EMAIL_REASON_LABELS,
  type ClientEmailCampaignRecipientDetails,
} from '../../../types/client-email-campaigns';

interface ClientEmailCampaignRecipientsTableProps {
  recipients: ClientEmailCampaignRecipientDetails[];
  isPreviewMode?: boolean;
}

const RECIPIENT_STATUS_LABELS: Record<string, string> = {
  pending: 'قيد التنفيذ',
  sent: 'تم الإرسال',
  failed: 'فشل',
  skipped: 'تم التخطي',
  blocked: 'ممنوع',
  warning_not_selected: 'تحذير غير محدد',
};

const formatDate = (value: string | null) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('ar-EG');
};

export const ClientEmailCampaignRecipientsTable = ({
  recipients,
  isPreviewMode = false,
}: ClientEmailCampaignRecipientsTableProps) => {
  return (
    <section className="clients-card clients-table-wrap">
      <table className="clients-table">
        <thead>
          <tr>
            <th>العميل</th>
            <th>الإيميل</th>
            <th>حالة الإرسال</th>
            <th>مستوى التصنيف</th>
            <th>سبب التصنيف</th>
            <th>Override؟</th>
            <th>سبب Override</th>
            <th>سبب الفشل</th>
            <th>وقت الإرسال</th>
          </tr>
        </thead>
        <tbody>
          {isPreviewMode ? (
            <tr>
              <td className="clients-empty-cell" colSpan={9}>
                <div className="client-email-campaigns-preview-shape">
                  <span className="clients-preview-line" />
                  <span className="clients-preview-line short" />
                </div>
              </td>
            </tr>
          ) : recipients.length === 0 ? (
            <tr>
              <td className="clients-empty-cell" colSpan={9}>
                لا يوجد Recipients في هذه الصفحة.
              </td>
            </tr>
          ) : (
            recipients.map((recipient) => (
              <tr key={recipient.id}>
                <td>{recipient.clientName || '-'}</td>
                <td dir="ltr">{recipient.email || '-'}</td>
                <td>{RECIPIENT_STATUS_LABELS[recipient.sendStatus] ?? recipient.sendStatus}</td>
                <td>{recipient.eligibilityLevel || '-'}</td>
                <td>
                  {recipient.eligibilityReason
                    ? EMAIL_REASON_LABELS[recipient.eligibilityReason] ??
                      recipient.eligibilityReason
                    : '-'}
                </td>
                <td>{recipient.overrideUsed ? 'نعم' : 'لا'}</td>
                <td>{recipient.overrideReason || '-'}</td>
                <td>{recipient.failureReason || '-'}</td>
                <td>{formatDate(recipient.sentAt)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
};
