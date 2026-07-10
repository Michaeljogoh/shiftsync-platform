import type { Request } from 'express';

export function getApiBaseUrl(req: Request): string {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const proto =
    (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto) ||
    req.protocol ||
    'http';

  const forwardedHost = req.headers['x-forwarded-host'];
  const host =
    (Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost) ||
    req.get('host');

  if (!host) {
    throw new Error('Unable to determine API host for OAuth callback');
  }

  return `${proto}://${host}`;
}
