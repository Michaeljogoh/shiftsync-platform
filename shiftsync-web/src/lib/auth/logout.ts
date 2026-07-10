'use client';

import { clearAuthCookies } from '@/lib/auth/client-cookies';
import { closeSocket } from '@/lib/socket';
import { AUTH_PERSIST_KEY, useAuthStore } from '@/lib/stores/auth.store';

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/v1`;

function buildLoginUrl(returnPath?: string): string {
  const path = returnPath ?? '';
  if (!path || path === '/' || path.startsWith('/login')) {
    return '/login';
  }
  return `/login?returnUrl=${encodeURIComponent(path)}`;
}

export interface PerformLogoutOptions {
  /** Defaults to `/login`, or `/login?returnUrl=…` when signing out from a protected page. */
  redirectTo?: string;
}

/**
 * Signs the user out without flashing logged-out UI on the current page.
 * Clears cookies/storage and hard-navigates away before React can re-render auth-dependent UI.
 */
export function performLogout(options?: PerformLogoutOptions): void {
  if (typeof window === 'undefined') return;

  const { accessToken, refreshToken } = useAuthStore.getState();

  if (refreshToken) {
    void fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ refreshToken }),
      keepalive: true,
    }).catch(() => {});
  }

  closeSocket();
  clearAuthCookies();
  localStorage.removeItem(AUTH_PERSIST_KEY);

  const redirectTo =
    options?.redirectTo ??
    buildLoginUrl(window.location.pathname + window.location.search);

  window.location.replace(redirectTo);
}
