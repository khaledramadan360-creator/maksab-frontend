import { create } from 'zustand';
import type { User, AuthSession, AuthStatus } from '../types/auth';

const BASE_URL = 'http://localhost:3000/api/v1/auth';

// ─── Persistence Keys ──────────────────────────────────────────────────────────
const KEYS = {
  USER: 'auth_user',
  ACCESS: 'auth_access_token',
  REFRESH: 'auth_refresh_token',
} as const;

// ─── State Shape ───────────────────────────────────────────────────────────────
interface AuthState {
  user: User | null;
  session: AuthSession | null;
  status: AuthStatus;
  isRefreshing: boolean;

  // Session management
  setSession: (user: User, session: AuthSession) => void;
  clearSession: () => void;

  // Lifecycle
  bootstrapSession: () => Promise<void>;
  refreshSession: () => Promise<boolean>;

  // Auth actions (kept for backward compat with existing auth pages)
  login: (user: User, session: AuthSession) => void;
  logout: () => Promise<void>;
}

// ─── Singleton refresh promise (prevents parallel refresh calls) ───────────────
let _refreshPromise: Promise<boolean> | null = null;

// ─── Store ────────────────────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  status: 'bootstrapping',  // starts as bootstrapping — app needs to check storage first
  isRefreshing: false,

  // ── Persist to localStorage + update state ──────────────────────────────────
  setSession: (user, session) => {
    try {
      localStorage.setItem(KEYS.USER, JSON.stringify(user));
      localStorage.setItem(KEYS.ACCESS, session.accessToken);
      localStorage.setItem(KEYS.REFRESH, session.refreshToken);
    } catch { /* storage quota or private mode */ }
    set({ user, session, status: 'authenticated' });
  },

  // ── Erase all session data ──────────────────────────────────────────────────
  clearSession: () => {
    try {
      localStorage.removeItem(KEYS.USER);
      localStorage.removeItem(KEYS.ACCESS);
      localStorage.removeItem(KEYS.REFRESH);
    } catch { /* ignore */ }
    set({ user: null, session: null, status: 'unauthenticated', isRefreshing: false });
  },

  // ── Called once on app mount to restore session ─────────────────────────────
  //
  // Strategy: restore from localStorage INSTANTLY without a network call.
  // Rationale: POST /refresh during startup is fragile (timeout, server cold-start,
  // network hiccup) and would boot the user out for no reason.
  // The authFetch interceptor already handles 401 → refresh → retry on every API call,
  // so there is no need to pre-refresh here. The user gets seamless re-entry.
  bootstrapSession: async () => {
    const storedAccess  = localStorage.getItem(KEYS.ACCESS);
    const storedRefresh = localStorage.getItem(KEYS.REFRESH);
    const storedUser    = localStorage.getItem(KEYS.USER);

    // Must have all three to consider the session restoreable
    if (!storedAccess || !storedRefresh || !storedUser) {
      set({ status: 'unauthenticated' });
      return;
    }

    try {
      const user: User = JSON.parse(storedUser);
      // Only trust an active user — suspended users should not regain access
      if (!user?.id || !user?.role || user?.status !== 'active') {
        set({ status: 'unauthenticated' });
        return;
      }

      // Restore the session directly from storage — no network needed here
      set({
        user,
        session: { accessToken: storedAccess, refreshToken: storedRefresh },
        status: 'authenticated',
      });
    } catch {
      // Corrupt data in storage
      set({ status: 'unauthenticated' });
    }
  },

  // ── Attempt POST /refresh — returns true on success ─────────────────────────
  refreshSession: () => {
    // If a refresh is already in-flight, return the same promise (singleton lock)
    if (_refreshPromise) return _refreshPromise;

    _refreshPromise = (async (): Promise<boolean> => {
      const storedRefresh = localStorage.getItem(KEYS.REFRESH);
      if (!storedRefresh) return false;

      set({ isRefreshing: true });

      try {
        const response = await fetch(`${BASE_URL}/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: storedRefresh }),
        });

        if (!response.ok) return false;

        const data = await response.json();
        const { user, accessToken, refreshToken } = data.data;

        // Validate user is still active
        if (!user || user.status !== 'active' || !accessToken || !refreshToken) return false;

        get().setSession(user, { accessToken, refreshToken });
        return true;

      } catch {
        return false;
      } finally {
        set({ isRefreshing: false });
        _refreshPromise = null;
      }
    })();

    return _refreshPromise;
  },

  // ── login() — used by public auth pages (Login, AcceptInvite) ───────────────
  login: (user, session) => {
    get().setSession(user, session);
  },

  // ── logout() — calls API, then clears local state regardless of result ───────
  logout: async () => {
    const { session } = get();

    // Fire-and-forget: even if /logout fails we still clear locally
    if (session?.accessToken && session?.refreshToken) {
      try {
        await fetch(`${BASE_URL}/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({ refreshToken: session.refreshToken }),
        });
      } catch { /* ignore — local cleanup will still happen */ }
    }

    get().clearSession();
    window.location.replace('/login');
  },
}));

// ─── Derived hook ──────────────────────────────────────────────────────────────
export const usePermissions = () => {
  const { user, status } = useAuthStore();
  const isAuthenticated = status === 'authenticated';
  const isActiveUser = Boolean(user && user.status === 'active');

  const hasRole = (roles: Array<User['role']>) => {
    if (!isAuthenticated || !isActiveUser || !user) return false;
    return roles.includes(user.role);
  };

  const isViewer = Boolean(isAuthenticated && isActiveUser && user?.role === 'viewer');
  const isReadOnlyUser = isViewer;
  const canInteract = Boolean(isAuthenticated && isActiveUser && !isReadOnlyUser);

  return {
    hasRole,
    user,
    isAuthenticated,
    isViewer,
    isReadOnlyUser,
    canInteract,
  };
};
