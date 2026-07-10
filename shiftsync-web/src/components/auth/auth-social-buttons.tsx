'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';

type AuthSocialButtonsProps = {
  onGoogle: () => void;
  disabled?: boolean;
  googleEnabled?: boolean;
};

export function AuthSocialButtons({
  onGoogle,
  disabled,
  googleEnabled = true,
}: AuthSocialButtonsProps) {
  if (!googleEnabled) {
    return null;
  }

  return (
    <div className="grid gap-3">
      <Button
        onClick={onGoogle}
        variant="outline"
        className="h-11 w-full rounded-full border-landing-hairline bg-white font-medium text-landing-ink shadow-xs hover:bg-landing-surface"
        type="button"
        disabled={disabled}
      >
        <Image alt="Google" src="/logos/google.svg" width={20} height={20} />
        Continue with Google
      </Button>
    </div>
  );
}
