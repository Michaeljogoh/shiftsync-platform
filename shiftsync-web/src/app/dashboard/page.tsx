"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { DashboardHero } from "@/components/dashboard/home/dashboard-hero";
import {
  DashboardAlertsStrip,
  type DashboardAlert,
} from "@/components/dashboard/home/dashboard-alerts-strip";
import { DashboardMetricsChart } from "@/components/dashboard/home/dashboard-metrics-chart";
import { DashboardUnderstaffedPanel } from "@/components/dashboard/home/dashboard-understaffed-panel";
import { DashboardPendingSwapsPanel } from "@/components/dashboard/home/dashboard-pending-swaps-panel";
import { DashboardLocationGrid } from "@/components/dashboard/home/dashboard-location-grid";
import { DashboardQuickActions } from "@/components/dashboard/home/dashboard-quick-actions";
import { StaffDashboardSections } from "@/components/dashboard/home/staff-dashboard-sections";
import {
  CHART_SERIES,
  chartAxisStyle,
  chartTooltipStyle,
} from "@/components/dashboard/chart-theme";
import { apiClient } from "@/lib/api/client/client";
import { useAuthStore } from "@/lib/stores/auth.store";
import { RoleGate } from "@/components/shared/RoleGate";
import {
  ArrowLeftRightIcon,
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  WrenchIcon,
} from "lucide-react";

export default function DashboardPage() {
  const session = useAuthStore((s) => s.session);
  const role = session?.role;

  const today = new Date();
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const weekEndStr = weekEnd.toISOString().slice(0, 10);
  const todayStr = today.toISOString().slice(0, 10);
  const weekStart = (() => {
    const d = new Date(today);
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().slice(0, 10);
  })();

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["dashboard-overview", "users"],
    queryFn: async () => {
      const { data } = await apiClient.get<
        {
          id: string;
          role: string;
          isActive: boolean;
          firstName: string;
          lastName: string;
          email: string;
          createdAt?: string;
        }[]
      >("/users");
      return data;
    },
    enabled: role === "admin" || role === "manager",
  });

  const { data: locations = [], isLoading: locationsLoading } = useQuery({
    queryKey: ["dashboard-overview", "locations"],
    queryFn: async () => {
      const { data } = await apiClient.get<
        { id: string; name: string; isActive: boolean; ianaTimezone: string }[]
      >("/locations");
      return data;
    },
    enabled: role === "admin" || role === "manager",
  });

  const { data: skills = [], isLoading: skillsLoading } = useQuery({
    queryKey: ["dashboard-overview", "skills"],
    queryFn: async () => {
      const { data } =
        await apiClient.get<{ id: string; name: string }[]>("/skills");
      return data;
    },
    enabled: role === "admin",
  });

  const { data: pendingSwaps = [], isLoading: swapsLoading } = useQuery({
    queryKey: ["dashboard-overview", "pending-swaps"],
    queryFn: async () => {
      const { data } = await apiClient.get<
        {
          id: string;
          type: string;
          status: string;
          createdAt: string;
          initiator?: { firstName: string; lastName: string };
        }[]
      >("/swaps?status=pending_manager");
      return data;
    },
    enabled: role === "admin" || role === "manager",
  });

  const { data: overtime = [], isLoading: overtimeLoading } = useQuery({
    queryKey: ["dashboard-overview", "overtime", weekStart],
    queryFn: async () => {
      const { data } = await apiClient.get<
        { userId: string; name: string; projectedHours: number }[]
      >(`/analytics/overtime?weekStart=${weekStart}`);
      return data;
    },
    enabled: role === "admin" || role === "manager",
  });

  const { data: understaffed = [] } = useQuery({
    queryKey: ["dashboard-overview", "understaffed"],
    queryFn: async () => {
      const { data } = await apiClient.get<
        { shiftId: string; title: string; needed: number; assigned: number }[]
      >(`/analytics/understaffed?startDate=${todayStr}&endDate=${weekEndStr}`);
      return data;
    },
    enabled: role === "admin" || role === "manager",
  });

  const userId = session?.user?.id;

  const { data: myAssignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ["dashboard-overview", "my-assignments", userId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ id: string; status: string }[]>(
        `/users/${userId}/assignments?startDate=${todayStr}&endDate=${weekEndStr}`,
      );
      return data;
    },
    enabled: !!userId,
  });

  const { data: mySwaps = [], isLoading: mySwapsLoading } = useQuery({
    queryKey: ["dashboard-overview", "my-swaps", userId],
    queryFn: async () => {
      const { data } = await apiClient.get<
        { id: string; status: string; type: string }[]
      >(`/users/${userId}/swaps`);
      return data;
    },
    enabled: !!userId && role === "staff",
  });

  const { data: auditLogsRaw = [], isLoading: auditLoading } = useQuery({
    queryKey: ["dashboard-overview", "recent-activity"],
    queryFn: async () => {
      const { data } = await apiClient.get<
        {
          id: string;
          action: string;
          entityType: string;
          entityId?: string;
          actorId?: string;
          createdAt: string;
          actor?: { email: string; firstName?: string; lastName?: string };
          location?: { name: string };
        }[]
      >("/audit/logs?limit=4&offset=0");
      return data;
    },
    enabled: role === "admin" || role === "manager",
  });

  const auditLogs = [...auditLogsRaw]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 6);

  const activeStaff = users.filter(
    (u) => u.isActive && u.role === "staff",
  ).length;
  const activeLocations = locations.filter((l) => l.isActive).length;
  const overtimeCount = overtime.filter((o) => o.projectedHours >= 40).length;
  const totalProjectedHours = overtime.reduce(
    (sum, row) => sum + row.projectedHours,
    0,
  );
  const fillRate =
    understaffed.length === 0
      ? 100
      : Math.max(
          0,
          Math.round(
            100 -
              (understaffed.reduce(
                (sum, s) => sum + (s.needed - s.assigned),
                0,
              ) /
                Math.max(
                  understaffed.reduce((sum, s) => sum + s.needed, 0),
                  1,
                )) *
                100,
          ),
        );
  const upcomingShifts = myAssignments.filter(
    (a) => a.status !== "cancelled",
  ).length;
  const pendingMySwaps = mySwaps.filter(
    (s) => s.status === "pending_target" || s.status === "pending_manager",
  ).length;

  const recentStaff = [...users]
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .slice(0, 6);

  const roleChartData = useMemo(() => {
    const counts = { admin: 0, manager: 0, staff: 0 };
    for (const u of users) {
      if (u.role in counts) counts[u.role as keyof typeof counts] += 1;
    }
    return [
      { name: "Staff", value: counts.staff, color: CHART_SERIES[0] },
      { name: "Managers", value: counts.manager, color: CHART_SERIES[1] },
      { name: "Admins", value: counts.admin, color: CHART_SERIES[2] },
    ].filter((d) => d.value > 0);
  }, [users]);

  const hoursChartData = useMemo(
    () =>
      [...overtime]
        .sort((a, b) => b.projectedHours - a.projectedHours)
        .slice(0, 6)
        .map((o) => ({
          name: o.name.split(" ")[0] ?? o.name,
          hours: o.projectedHours,
          fill:
            o.projectedHours >= 40
              ? "#fa6e39"
              : o.projectedHours >= 35
                ? "#7b3ff2"
                : "#00ed64",
        })),
    [overtime],
  );

  const alerts: DashboardAlert[] = [];
  if (understaffed.length > 0)
    alerts.push({
      label: `${understaffed.length} understaffed shift${understaffed.length > 1 ? "s" : ""} this week`,
      tone: "danger",
      href: "/analytics",
      count: understaffed.length,
    });
  if (overtimeCount > 0)
    alerts.push({
      label: `${overtimeCount} staff at or over 40h`,
      tone: "danger",
      href: "/analytics",
    });
  if (overtime.length > overtimeCount && overtime.length > 0)
    alerts.push({
      label: `${overtime.length - overtimeCount} staff approaching overtime`,
      tone: "warning",
      href: "/analytics",
    });
  if (pendingSwaps.length > 0)
    alerts.push({
      label: `${pendingSwaps.length} swap request${pendingSwaps.length > 1 ? "s" : ""} pending`,
      tone: "info",
      href: "/swaps",
    });

  const dateLabel = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const metricsLoading = usersLoading || overtimeLoading || swapsLoading;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 lg:space-y-8">
      <DashboardHero
        firstName={session?.user?.firstName ?? "there"}
        role={role ?? "member"}
        dateLabel={dateLabel}
        alertCount={alerts.length}
      />

      <RoleGate role={["admin", "manager"]}>
        <DashboardAlertsStrip alerts={alerts} />
      </RoleGate>

      {/* ADMIN + MANAGER overview */}
      <RoleGate role={["admin", "manager"]}>
        <section className="grid gap-4 xl:grid-cols-12 xl:gap-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:col-span-5 xl:grid-cols-2">
            <KpiCard
              title="Active Staff"
              subtitle="Certified team members"
              value={activeStaff}
              href="/staff"
              loading={usersLoading}
              change={`${users.length} total users in system`}
              footerLink="Manage staff roster"
              icon={UsersIcon}
              accent="green"
            />
            <KpiCard
              title="Locations"
              subtitle="Coastal Eats restaurants"
              value={activeLocations}
              href="/locations"
              loading={locationsLoading}
              change={`${locations.length} total configured`}
              footerLink="View all locations"
              icon={MapPinIcon}
              accent="teal"
            />
            <KpiCard
              title="Pending Swaps"
              subtitle="Awaiting approval"
              value={pendingSwaps.length}
              href="/swaps"
              loading={swapsLoading}
              trend={pendingSwaps.length > 0 ? "up" : "neutral"}
              delta={
                pendingSwaps.length > 0
                  ? `${pendingSwaps.length} open`
                  : undefined
              }
              footerLink="Review swap queue"
              icon={ArrowLeftRightIcon}
              accent="purple"
            />
            <RoleGate role={["admin"]}>
              <KpiCard
                title="Skills Library"
                subtitle="Roles and certifications"
                value={skills.length}
                href="/skills"
                loading={skillsLoading}
                footerLink="Edit skill definitions"
                icon={WrenchIcon}
                accent="orange"
              />
            </RoleGate>
            <RoleGate role={["manager"]}>
              <KpiCard
                title="My Shifts"
                subtitle="Assigned this week"
                value={upcomingShifts}
                href="/schedule"
                loading={assignmentsLoading}
                footerLink="Open weekly schedule"
                icon={CalendarIcon}
                accent="orange"
              />
            </RoleGate>
          </div>

          <div className="xl:col-span-7">
            <DashboardMetricsChart
              loading={metricsLoading}
              totalHours={totalProjectedHours}
              fillRate={fillRate}
              openSwaps={pendingSwaps.length}
              activeStaff={activeStaff}
              understaffedCount={understaffed.length}
            />
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3 lg:gap-6">
          <DashboardUnderstaffedPanel
            shifts={understaffed}
            loading={false}
          />
          <DashboardPendingSwapsPanel
            swaps={pendingSwaps}
            loading={swapsLoading}
          />
          <DashboardLocationGrid
            locations={locations}
            loading={locationsLoading}
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-5 lg:items-stretch">
          <DashboardCard
            className="lg:col-span-3"
            title="Weekly Hours by Staff"
            description="Top projected hours this week"
            hoverable
            action={
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-brand-green-dark"
              >
                <Link href="/analytics">View analytics</Link>
              </Button>
            }
          >
            {overtimeLoading ? (
              <Skeleton className="h-[240px] w-full rounded-lg" />
            ) : hoursChartData.length === 0 ? (
              <p className="py-12 text-center text-sm text-landing-steel">
                No hours data for this week
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={hoursChartData} barSize={28}>
                  <CartesianGrid
                    stroke={chartAxisStyle.axisLine.stroke}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={chartAxisStyle.tick}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={chartAxisStyle.tick}
                    axisLine={false}
                    tickLine={false}
                    width={32}
                  />
                  <Tooltip {...chartTooltipStyle} />
                  <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                    {hoursChartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </DashboardCard>

          <DashboardCard
            className="lg:col-span-2"
            title="Team Composition"
            description="Users by role"
            hoverable
          >
            {usersLoading ? (
              <Skeleton className="mx-auto h-[200px] w-[200px] rounded-full" />
            ) : roleChartData.length === 0 ? (
              <p className="py-8 text-center text-sm text-landing-steel">
                No users yet
              </p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={roleChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={78}
                      paddingAngle={3}
                    >
                      {roleChartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip {...chartTooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 flex flex-wrap justify-center gap-3">
                  {roleChartData.map((d) => (
                    <div
                      key={d.name}
                      className="flex items-center gap-1.5 text-xs text-landing-steel"
                    >
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: d.color }}
                      />
                      {d.name} ({d.value})
                    </div>
                  ))}
                </div>
              </>
            )}
          </DashboardCard>

          <div className="flex min-h-0 w-full lg:col-span-3">
            <RecentActivityTable logs={auditLogs} loading={auditLoading} />
          </div>

          <div className="flex min-h-0 w-full lg:col-span-2">
            <DashboardQuickActions role={role} />
          </div>
        </section>

        <StaffTable
          recentStaff={recentStaff}
          loading={usersLoading}
          showEmail={role === "admin"}
        />
      </RoleGate>

      {/* STAFF */}
      <RoleGate role={["staff"]}>
        <StaffDashboardSections
          upcomingShifts={upcomingShifts}
          pendingRequests={pendingMySwaps}
          swaps={mySwaps}
          assignmentsLoading={assignmentsLoading}
          swapsLoading={mySwapsLoading}
        />
      </RoleGate>
    </div>
  );
}

function RecentActivityTable({
  logs,
  loading,
}: {
  logs: {
    id: string;
    action: string;
    createdAt: string;
    actor?: { email: string };
    actorId?: string;
  }[];
  loading?: boolean;
}) {
  return (
    <DashboardCard
      title="Recent Activity"
      description="Latest schedule and admin changes"
      action={
        <Button variant="ghost" size="sm" asChild className="text-brand-green-dark">
          <Link href="/audit">Full log</Link>
        </Button>
      }
      noPadding
      hoverable
      fillHeight
      className="w-full"
      contentClassName="flex flex-1 flex-col"
    >
      <div className="flex flex-1 flex-col">
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Actor</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={3}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              </TableRow>
            ))
          ) : logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="py-8 text-center text-landing-steel">
                No recent activity
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="whitespace-nowrap font-mono text-xs text-landing-steel">
                  {log.createdAt
                    ? new Date(log.createdAt).toLocaleString()
                    : "N/A"}
                </TableCell>
                <TableCell className="max-w-[140px] truncate text-landing-steel">
                  {log.actor?.email ?? log.actorId ?? "N/A"}
                </TableCell>
                <TableCell>{log.action}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      </div>
    </DashboardCard>
  );
}

function StaffTable({
  recentStaff,
  loading,
  showEmail,
}: {
  recentStaff: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isActive: boolean;
  }[];
  loading?: boolean;
  showEmail?: boolean;
}) {
  return (
    <DashboardCard
      title="Recent Staff"
      description="Newest team members across locations"
      action={
        <Button variant="ghost" size="sm" asChild className="text-brand-green-dark">
          <Link href="/staff">View all</Link>
        </Button>
      }
      noPadding
      hoverable
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            {showEmail && <TableHead>Email</TableHead>}
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={showEmail ? 4 : 3}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              </TableRow>
            ))
          ) : recentStaff.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={showEmail ? 4 : 3}
                className="py-8 text-center text-landing-steel"
              >
                No staff
              </TableCell>
            </TableRow>
          ) : (
            recentStaff.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">
                  {u.firstName} {u.lastName}
                </TableCell>
                {showEmail && (
                  <TableCell className="text-landing-steel">{u.email}</TableCell>
                )}
                <TableCell>
                  <Badge variant="secondary" className="capitalize text-xs">
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={u.isActive ? "default" : "outline"} className="text-xs">
                    {u.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </DashboardCard>
  );
}
