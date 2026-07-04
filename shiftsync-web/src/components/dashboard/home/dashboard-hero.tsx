"use client";

import Link from "next/link";
import { CalendarDaysIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DashboardHeroSurface } from "@/components/dashboard/home/dashboard-hero-surface";

interface DashboardHeroProps {
  firstName: string;
  role: string;
  dateLabel: string;
  alertCount?: number;
  className?: string;
}

export function DashboardHero({
  firstName,
  role,
  dateLabel,
  alertCount = 0,
  className,
}: DashboardHeroProps) {
  return (
    <DashboardHeroSurface
      className={cn("px-6 py-7 sm:px-8 sm:py-8", className)}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
            <CalendarDaysIcon className="size-3.5" />
            {dateLabel}
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Good {getDayPart()}, {firstName}
            </h2>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
              Your {role} workspace for Coastal Eats scheduling, coverage, and
              team operations.
            </p>
          </div>
          {alertCount > 0 && (
            <p className="text-sm font-medium text-brand-green">
              {alertCount} item{alertCount > 1 ? "s" : ""} need attention today
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            className="rounded-full bg-brand-green px-5 text-brand-teal-deep hover:bg-brand-green/90"
          >
            <Link href="/schedule">
              Open schedule
              <ChevronRightIcon className="size-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-full border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            <Link href="/on-duty">View on-duty roster</Link>
          </Button>
        </div>
      </div>
    </DashboardHeroSurface>
  );
}

function getDayPart(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
