import type { UserRole } from '../../types/auth';

interface RoleBadgeProps {
  role: UserRole;
}

const labelMap: Record<UserRole, string> = {
  admin: 'مشرف',
  manager: 'مدير',
  employee: 'موظف',
  viewer: 'مشاهد',
};

export const RoleBadge = ({ role }: RoleBadgeProps) => (
  <span className={`badge badge-${role}`}>
    {labelMap[role] ?? role}
  </span>
);
