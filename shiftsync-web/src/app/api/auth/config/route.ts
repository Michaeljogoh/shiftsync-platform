import { NextResponse } from 'next/server';

function getApiBaseUrl(): string {
  return (
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:4000'
  );
}

export async function GET() {
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/v1/auth/config`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ googleEnabled: false });
    }

    const data = (await res.json()) as { googleEnabled: boolean };
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ googleEnabled: false });
  }
}
