'use client';

import { useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import {
  BadgeCheckIcon,
  ChevronRightIcon,
  SparklesIcon,
  UserPlusIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardHeroSurface } from '@/components/dashboard/home/dashboard-hero-surface';
import {
  CREATE_USER_ROLE_HINTS,
  type CreateUserRole,
} from '@/lib/onboarding/create-user-role-hints';
import { useOnboardingStore } from '@/lib/stores/onboarding.store';
import { cn } from '@/lib/utils';

const DASHBOARD_TOUR_STEPS = [
  {
    step: 1,
    title: 'Go to Staff',
    description: 'Open Staff in the sidebar.',
    icon: UsersIcon,
  },
  {
    step: 2,
    title: 'Add user',
    description: 'Click Add user in the top right.',
    icon: UserPlusIcon,
  },
  {
    step: 3,
    title: 'Set role & login',
    description: 'Choose Staff or Manager, then add email and password.',
    icon: BadgeCheckIcon,
  },
] as const;

const STAFF_PAGE_TOUR_STEPS = [
  {
    step: 1,
    title: 'Add user',
    description: 'Click Add user in the top right of this page.',
    icon: UserPlusIcon,
  },
  {
    step: 2,
    title: 'Choose a role',
    description: 'Pick Staff for frontline shifts or Manager for scheduling.',
    icon: UsersIcon,
  },
  {
    step: 3,
    title: 'Share login details',
    description: 'They sign in with the email and password you set.',
    icon: BadgeCheckIcon,
  },
] as const;

const ROLE_OPTIONS: CreateUserRole[] = ['staff', 'manager'];

interface GettingStartedTourContentProps {
  title: string;
  description: string;
  steps: readonly {
    step: number;
    title: string;
    description: string;
    icon: typeof UsersIcon;
  }[];
  actions: ReactNode;
  headerAction?: ReactNode;
}

function GettingStartedTourContent({
  title,
  description,
  steps,
  actions,
  headerAction,
}: GettingStartedTourContentProps) {
  return (
    <DashboardHeroSurface compact className="px-5 py-6 sm:px-7 sm:py-7">
      <div className="flex items-start justify-between gap-4">
        <div className="max-w-xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-green/30 bg-brand-green/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-green">
              <SparklesIcon className="size-3.5" aria-hidden />
              Getting started
            </span>
            <span className="text-xs text-white/50">3 quick steps</span>
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold tracking-tight text-white sm:text-2xl">
              {title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-white/70 sm:text-base">
              {description}
            </p>
          </div>
        </div>
        {headerAction}
      </div>

      <ol className="mt-6 grid gap-3 sm:grid-cols-3 sm:gap-4">
        {steps.map((item, index) => {
          const Icon = item.icon;
          return (
            <li
              key={item.step}
              className="relative rounded-xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm"
            >
              {index < steps.length - 1 && (
                <ChevronRightIcon
                  className="pointer-events-none absolute -right-2.5 top-1/2 z-10 hidden size-4 -translate-y-1/2 text-white/30 sm:block"
                  aria-hidden
                />
              )}
              <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-green text-sm font-bold text-brand-teal-deep">
                  {item.step}
                </span>
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Icon className="size-3.5 shrink-0 text-brand-green" aria-hidden />
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                  </div>
                  <p className="text-xs leading-relaxed text-white/60">{item.description}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {ROLE_OPTIONS.map((role) => (
          <div
            key={role}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3"
          >
            <p className="text-sm font-semibold text-white">
              {CREATE_USER_ROLE_HINTS[role].label}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-white/60">
              {CREATE_USER_ROLE_HINTS[role].description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">{actions}</div>
    </DashboardHeroSurface>
  );
}

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
    <GettingStartedTourContent
      title="Add your first staff member"
      description="Create a staff or manager account so they can sign in, view schedules, and use ShiftSync with their own role."
      steps={DASHBOARD_TOUR_STEPS}
      headerAction={
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 shrink-0 p-0 text-white/50 hover:bg-white/10 hover:text-white"
          onClick={dismiss}
          aria-label="Dismiss getting started guide"
        >
          <XIcon className="size-4" />
        </Button>
      }
      actions={
        <>
          <Button
            asChild
            className="rounded-full bg-brand-green px-5 text-brand-teal-deep hover:bg-brand-green/90"
          >
            <Link href="/staff?create=1">
              <UserPlusIcon className="mr-1.5 size-4" />
              Add team member
              <ChevronRightIcon className="ml-1 size-4" />
            </Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="text-white/70 hover:bg-white/10 hover:text-white"
            onClick={dismiss}
          >
            Dismiss guide
          </Button>
        </>
      }
    />
  );
}

interface StaffPageGettingStartedTourProps {
  onAddUser: () => void;
}

/** Permanent getting-started tour at the top of the Staff page (admin only). */
export function StaffPageGettingStartedTour({
  onAddUser,
}: StaffPageGettingStartedTourProps) {
  return (
    <GettingStartedTourContent
      title="How to add staff"
      description="Create accounts for your team from this page. Each person signs in with the email and password you assign."
      steps={STAFF_PAGE_TOUR_STEPS}
      actions={
        <Button
          type="button"
          className="rounded-full bg-brand-green px-5 text-brand-teal-deep hover:bg-brand-green/90"
          onClick={onAddUser}
        >
          <UserPlusIcon className="mr-1.5 size-4" />
          Add user
          <ChevronRightIcon className="ml-1 size-4" />
        </Button>
      }
    />
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