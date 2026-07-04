"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { useNotificationsStore } from "@/lib/stores/notifications.store"
import { useAuthStore } from "@/lib/stores/auth.store"
import {
  CalendarDaysIcon,
  CalendarIcon,
  UsersIcon,
  ArrowLeftRightIcon,
  BarChart3Icon,
  ClockIcon,
  BellIcon,
  FileTextIcon,
  MapPinIcon,
  LayoutDashboardIcon,
  WrenchIcon,
} from "lucide-react"

const navMainItems = [
  { title: "Overview", url: "/dashboard", icon: <LayoutDashboardIcon className="size-4" /> },
  { title: "Schedule", url: "/schedule", icon: <CalendarIcon className="size-4" /> },
  { title: "Staff", url: "/staff", icon: <UsersIcon className="size-4" /> },
  { title: "Swap & Drop", url: "/swaps", icon: <ArrowLeftRightIcon className="size-4" /> },
  { title: "Analytics", url: "/analytics", icon: <BarChart3Icon className="size-4" /> },
  { title: "On-Duty", url: "/on-duty", icon: <ClockIcon className="size-4" /> },
  { title: "Notifications", url: "/notifications", icon: <BellIcon className="size-4" /> },
  { title: "Audit Log", url: "/audit", icon: <FileTextIcon className="size-4" /> },
  { title: "Locations", url: "/locations", icon: <MapPinIcon className="size-4" /> },
  { title: "Skills", url: "/skills", icon: <WrenchIcon className="size-4" /> },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const role = useAuthStore((s) => s.session?.role)
  const unreadCount = useNotificationsStore((s) => s.unreadCount)
  const visibleNavItems = navMainItems.filter((item) => {
    if (item.url === "/audit") return role === "admin" || role === "manager"
    if (item.url === "/staff") return role === "admin" || role === "manager"
    if (item.url === "/locations") return role === "admin"
    if (item.url === "/skills") return role === "admin"
    return true
  })

  const navMainWithActive = visibleNavItems.map((item) => ({
    ...item,
    isActive: pathname === item.url || pathname?.startsWith(item.url + "/"),
    badgeContent: item.title === "Notifications" && unreadCount > 0 ? unreadCount : undefined,
  }))

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b border-sidebar-border/50 px-3 py-4">
        <TeamSwitcher
          teams={[
            {
              name: "ShiftSync",
              logo: <CalendarDaysIcon className="size-4" strokeWidth={2.25} />,
              plan: "Workforce Platform",
            },
          ]}
        />
      </SidebarHeader>
      <SidebarContent className="px-2 py-4">
        <NavMain items={navMainWithActive} />
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border/50 px-2 py-3">
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
