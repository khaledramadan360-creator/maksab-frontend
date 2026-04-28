import { CAMPAIGN_STATUS_LABELS } from '../../../types/client-email-campaigns';

interface ClientEmailCampaignStatusBadgeProps {
  status: string;
}

export const ClientEmailCampaignStatusBadge = ({
  status,
}: ClientEmailCampaignStatusBadgeProps) => {
  return (
    <span className={`client-email-campaign-status status-${status}`}>
      {CAMPAIGN_STATUS_LABELS[status] ?? status}
    </span>
  );
};
