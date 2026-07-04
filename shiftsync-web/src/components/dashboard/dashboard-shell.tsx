"use client";

import type React from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useSocketSync } from "@/lib/socket/use-socket-sync";
import { ConstraintFeedbackRoot } from "@/components/constraint-feedback/ConstraintFeedbackRoot";
import { NotificationsStoreSync } from "@/components/notifications-store-sync";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/schedule": "Schedule",
  "/staff": "Staff",
  "/swaps": "Swap & Drop",
  "/analytics": "Analytics",
  "/on-duty": "On-Duty",
  "/notifications": "Notifications",
  "/audit": "Audit Log",
  "/locations": "Locations",
  "/skills": "Skills",
};

function resolvePageTitle(pathname: string | null): string {
  if (!pathname) return "Dashboard";
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  for (const [path, title] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(`${path}/`)) return title;
  }
  return "Dashboard";
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  useSocketSync();
  const pathname = usePathname();
  const pageTitle = resolvePageTitle(pathname);

  return (
    <TooltipProvider>
      <SidebarProvider
        className="dashboard min-h-svh font-display"
        style={
          {
            "--sidebar-width": "16rem",
            "--sidebar-width-icon": "3.25rem",
          } as React.CSSProperties
        }
      >
        <NotificationsStoreSync />
        <ConstraintFeedbackRoot />
        <AppSidebar />
        <SidebarInset className="min-h-svh bg-landing-surface text-brand-teal-deep">
          <DashboardHeader pageTitle={pageTitle} />
          <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
