/**
 * authFetch — Smart authenticated fetch with refresh-on-401 retry.
 *
 * Behaviour:
 *  1. Attaches Authorization: Bearer <accessToken> from store
 *  2. On 401:
 *     a. Tries POST /refresh (via singleton lock in authStore)
 *     b. If refresh succeeds → retries the original request with new token
 *     c. If refresh fails → logout + redirect /login
 *  3. /refresh itself getting 401 → logout immediately (no infinite loop)
 */

import { useAuthStore } from '../../store/authStore';
import { AuthApiError } from '../api/auth';

export interface FetchOptions extends RequestInit {
  _isRetry?: boolean; // internal flag to prevent retry loops
}

export const authFetch = async <T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> => {
  const { session } = useAuthStore.getState();

  const doRequest = async (token: string | null | undefined) => {
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers ?? {}),
      },
    });
  };

  let response = await doRequest(session?.accessToken);

  // ── 401 Handling ────────────────────────────────────────────────────────────
  if (response.status === 401 && !options._isRetry) {
    // Attempt refresh (singleton — won't launch multiple parallel refreshes)
    const refreshed = await useAuthStore.getState().refreshSession();

    if (refreshed) {
      // Retry original request with fresh token
      const newToken = useAuthStore.getState().session?.accessToken;
      response = await doRequest(newToken);

      // Token still unauthorized after refresh => terminate session.
      if (response.status === 401) {
        await useAuthStore.getState().logout();
        throw new AuthApiError({ code: 'AuthenticationError', message: 'Session expired', httpStatus: 401 });
      }
    } else {
      // Refresh failed — nuke session and bail
      await useAuthStore.getState().logout();
      throw new AuthApiError({ code: 'AuthenticationError', message: 'Session expired', httpStatus: 401 });
    }
  }

  // ── Parse response ─────────────────────────────────────────────────────────
  const rawText = await response.text();
  let data: any = {};
  if (rawText) {
    try { data = JSON.parse(rawText); } catch { data = {}; }
  }

  if (!response.ok) {
    if (data?.error) throw new AuthApiError({ ...data.error, httpStatus: response.status });
    throw new AuthApiError({ code: 'HttpError', message: data?.message ?? 'Server error', httpStatus: response.status });
  }

  return data as T;
};
