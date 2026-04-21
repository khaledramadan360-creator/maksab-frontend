import type { ClientType } from '../../../types/clients';
import { CLIENT_TYPE_LABELS } from '../constants';

interface ClientTypeBadgeProps {
  type: ClientType;
}

export const ClientTypeBadge = ({ type }: ClientTypeBadgeProps) => {
  return <span className={`client-badge client-badge-type-${type}`}>{CLIENT_TYPE_LABELS[type] ?? type}</span>;
};
