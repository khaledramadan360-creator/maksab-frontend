import type { UserRole, UserStatus } from './auth';

// ─── Invite ───────────────────────────────────────────────────────────────────

export type InviteStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export interface Invite {
  id: string;
  email: string;
  role: UserRole;
  status: InviteStatus;
  expiresAt: string;
  invitedByUserId: string;
  createdAt: string;
}

export interface SendInvitePayload {
  email: string;
  role: UserRole;
}

// ─── Admin User View ──────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export interface ChangeRolePayload {
  newRole: UserRole;
}

// ─── Audit Log ────────────────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  actorUserId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ─── Filter Types ─────────────────────────────────────────────────────────────

export interface InviteFilters {
  email?: string;
  role?: UserRole | '';
  status?: InviteStatus | '';
  page: number;
  pageSize: number;
}

export interface UserFilters {
  email?: string;
  role?: UserRole | '';
  status?: UserStatus | '';
  page: number;
  pageSize: number;
}

export interface AuditLogFilters {
  action?: string;
  entityType?: string;
  actorUserId?: string;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  pageSize: number;
}
