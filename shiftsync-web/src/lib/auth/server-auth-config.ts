import 'server-only';

function getApiBaseUrl(): string {
  return (
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:4000'
  );
}

export async function getServerAuthConfig(): Promise<{ googleEnabled: boolean }> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/v1/auth/config`, {
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
