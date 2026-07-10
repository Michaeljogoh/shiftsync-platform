/** Matches Render free-tier idle spin-down (~15 minutes). */
export const WAKE_API_THROTTLE_MS = 15 * 60 * 1000;

const WAKE_STORAGE_KEY = 'shiftsync-api-wake-at';

function getApiBaseUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!raw) return null;
  return raw.replace(/\/$/, '');
}

function isLocalApiHost(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname.endsWith('.local')
  );
}

/** True when prod wake pings are enabled (Render-hosted API, not localhost). */
export function isWakeApiEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_WAKE_API !== 'true') return false;

  const base = getApiBaseUrl();
  if (!base) return false;

  try {
    const { hostname, protocol } = new URL(base);
    if (!protocol.startsWith('http')) return false;
    if (isLocalApiHost(hostname)) return false;
    return true;
  } catch {
    return false;
  }
}

export function getWakeApiHealthUrl(): string | null {
  const base = getApiBaseUrl();
  return base ? `${base}/api/v1` : null;
}

export function getWakeApiOrigin(): string | null {
  if (!isWakeApiEnabled()) return null;
  const base = getApiBaseUrl();
  if (!base) return null;
  try {
    return new URL(base).origin;
  } catch {
    return null;
  }
}

function readLastWakeAt(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(WAKE_STORAGE_KEY);
    if (!raw) return null;
    const ts = Number(raw);
    return Number.isFinite(ts) ? ts : null;
  } catch {
    return null;
  }
}

function writeLastWakeAt(timestamp: number): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(WAKE_STORAGE_KEY, String(timestamp));
  } catch {
    // Private browsing / storage disabled — still allow the ping.
  }
}

/** Skip if we already sent a wake ping recently in this browser session. */
export function shouldPingWakeApi(now = Date.now()): boolean {
  if (!isWakeApiEnabled()) return false;
  const last = readLastWakeAt();
  if (last === null) return true;
  return now - last >= WAKE_API_THROTTLE_MS;
}

/**
 * Fire-and-forget GET to the API root health endpoint.
 * Wakes Render from sleep; throttled to once per session window.
 */
export function pingWakeApi(): void {
  if (!shouldPingWakeApi()) return;

  const url = getWakeApiHealthUrl();
  if (!url) return;

  // Record before fetch so rapid navigations don't double-ping.
  writeLastWakeAt(Date.now());

  void fetch(url, {
    method: 'GET',
    mode: 'cors',
    credentials: 'omit',
    cache: 'no-store',
    keepalive: true,
  }).catch(() => {
    // Wake is best-effort; login will retry if the instance is still cold.
  });
}
