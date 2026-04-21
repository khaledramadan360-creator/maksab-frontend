import type { UserRole } from '../types/auth';

/**
 * Check if a given generic role has access to specific required roles.
 * A route could allow multiple roles (e.g., ['admin', 'manager']).
 */
export const canAccessRoute = (userRole: UserRole, allowedRoles: UserRole[]): boolean => {
  return allowedRoles.includes(userRole);
};

export type ActionType = 
  | 'suspend_user'
  | 'revoke_invite'
  | 'change_role'
  | 'view_audit_logs';

/**
 * Complex permission check considering the actor, the action, and optionally the target user role.
 * Example: A manager cannot suspend an admin.
 */
export const canPerformAction = (
  actorRole: UserRole, 
  action: ActionType, 
  targetRole?: UserRole
): boolean => {
  // Admins can do absolutely anything
  if (actorRole === 'admin') {
    return true;
  }

  if (actorRole === 'manager') {
    // Actions a manager is restricted from
    if (action === 'suspend_user') {
      // Manager cannot suspend an admin
      if (targetRole === 'admin') return false;
      return true;
    }
    if (action === 'change_role') {
      // Manager cannot change someone to admin, or edit an admin's role
      if (targetRole === 'admin') return false; 
      return true;
    }
    
    // Default manager access for other actions like viewing logs etc.
    return true;
  }

  // employee and viewer generally have no administrative actions
  return false;
};
