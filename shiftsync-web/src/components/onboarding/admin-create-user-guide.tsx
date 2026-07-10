'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import {
  CircleIcon,
  UserPlusIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardCard } from '@/components/dashboard/dashboard-card';
import {
  CREATE_USER_ROLE_HINTS,
  type CreateUserRole,
} from '@/lib/onboarding/create-user-role-hints';
import { useOnboardingStore } from '@/lib/stores/onboarding.store';
import { cn } from '@/lib/utils';

const STEPS = [
  {
    title: 'Open Staff',
    description: 'Go to Staff in the sidebar.',
  },
  {
    title: 'Add user',
    description: 'Click Add user in the top right.',
  },
  {
    title: 'Choose a role',
    description: 'Pick Staff or Manager, then set their email and password.',
  },
] as const;

function useOnboardingGuideVisible(teamMemberCount: number): boolean {
  const dismissed = useOnboardingStore((s) => s.adminCreateUserGuideDismissed);
  const hasHydrated = useOnboardingStore((s) => s._hasHydrated);

  return hasHydrated && !dismissed && teamMemberCount <= 1;
}

interface AdminCreateUserGuideCardProps {
  teamMemberCount: number;
}

export function AdminCreateUserGuideCard({
  teamMemberCount,
}: AdminCreateUserGuideCardProps) {
  const dismiss = useOnboardingStore((s) => s.dismissAdminCreateUserGuide);
  const visible = useOnboardingGuideVisible(teamMemberCount);

  useEffect(() => {
    useOnboardingStore.persist.rehydrate();
  }, []);

  if (!visible) return null;

  return (
    <DashboardCard
      title="Create your first team member"
      description="Add a staff or manager account so they can sign in to ShiftSync."
      hoverable
      action={
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 shrink-0 p-0 text-landing-steel hover:text-brand-teal-deep"
          onClick={dismiss}
          aria-label="Dismiss guide"
        >
          <XIcon className="size-4" />
        </Button>
      }
    >
      <div className="space-y-5">
        <ol className="space-y-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-3">
              <span className="mt-0.5 shrink-0 text-landing-muted">
                <CircleIcon className="size-5" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-medium text-brand-teal-deep">
                  <span className="text-landing-steel">{index + 1}.</span>{' '}
                  {step.title}
                </p>
                <p className="text-sm text-landing-steel">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild className="rounded-full bg-brand-green text-brand-teal-deep hover:bg-brand-green/90">
            <Link href="/staff?create=1">
              <UsersIcon className="mr-1.5 size-4" />
              Go to Staff
            </Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-landing-steel"
            onClick={dismiss}
          >
            Dismiss
          </Button>
        </div>
      </div>
    </DashboardCard>
  );
}

interface StaffCreateUserHintProps {
  teamMemberCount: number;
  onAddUser: () => void;
}

export function StaffCreateUserHint({
  teamMemberCount,
  onAddUser,
}: StaffCreateUserHintProps) {
  const dismiss = useOnboardingStore((s) => s.dismissAdminCreateUserGuide);
  const visible = useOnboardingGuideVisible(teamMemberCount);

  useEffect(() => {
    useOnboardingStore.persist.rehydrate();
  }, []);

  if (!visible) return null;

  return (
    <div
      className="flex flex-col gap-3 rounded-xl border border-brand-green/25 bg-brand-green/[0.06] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
      role="note"
    >
      <div className="flex gap-3">
        <UserPlusIcon className="mt-0.5 size-5 shrink-0 text-brand-green-dark" aria-hidden />
        <p className="text-sm text-brand-teal-deep">
          Click <strong>Add user</strong> to create a staff or manager account.
          They&apos;ll sign in with the email and password you set.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2 pl-8 sm:pl-0">
        <Button
          type="button"
          size="sm"
          className="rounded-full bg-brand-green text-brand-teal-deep hover:bg-brand-green/90"
          onClick={onAddUser}
        >
          Add user
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-landing-steel"
          onClick={dismiss}
        >
          Dismiss
        </Button>
      </div>
    </div>
  );
}

interface CreateUserRoleHintProps {
  role: CreateUserRole;
}

export function CreateUserRoleHint({ role }: CreateUserRoleHintProps) {
  const hint = CREATE_USER_ROLE_HINTS[role];

  return (
    <div className="rounded-lg border border-landing-hairline bg-landing-surface/80 px-3 py-2.5 text-sm">
      <p className="font-medium text-brand-teal-deep">Who are you adding?</p>
      <ul className="mt-2 space-y-1.5 text-landing-steel">
        {(['staff', 'manager', 'admin'] as const).map((key) => (
          <li
            key={key}
            className={cn(
              'flex gap-2',
              key === role && 'font-medium text-brand-teal-deep',
            )}
          >
            <span className="shrink-0">•</span>
            <span>
              <strong>{CREATE_USER_ROLE_HINTS[key].label}</strong>
              {' — '}
              {CREATE_USER_ROLE_HINTS[key].description}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2.5 text-xs text-landing-muted">
        Selected: {hint.label}. They&apos;ll sign in with the email and password below.
      </p>
    </div>
  );
}

export function useShowAdminCreateGuide(teamMemberCount: number): boolean {
  return useOnboardingGuideVisible(teamMemberCount);
}
