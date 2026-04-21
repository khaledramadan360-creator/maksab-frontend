import { authFetch } from '../http/authFetch';
import type {
  Invite,
  AdminUser,
  AuditLog,
  PaginatedResult,
  SendInvitePayload,
  InviteFilters,
  UserFilters,
  AuditLogFilters,
} from '../../types/admin';
import type { UserRole } from '../../types/auth';

const BASE_URL = 'http://localhost:3000/api/v1/auth';

const toQuery = (params: Record<string, any>): string => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
  });
  const str = q.toString();
  return str ? `?${str}` : '';
};

// ─── Invites ──────────────────────────────────────────────────────────────────
export const getInvites = (filters: InviteFilters) =>
  authFetch<{ data: PaginatedResult<Invite> }>(`${BASE_URL}/invites${toQuery(filters)}`);

export const sendInvite = (payload: SendInvitePayload) =>
  authFetch<{ data: Invite }>(`${BASE_URL}/invites`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const resendInvite = (inviteId: string) =>
  authFetch<{ data: Invite }>(`${BASE_URL}/invites/${inviteId}/resend`, { method: 'POST' });

export const revokeInvite = (inviteId: string) =>
  authFetch<{ data: { message: string } }>(`${BASE_URL}/invites/${inviteId}/revoke`, { method: 'POST' });

// ─── Users ────────────────────────────────────────────────────────────────────
export const getUsers = (filters: UserFilters) =>
  authFetch<{ data: PaginatedResult<AdminUser> }>(`${BASE_URL}/users${toQuery(filters)}`);

export const changeUserRole = (userId: string, newRole: UserRole) =>
  authFetch<{ data: AdminUser }>(`${BASE_URL}/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ newRole }),
  });

export const suspendUser = (userId: string) =>
  authFetch<{ data: AdminUser }>(`${BASE_URL}/users/${userId}/suspend`, { method: 'PATCH' });

export const reactivateUser = (userId: string) =>
  authFetch<{ data: AdminUser }>(`${BASE_URL}/users/${userId}/reactivate`, { method: 'PATCH' });

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export const getAuditLogs = (filters: AuditLogFilters) =>
  authFetch<{ data: PaginatedResult<AuditLog> }>(`${BASE_URL}/audit-logs${toQuery(filters)}`);
