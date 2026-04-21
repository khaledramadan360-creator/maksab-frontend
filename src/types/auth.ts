export type UserRole = 'admin' | 'manager' | 'employee' | 'viewer';
export type UserStatus = 'active' | 'suspended';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
}

// 'bootstrapping' = app is checking stored session on startup (prevents flicker/bad redirects)
// 'authenticated'  = valid user + active status confirmed
// 'unauthenticated' = no valid session
export type AuthStatus = 'bootstrapping' | 'authenticated' | 'unauthenticated';
