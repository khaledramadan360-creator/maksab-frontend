import { useMemo, useState } from 'react';
import {
  EMAIL_REASON_LABELS,
  type ClientEmailCampaignPreviewData,
  type ClientEmailCampaignRecipientPreview,
} from '../../../types/client-email-campaigns';

type PreviewTabKey = 'sendable' | 'warning' | 'blocked';

interface ClientEmailCampaignRecipientsTabsProps {
  preview: ClientEmailCampaignPreviewData;
  selectedWarningClientIds: string[];
  onToggleWarningClient: (clientId: string) => void;
  canEditOverrides: boolean;
}

const getReasonLabel = (reason: string | null) =>
  reason ? EMAIL_REASON_LABELS[reason] ?? reason : '-';

const renderRecipientRows = ({
  recipients,
  allowSelection,
  selectedWarningClientIds,
  onToggleWarningClient,
}: {
  recipients: ClientEmailCampaignRecipientPreview[];
  allowSelection: boolean;
  selectedWarningClientIds: string[];
  onToggleWarningClient: (clientId: string) => void;
}) => {
  if (recipients.length === 0) {
    return (
      <tr>
        <td className="clients-empty-cell" colSpan={5}>
          لا توجد بيانات في هذا القسم.
        </td>
      </tr>
    );
  }

  return recipients.map((recipient) => (
    <tr key={recipient.clientId}>
      <td>{recipient.name || '-'}</td>
      <td dir="ltr">{recipient.email || '-'}</td>
      <td>{recipient.eligibilityLevel}</td>
      <td>{getReasonLabel(recipient.eligibilityReason)}</td>
      <td>
        {allowSelection ? (
          recipient.canOverride ? (
            <input
              type="checkbox"
              checked={selectedWarningClientIds.includes(recipient.clientId)}
              onChange={() => onToggleWarningClient(recipient.clientId)}
            />
          ) : (
            <span className="clients-muted">غير متاح</span>
          )
        ) : (
          '-'
        )}
      </td>
    </tr>
  ));
};

export const ClientEmailCampaignRecipientsTabs = ({
  preview,
  selectedWarningClientIds,
  onToggleWarningClient,
  canEditOverrides,
}: ClientEmailCampaignRecipientsTabsProps) => {
  const [activeTab, setActiveTab] = useState<PreviewTabKey>('sendable');

  const activeRecipients = useMemo(() => {
    if (activeTab === 'sendable') return preview.sendableRecipients;
    if (activeTab === 'warning') return preview.warningRecipients;
    return preview.blockedRecipients;
  }, [activeTab, preview]);

  return (
    <section className="clients-card client-email-campaign-preview-tabs">
      <div className="client-email-campaign-tab-buttons">
        <button
          type="button"
          className={`clients-btn ${activeTab === 'sendable' ? 'clients-btn-primary' : 'clients-btn-ghost'}`}
          onClick={() => setActiveTab('sendable')}
        >
          صالح للإرسال ({preview.sendableCount})
        </button>
        <button
          type="button"
          className={`clients-btn ${activeTab === 'warning' ? 'clients-btn-primary' : 'clients-btn-ghost'}`}
          onClick={() => setActiveTab('warning')}
        >
          يحتاج مراجعة ({preview.warningCount})
        </button>
        <button
          type="button"
          className={`clients-btn ${activeTab === 'blocked' ? 'clients-btn-primary' : 'clients-btn-ghost'}`}
          onClick={() => setActiveTab('blocked')}
        >
          ممنوع الإرسال ({preview.blockedCount})
        </button>
      </div>

      {activeTab === 'warning' && (
        <div className="clients-inline-warning">
          بعض العملاء عليهم تحذيرات. لا يتم إرسالهم إلا عند اختيارهم يدويًا.
        </div>
      )}

      {activeTab === 'blocked' && (
        <div className="clients-inline-warning">
          العملاء في هذا القسم ممنوع الإرسال لهم نهائيًا.
        </div>
      )}

      <div className="clients-table-wrap">
        <table className="clients-table">
          <thead>
            <tr>
              <th>العميل</th>
              <th>الإيميل</th>
              <th>التصنيف</th>
              <th>السبب</th>
              <th>إرسال رغم التحذير</th>
            </tr>
          </thead>
          <tbody>
            {renderRecipientRows({
              recipients: activeRecipients,
              allowSelection: activeTab === 'warning' && canEditOverrides,
              selectedWarningClientIds,
              onToggleWarningClient,
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
