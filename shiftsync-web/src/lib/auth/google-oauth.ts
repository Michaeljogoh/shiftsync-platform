function getPublicApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
}

export function getGoogleAuthUrl(returnUrl: string): string {
  const url = new URL(`${getPublicApiBaseUrl()}/api/v1/auth/google`);
  url.searchParams.set('returnUrl', returnUrl);
  return url.toString();
}

export async function fetchAuthConfig(): Promise<{ googleEnabled: boolean }> {
  try {
    const res = await fetch('/api/auth/config', {
      cache: 'no-store',
    });

    if (!res.ok) {
      return { googleEnabled: false };
    }

    return (await res.json()) as { googleEnabled: boolean };
  } catch {
    return { googleEnabled: false };
  }
}
