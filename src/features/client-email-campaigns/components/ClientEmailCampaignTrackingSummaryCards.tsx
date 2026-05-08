import type { ClientEmailCampaignTrackingSummary } from '../../../types/client-email-campaigns';
import { formatCampaignDateTime } from '../utils/tracking';

interface ClientEmailCampaignTrackingSummaryCardsProps {
  summary: ClientEmailCampaignTrackingSummary;
}

export const ClientEmailCampaignTrackingSummaryCards = ({
  summary,
}: ClientEmailCampaignTrackingSummaryCardsProps) => {
  const cards = [
    { key: 'delivered', label: 'تم التسليم', value: summary.deliveredCount, tone: 'success' },
    { key: 'opened', label: 'فتح مؤكد', value: summary.openedCount, tone: 'info' },
    { key: 'proxy', label: 'Proxy Open', value: summary.proxyOpenedCount, tone: 'muted' },
    { key: 'clicked', label: 'تم النقر', value: summary.clickedCount, tone: 'accent' },
    { key: 'hard', label: 'ارتداد دائم', value: summary.hardBouncedCount, tone: 'danger' },
    { key: 'soft', label: 'ارتداد مؤقت', value: summary.softBouncedCount, tone: 'warning' },
    { key: 'unsubscribed', label: 'إلغاء اشتراك', value: summary.unsubscribedCount, tone: 'danger' },
    { key: 'complained', label: 'شكاوى', value: summary.complainedCount, tone: 'danger' },
  ] as const;

  return (
    <section className="clients-card client-email-tracking-summary">
      <div className="client-email-tracking-summary-head">
        <div>
          <h3 className="clients-section-title">ملخص التتبع</h3>
          <p className="clients-muted">
            يتم احتساب Proxy Open كمؤشر معلوماتي فقط وليس فتحًا مؤكدًا.
          </p>
        </div>
        <div className="client-email-tracking-summary-meta">
          <span>آخر نشاط: {formatCampaignDateTime(summary.lastEventAt)}</span>
        </div>
      </div>

      <div className="client-email-tracking-summary-grid">
        {cards.map((card) => (
          <div
            key={card.key}
            className={`client-email-tracking-summary-card tone-${card.tone}`}
          >
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
};
