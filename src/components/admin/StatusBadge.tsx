import type { UserStatus } from '../../types/auth';
import type { InviteStatus } from '../../types/admin';

interface StatusBadgeProps {
  status: UserStatus | InviteStatus;
}

const labelMap: Record<string, string> = {
  active: 'نشط',
  suspended: 'موقوف',
  pending: 'معلق',
  accepted: 'مقبول',
  expired: 'منتهي',
  revoked: 'ملغي',
};

export const StatusBadge = ({ status }: StatusBadgeProps) => (
  <span className={`badge badge-${status}`}>
    {labelMap[status] ?? status}
  </span>
);
