"use client";

import Link from "next/link";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { DashboardQuickActions } from "@/components/dashboard/home/dashboard-quick-actions";
import { ArrowLeftRightIcon, PackageOpenIcon } from "lucide-react";

interface StaffSwap {
  id: string;
  status: string;
  type: string;
}

export function StaffDashboardSections({
  upcomingShifts,
  pendingRequests,
  swaps,
  assignmentsLoading,
  swapsLoading,
}: {
  upcomingShifts: number;
  pendingRequests: number;
  swaps: StaffSwap[];
  assignmentsLoading?: boolean;
  swapsLoading?: boolean;
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Upcoming Shifts"
          subtitle="Next 7 days"
          value={upcomingShifts}
          href="/schedule"
          loading={assignmentsLoading}
          change="Published shifts assigned to you"
          footerLink="Open my schedule"
          icon={CalendarIcon}
          accent="green"
        />
        <KpiCard
          title="Pending Requests"
          subtitle="Swaps and drops"
          value={pendingRequests}
          href="/swaps"
          loading={swapsLoading}
          trend={pendingRequests > 0 ? "up" : "neutral"}
          delta={pendingRequests > 0 ? `${pendingRequests} open` : undefined}
          change="Awaiting peer or manager action"
          footerLink="Manage requests"
          icon={ArrowLeftRightIcon}
          accent="purple"
        />
        <KpiCard
          title="Hours This Week"
          subtitle="Projected total"
          value={`~${Math.min(upcomingShifts * 6, 40)}h`}
          href="/analytics"
          loading={assignmentsLoading}
          change="Based on assigned shifts"
          footerLink="View hours projection"
          icon={ClockIcon}
          accent="teal"
          className="hidden sm:block"
        />
        <KpiCard
          title="Notifications"
          subtitle="In-app alerts"
          value={pendingRequests}
          href="/notifications"
          change="Unread action items"
          footerLink="Open notifications"
          icon={PackageOpenIcon}
          accent="orange"
          className="hidden xl:block"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 lg:items-stretch">
        <div className="flex min-h-0 lg:col-span-2">
          <DashboardCard
            title="My Swap and Drop Requests"
            description="Track status of your active requests"
            hoverable
            fillHeight
            className="w-full"
            action={
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-brand-green-dark"
              >
                <Link href="/swaps">View all</Link>
              </Button>
            }
          >
            {swapsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
              </div>
            ) : swaps.length === 0 ? (
              <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-landing-hairline bg-landing-surface/50 px-4 text-center">
                <p className="text-sm font-medium text-brand-teal-deep">
                  No active requests
                </p>
                <p className="mt-1 text-xs text-landing-steel">
                  Submit a swap or drop from the schedule when you need coverage.
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {swaps.slice(0, 6).map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between rounded-xl border border-landing-hairline bg-landing-surface/50 px-4 py-3.5"
                  >
                    <div>
                      <Badge
                        variant="outline"
                        className="capitalize border-landing-hairline"
                      >
                        {s.type.replace("_", " ")}
                      </Badge>
                    </div>
                    <Badge
                      variant={
                        s.status.startsWith("pending") ? "default" : "secondary"
                      }
                      className="capitalize text-xs"
                    >
                      {s.status.replace("_", " ")}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </DashboardCard>
        </div>

        <div className="flex min-h-0 w-full">
          <DashboardQuickActions role="staff" />
        </div>
      </div>
    </>
  );
}
