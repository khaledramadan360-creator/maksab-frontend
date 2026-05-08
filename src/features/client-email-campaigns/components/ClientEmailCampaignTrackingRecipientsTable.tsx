import {
  EMAIL_REASON_LABELS,
  RECIPIENT_STATUS_LABELS,
  TRACKING_EVENT_LABELS,
  type ClientEmailCampaignRecipientDetails,
} from '../../../types/client-email-campaigns';
import {
  formatCampaignDateTime,
  hasBounced,
  hasClicked,
  hasComplained,
  hasConfirmedOpen,
  hasDelivered,
  hasUnsubscribed,
} from '../utils/tracking';

interface ClientEmailCampaignTrackingRecipientsTableProps {
  recipients: ClientEmailCampaignRecipientDetails[];
  isPreviewMode?: boolean;
  onViewTimeline: (recipient: ClientEmailCampaignRecipientDetails) => void;
}

const quickBadgeDefinitions = (recipient: ClientEmailCampaignRecipientDetails) => {
  const badges: Array<{ key: string; label: string; tone: string }> = [];

  if (hasDelivered(recipient)) {
    badges.push({ key: 'delivered', label: 'Delivered', tone: 'success' });
  }
  if (hasConfirmedOpen(recipient)) {
    badges.push({
      key: 'opened',
      label: recipient.openCount > 1 ? `Opened ${recipient.openCount}` : 'Opened',
      tone: 'info',
    });
  }
  if (hasClicked(recipient)) {
    badges.push({
      key: 'clicked',
      label: recipient.clickCount > 1 ? `Clicked ${recipient.clickCount}` : 'Clicked',
      tone: 'accent',
    });
  }
  if (hasBounced(recipient)) {
    badges.push({ key: 'bounced', label: 'Bounced', tone: 'danger' });
  }
  if (hasUnsubscribed(recipient)) {
    badges.push({ key: 'unsubscribed', label: 'Unsubscribed', tone: 'danger' });
  }
  if (hasComplained(recipient)) {
    badges.push({ key: 'complained', label: 'Complained', tone: 'danger' });
  }
  if (recipient.proxyOpenCount > 0) {
    badges.push({
      key: 'proxy',
      label:
        recipient.proxyOpenCount > 1
          ? `Proxy Open ${recipient.proxyOpenCount}`
          : 'Proxy Open',
      tone: 'muted',
    });
  }

  return badges;
};

const getRecipientNote = (recipient: ClientEmailCampaignRecipientDetails) => {
  if (recipient.failureReason) return recipient.failureReason;
  if (recipient.skipReason) return recipient.skipReason;
  if (recipient.overrideReason) return recipient.overrideReason;
  if (recipient.eligibilityReason) {
    return EMAIL_REASON_LABELS[recipient.eligibilityReason] ?? recipient.eligibilityReason;
  }
  return '-';
};

export const ClientEmailCampaignTrackingRecipientsTable = ({
  recipients,
  isPreviewMode = false,
  onViewTimeline,
}: ClientEmailCampaignTrackingRecipientsTableProps) => {
  return (
    <section className="clients-card clients-table-wrap">
      <table className="clients-table client-email-tracking-table">
        <thead>
          <tr>
            <th>العميل</th>
            <th>الإيميل</th>
            <th>حالة الإرسال</th>
            <th>آخر حدث</th>
            <th>مؤشرات التفاعل</th>
            <th>ملاحظات</th>
            <th>إجراء</th>
          </tr>
        </thead>
        <tbody>
          {isPreviewMode ? (
            <tr>
              <td className="clients-empty-cell" colSpan={7}>
                <div className="client-email-campaigns-preview-shape">
                  <span className="clients-preview-line" />
                  <span className="clients-preview-line short" />
                </div>
              </td>
            </tr>
          ) : recipients.length === 0 ? (
            <tr>
              <td className="clients-empty-cell" colSpan={7}>
                لا يوجد مستلمون مطابقون للفلاتر الحالية.
              </td>
            </tr>
          ) : (
            recipients.map((recipient) => {
              const quickBadges = quickBadgeDefinitions(recipient);

              return (
                <tr key={recipient.id}>
                  <td>
                    <div className="client-email-recipient-cell">
                      <strong>{recipient.name || recipient.clientName || '-'}</strong>
                      <span className="clients-muted">
                        {recipient.clientId ? `Client ID: ${recipient.clientId}` : 'بدون معرف عميل'}
                      </span>
                    </div>
                  </td>
                  <td dir="ltr">{recipient.email || '-'}</td>
                  <td>
                    <span
                      className={`client-email-recipient-status status-${recipient.status}`}
                    >
                      {RECIPIENT_STATUS_LABELS[recipient.status] ?? recipient.status}
                    </span>
                  </td>
                  <td>
                    <div className="client-email-recipient-cell">
                      <strong>
                        {recipient.lastEventType
                          ? TRACKING_EVENT_LABELS[recipient.lastEventType]
                          : '-'}
                      </strong>
                      <span className="clients-muted">
                        {formatCampaignDateTime(recipient.lastEventAt)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="client-email-quick-badges">
                      {quickBadges.length === 0 ? (
                        <span className="clients-muted">-</span>
                      ) : (
                        quickBadges.map((badge) => (
                          <span
                            key={badge.key}
                            className={`client-email-quick-badge tone-${badge.tone}`}
                          >
                            {badge.label}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="client-email-recipient-note">
                      {getRecipientNote(recipient)}
                    </div>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="clients-btn clients-btn-ghost"
                      onClick={() => onViewTimeline(recipient)}
                    >
                      View timeline
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </section>
  );
};
