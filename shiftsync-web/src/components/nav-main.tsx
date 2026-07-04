"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ReactNode
    isActive?: boolean
    badgeContent?: number
    items?: { title: string; url: string }[]
  }[]
}) {
  const pathname = usePathname()
  const { state } = useSidebar()
  const collapsed = state === "collapsed"

  return (
    <SidebarGroup className="p-0">
      {!collapsed && (
        <SidebarGroupLabel className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/40">
          Workspace
        </SidebarGroupLabel>
      )}
      <SidebarMenu className="gap-1">
        {items.map((item) => {
          const active =
            item.url === "/"
              ? pathname === "/"
              : pathname === item.url || pathname?.startsWith(item.url + "/")

          const link = (
            <Link
              href={item.url}
              data-nav-link
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 [&_svg]:shrink-0 [&_svg]:size-[1.05rem] active:scale-[0.98]",
                collapsed && "justify-center px-0 py-2.5",
                active
                  ? "bg-brand-green text-brand-teal-deep shadow-[0_2px_8px_rgba(0,237,100,0.25)]"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent/80 hover:text-sidebar-foreground",
              )}
            >
              {item.icon}
              {!collapsed && <span className="truncate">{item.title}</span>}
              {!collapsed && item.badgeContent != null && item.badgeContent > 0 && (
                <span
                  className={cn(
                    "ml-auto flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                    active
                      ? "bg-brand-teal-deep text-brand-green"
                      : "bg-brand-green text-brand-teal-deep",
                  )}
                >
                  {item.badgeContent > 99 ? "99+" : item.badgeContent}
                </span>
              )}
            </Link>
          )

          return (
            <SidebarMenuItem key={item.title}>
              {collapsed ? (
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent
                    side="right"
                    sideOffset={10}
                    className="border-sidebar-border bg-brand-teal-deep font-medium text-white"
                  >
                    {item.title}
                    {item.badgeContent != null && item.badgeContent > 0 && (
                      <span className="ml-1.5 rounded-full bg-brand-green px-1.5 py-0.5 text-[10px] font-bold text-brand-teal-deep">
                        {item.badgeContent > 99 ? "99+" : item.badgeContent}
                      </span>
                    )}
                  </TooltipContent>
                </Tooltip>
              ) : (
                link
              )}
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
