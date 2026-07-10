"use client";

import Link from "next/link";
import { BellIcon } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SocketStatus } from "@/components/shared/SocketStatus";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useNotificationsStore } from "@/lib/stores/notifications.store";
import { formatRoleWorkspace } from "@/lib/auth/role-label";
import { cn } from "@/lib/utils";

export function DashboardHeader({ pageTitle }: { pageTitle: string }) {
  const session = useAuthStore((s) => s.session);
  const unreadCount = useNotificationsStore((s) => s.unreadCount);

  const displayName = session?.user
    ? `${session.user.firstName} ${session.user.lastName}`.trim()
    : "User";
  const initials = session?.user
    ? `${session.user.firstName?.[0] ?? ""}${session.user.lastName?.[0] ?? ""}`
    : "?";
  const roleWorkspace = formatRoleWorkspace(session?.role);

  return (
    <header className="sticky top-0 z-20 shrink-0 border-b border-landing-hairline/80 bg-white/95 backdrop-blur-md supports-backdrop-filter:bg-white/80">
      <div className="grid h-16 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <SidebarTrigger
            className="size-9 shrink-0 rounded-lg text-brand-teal-deep hover:bg-brand-green/10 hover:text-brand-green-dark md:hidden"
            aria-label="Toggle sidebar"
          />
          <h1 className="truncate font-display text-lg font-semibold tracking-tight text-brand-teal-deep sm:text-xl">
            {pageTitle}
          </h1>
        </div>

        <div className="hidden justify-center px-2 sm:flex">
          <div className="rounded-full bg-brand-green-dark px-4 py-2 text-center">
            <p className="font-display text-sm font-semibold capitalize text-white">
              {roleWorkspace}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 sm:gap-3">
          <div className="hidden rounded-full border border-landing-hairline bg-landing-surface/80 px-3 py-1.5 lg:flex">
            <SocketStatus compact />
          </div>

          <Link
            href="/notifications"
            className={cn(
              "relative inline-flex size-10 items-center justify-center rounded-full border border-landing-hairline bg-white text-brand-teal-deep transition-all hover:border-brand-green/30 hover:bg-brand-green/10 hover:text-brand-green-dark active:scale-[0.97]",
            )}
            aria-label={
              unreadCount > 0
                ? `Notifications, ${unreadCount} unread`
                : "Notifications"
            }
          >
            <BellIcon className="size-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-brand-green text-[9px] font-bold text-brand-teal-deep ring-2 ring-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          <div
            className="hidden items-center gap-2.5 rounded-full border border-landing-hairline bg-white py-1 pl-1 pr-3.5 sm:flex"
            title={session?.user?.email ?? undefined}
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-brand-green text-xs font-bold text-brand-teal-deep">
              {initials}
            </span>
            <span className="max-w-[7rem] truncate text-sm font-medium text-brand-teal-deep lg:max-w-[10rem]">
              {displayName}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-center border-t border-landing-hairline/60 px-4 py-2 sm:hidden">
        <div className="rounded-full bg-brand-green-dark px-4 py-1.5 text-center">
          <p className="font-display text-sm font-semibold capitalize text-white">
            {roleWorkspace}
          </p>
        </div>
      </div>
    </header>
  );
}
