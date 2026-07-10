import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/login-form";
import { getServerAuthConfig } from "@/lib/auth/server-auth-config";

function LoginFormFallback() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-9 w-48 rounded-lg bg-landing-hairline/60" />
      <div className="h-4 w-full max-w-sm rounded bg-landing-hairline/40" />
      <div className="mt-8 space-y-4">
        <div className="h-11 rounded-lg bg-landing-hairline/50" />
        <div className="h-11 rounded-lg bg-landing-hairline/50" />
        <div className="h-11 rounded-full bg-brand-green/30" />
      </div>
    </div>
  );
}

export default async function LoginPage() {
  const { googleEnabled } = await getServerAuthConfig();

  return (
    <AuthShell
      title="Scheduling that keeps every location in sync"
      description="Plan shifts, manage swaps, and give your team real-time visibility across every site."
    >
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm googleEnabled={googleEnabled} />
      </Suspense>
    </AuthShell>
  );
}
