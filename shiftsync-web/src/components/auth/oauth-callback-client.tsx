'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import axios from 'axios';

import { useAuthStore } from '@/lib/stores/auth.store';
import { apiClient } from '@/lib/api/client/client';
import type { LoginResponse } from '@/types/auth';

function getSafeReturnUrl(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/dashboard';
  }
  return value;
}

export function OAuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [message, setMessage] = useState('Completing sign-in…');

  useEffect(() => {
    const code = searchParams.get('code');
    const returnUrl = getSafeReturnUrl(searchParams.get('returnUrl'));

    if (!code) {
      setMessage('Missing sign-in code. Redirecting to login…');
      router.replace('/login');
      return;
    }

    let cancelled = false;

    async function completeSignIn() {
      try {
        const res = await apiClient.post<LoginResponse>('/auth/oauth/exchange', {
          code,
        });
        const { accessToken, refreshToken, session } = res.data;
        setAuth(accessToken, session, true, refreshToken);
        toast.success('Signed in with Google');
        router.replace(returnUrl);
        router.refresh();
      } catch (err) {
        if (cancelled) return;

        const msg = axios.isAxiosError(err)
          ? ((err.response?.data as { message?: string })?.message ??
            'Google sign-in failed. Please try again.')
          : 'Google sign-in failed. Please try again.';

        setMessage(msg);
        toast.error(msg);
        router.replace('/login');
      }
    }

    void completeSignIn();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams, setAuth]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
      <div className="size-8 animate-spin rounded-full border-2 border-brand-green border-t-transparent" />
      <p className="text-sm text-landing-steel">{message}</p>
    </div>
  );
}
