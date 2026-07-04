"use client";

import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRightIcon,
  BarChart3Icon,
  CalendarIcon,
  ClockIcon,
  FileTextIcon,
  MapPinIcon,
  PackageOpenIcon,
  UsersIcon,
  WrenchIcon,
} from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { QuickAction } from "@/components/dashboard/quick-action";

type ActionItem = {
  icon: LucideIcon;
  label: string;
  href: string;
  accent?: "green" | "teal" | "orange" | "purple";
};

const BASE_ACTIONS: ActionItem[] = [
  { icon: CalendarIcon, label: "Schedule", href: "/schedule", accent: "green" },
  { icon: UsersIcon, label: "Staff", href: "/staff", accent: "teal" },
  { icon: BarChart3Icon, label: "Analytics", href: "/analytics", accent: "purple" },
  { icon: ArrowLeftRightIcon, label: "Swaps", href: "/swaps", accent: "purple" },
  { icon: ClockIcon, label: "On-Duty", href: "/on-duty", accent: "teal" },
  {
    icon: PackageOpenIcon,
    label: "Alerts",
    href: "/notifications",
    accent: "orange",
  },
];

const STAFF_ACTIONS: ActionItem[] = [
  { icon: CalendarIcon, label: "Schedule", href: "/schedule", accent: "green" },
  { icon: ArrowLeftRightIcon, label: "Swaps", href: "/swaps", accent: "purple" },
  { icon: ClockIcon, label: "On-Duty", href: "/on-duty", accent: "teal" },
  {
    icon: PackageOpenIcon,
    label: "Alerts",
    href: "/notifications",
    accent: "orange",
  },
  { icon: BarChart3Icon, label: "Analytics", href: "/analytics", accent: "green" },
  { icon: UsersIcon, label: "Team", href: "/staff", accent: "teal" },
];

const ADMIN_ACTIONS: ActionItem[] = [
  { icon: MapPinIcon, label: "Locations", href: "/locations", accent: "orange" },
  { icon: WrenchIcon, label: "Skills", href: "/skills", accent: "green" },
  { icon: FileTextIcon, label: "Audit", href: "/audit", accent: "teal" },
];

function buildActions(role: string | undefined): ActionItem[] {
  if (role === "admin") {
    return [
      BASE_ACTIONS[0],
      BASE_ACTIONS[1],
      ADMIN_ACTIONS[0],
      ADMIN_ACTIONS[1],
      BASE_ACTIONS[2],
      BASE_ACTIONS[3],
      BASE_ACTIONS[4],
      ADMIN_ACTIONS[2],
    ];
  }

  if (role === "staff") {
    return STAFF_ACTIONS;
  }

  return BASE_ACTIONS;
}

export function DashboardQuickActions({ role }: { role?: string }) {
  const actions = buildActions(role);

  return (
    <DashboardCard
      title="Quick Actions"
      description="Jump to common tasks"
      hoverable
      fillHeight
      variant="hero"
      className="w-full"
    >
      <div className="grid flex-1 grid-cols-2 auto-rows-fr gap-2.5">
        {actions.map((action) => (
          <QuickAction
            key={action.href + action.label}
            icon={action.icon}
            label={action.label}
            href={action.href}
            accent={action.accent}
            variant="on-dark"
          />
        ))}
      </div>
    </DashboardCard>
  );
}
