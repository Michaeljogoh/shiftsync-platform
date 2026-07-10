import { Suspense } from 'react';
import { AuthShell } from '@/components/auth/auth-shell';
import { OAuthCallbackClient } from '@/components/auth/oauth-callback-client';

function CallbackFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="size-8 animate-spin rounded-full border-2 border-brand-green border-t-transparent" />
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <AuthShell
      title="Signing you in"
      description="Hang tight while we finish connecting your Google account."
    >
      <Suspense fallback={<CallbackFallback />}>
        <OAuthCallbackClient />
      </Suspense>
    </AuthShell>
  );
}
