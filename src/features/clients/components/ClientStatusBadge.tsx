import type { ClientStatus } from '../../../types/clients';
import { CLIENT_STATUS_LABELS } from '../constants';

interface ClientStatusBadgeProps {
  status: ClientStatus;
}

export const ClientStatusBadge = ({ status }: ClientStatusBadgeProps) => {
  return <span className={`client-badge client-badge-status-${status}`}>{CLIENT_STATUS_LABELS[status] ?? status}</span>;
};
