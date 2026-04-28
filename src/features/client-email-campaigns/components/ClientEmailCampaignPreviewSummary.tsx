import type { ClientEmailCampaignPreviewData } from '../../../types/client-email-campaigns';

interface ClientEmailCampaignPreviewSummaryProps {
  data: ClientEmailCampaignPreviewData;
}

export const ClientEmailCampaignPreviewSummary = ({
  data,
}: ClientEmailCampaignPreviewSummaryProps) => {
  return (
    <section className="clients-card client-email-campaign-preview-summary">
      <h3 className="clients-section-title">ملخص المعاينة</h3>
      <div className="client-email-campaign-preview-stats">
        <div className="client-email-campaign-preview-stat">
          <span>إجمالي المختارين</span>
          <strong>{data.totalSelected}</strong>
        </div>
        <div className="client-email-campaign-preview-stat sendable">
          <span>صالح للإرسال</span>
          <strong>{data.sendableCount}</strong>
        </div>
        <div className="client-email-campaign-preview-stat warning">
          <span>يحتاج مراجعة</span>
          <strong>{data.warningCount}</strong>
        </div>
        <div className="client-email-campaign-preview-stat blocked">
          <span>ممنوع الإرسال</span>
          <strong>{data.blockedCount}</strong>
        </div>
      </div>
    </section>
  );
};
