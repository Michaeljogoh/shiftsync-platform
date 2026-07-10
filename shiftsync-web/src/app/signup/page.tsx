import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/signup-form";
import { getServerAuthConfig } from "@/lib/auth/server-auth-config";

function SignupFormFallback() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-9 w-56 rounded-lg bg-landing-hairline/60" />
      <div className="h-4 w-full max-w-sm rounded bg-landing-hairline/40" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="h-11 rounded-lg bg-landing-hairline/50" />
        <div className="h-11 rounded-lg bg-landing-hairline/50" />
      </div>
      <div className="h-11 rounded-lg bg-landing-hairline/50" />
      <div className="h-11 rounded-full bg-brand-green/30" />
    </div>
  );
}

export default async function SignupPage() {
  const { googleEnabled } = await getServerAuthConfig();

  return (
    <AuthShell
      title="Bring your whole team onto one schedule"
      description="From managers to line staff — give everyone the shifts, swaps, and updates they need in one place."
    >
      <Suspense fallback={<SignupFormFallback />}>
        <SignupForm googleEnabled={googleEnabled} />
      </Suspense>
    </AuthShell>
  );
}
