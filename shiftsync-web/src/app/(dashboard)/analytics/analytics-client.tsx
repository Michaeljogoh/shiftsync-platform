"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Legend,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api/client/client";
import { queryKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/lib/stores/auth.store";
import { FullPageError } from "@/components/shared/FullPageError";
import { PermissionDenied } from "@/components/shared/PermissionDenied";
import { AnalyticsSkeleton } from "@/components/shared/AnalyticsSkeleton";
import {
  PaginationControls,
  usePagination,
} from "@/components/shared/PaginationControls";
import { FilterSelect } from "@/components/dashboard/filter-select";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { PageHeader } from "@/components/dashboard/page-header";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CHART_COLORS,
  chartAxisStyle,
  chartTooltipStyle,
} from "@/components/dashboard/chart-theme";
import type { LocationSummary } from "@/lib/api/server/locations";
import { AlertTriangleIcon, TrendingUpIcon, StarIcon } from "lucide-react";

const DEFAULT_HOURLY_RATE = 15;

type OvertimeRow = { userId: string; name: string; projectedHours: number };
type OvertimeRowWithCost = OvertimeRow & { overtimeHours: number; cost: number };

function getWeekStart(date: Date): string {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0, 10);
}

function getDateRange(days: number): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

interface AnalyticsClientProps {
  locations: LocationSummary[];
}

type MyAssignment = {
  id: string;
  status: string;
  shift?: { startAt: string; endAt: string };
};

export function AnalyticsClient({ locations }: AnalyticsClientProps) {
  const session = useAuthStore((s) => s.session);
  const role = session?.role;
  const userId = session?.user?.id;

  const [locationId, setLocationId] = useState<string>("");
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [dateRange, setDateRange] = useState(() => getDateRange(14));
  const [fairnessLocationId, setFairnessLocationId] = useState<string>("");
  const [fairnessPeriod, setFairnessPeriod] = useState(() => getDateRange(28));
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [understaffedPage, setUnderstaffedPage] = useState(1);
  const [overtimePage, setOvertimePage] = useState(1);
  const [fairnessPage, setFairnessPage] = useState(1);

  const weekEnd = useMemo(() => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  }, [weekStart]);

  const { data: myAssignments = [], isLoading: myAssignmentsLoading } = useQuery<
    MyAssignment[]
  >({
    queryKey: ["analytics", "my-hours", userId, weekStart],
    queryFn: async () => {
      const { data } = await apiClient.get<
        MyAssignment[]
      >(`/users/${userId}/assignments?startDate=${weekStart}&endDate=${weekEnd}`);
      return data;
    },
    enabled: role === "staff" && !!userId,
    staleTime: 60_000,
  });

  const myProjectedHours = useMemo(() => {
    let total = 0;
    for (const a of myAssignments) {
      const s = a.shift;
      if (!s?.startAt || !s?.endAt) continue;
      const start = new Date(s.startAt);
      const end = new Date(s.endAt);
      total += (end.getTime() - start.getTime()) / (60 * 60 * 1000);
    }
    return Math.round(total * 10) / 10;
  }, [myAssignments]);

  if (role === "staff") {
    return (
      <div className="mx-auto max-w-[1400px] space-y-6">
        <PageHeader title="Analytics" description="Track your weekly hours and schedule load." />
        <DashboardCard
          title="My weekly hours"
          description="Projected hours for the selected week (based on your scheduled assignments)."
          hoverable
          action={
            <input
              type="date"
              className="rounded border border-input bg-background px-2 py-1 text-sm text-foreground"
              value={weekStart}
              onChange={(e) => setWeekStart(getWeekStart(new Date(e.target.value)))}
            />
          }
        >
          {myAssignmentsLoading ? (
            <Skeleton className="h-10 w-40" />
          ) : (
            <div className="flex items-end gap-3">
              <p className="text-3xl font-bold text-brand-teal-deep">
                {myProjectedHours}h
              </p>
              <Badge
                variant={
                  myProjectedHours >= 40
                    ? "destructive"
                    : myProjectedHours >= 35
                      ? "secondary"
                      : "outline"
                }
                className="mb-1"
              >
                {myProjectedHours >= 40
                  ? "Over 40h"
                  : myProjectedHours >= 35
                    ? "Approaching 40h"
                    : "Normal"}
              </Badge>
            </div>
          )}
        </DashboardCard>
      </div>
    );
  }

  const {
    data: overtime = [],
    isLoading: overtimeLoading,
    isError: overtimeError,
    error: overtimeErr,
    refetch: refetchOvertime,
  } = useQuery<OvertimeRow[]>({
    queryKey: queryKeys.analytics.overtime(locationId || undefined, weekStart),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (locationId) params.set("locationId", locationId);
      params.set("weekStart", weekStart);
      const { data } = await apiClient.get<OvertimeRow[]>(
        `/analytics/overtime?${params.toString()}`,
      );
      return data;
    },
    enabled: role === "admin" || role === "manager",
  });

  const statusCode = (overtimeErr as { response?: { status?: number } })
    ?.response?.status;

  const { data: hoursDist = [], isLoading: hoursLoading } = useQuery({
    queryKey: [
      "analytics",
      "hours",
      locationId || undefined,
      dateRange.startDate,
      dateRange.endDate,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (locationId) params.set("locationId", locationId);
      params.set("startDate", dateRange.startDate);
      params.set("endDate", dateRange.endDate);
      const { data } = await apiClient.get(
        `/analytics/hours-distribution?${params.toString()}`,
      );
      return data;
    },
    enabled: role === "admin" || role === "manager",
  });

  const locId = fairnessLocationId || (locations[0]?.id ?? "");
  const { data: fairness, isLoading: fairnessLoading } = useQuery({
    queryKey: queryKeys.analytics.fairness(
      locId,
      `${fairnessPeriod.startDate}_${fairnessPeriod.endDate}`,
    ),
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("locationId", locId);
      params.set("startDate", fairnessPeriod.startDate);
      params.set("endDate", fairnessPeriod.endDate);
      const { data } = await apiClient.get(
        `/analytics/fairness?${params.toString()}`,
      );
      return data;
    },
    enabled: (role === "admin" || role === "manager") && !!locId,
  });

  const today = new Date().toISOString().slice(0, 10);
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().slice(0, 10);

  const { data: understaffed = [], isLoading: understaffedLoading } = useQuery({
    queryKey: ["analytics", "understaffed", locationId || undefined],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (locationId) params.set("locationId", locationId);
      params.set("startDate", today);
      params.set("endDate", nextWeekStr);
      const { data } = await apiClient.get(
        `/analytics/understaffed?${params.toString()}`,
      );
      return data;
    },
    enabled: role === "admin" || role === "manager",
  });

  const overtimeWithCost = useMemo<OvertimeRowWithCost[]>(
    () =>
      overtime.map(
        (row) => ({
          ...row,
          overtimeHours: Math.max(0, row.projectedHours - 40),
          cost:
            Math.max(0, row.projectedHours - 40) * DEFAULT_HOURLY_RATE * 1.5,
        }),
      ),
    [overtime],
  );

  const understaffedTyped = understaffed as {
    shiftId: string;
    title: string;
    needed: number;
    assigned: number;
  }[];
  const understaffedPagination = usePagination(understaffedTyped, 5);
  const overtimePagination = usePagination(overtimeWithCost, 10);
  const fairnessStaff = fairness?.staff ?? [];
  const fairnessPagination = usePagination(
    fairnessStaff as {
      userId: string;
      name: string;
      totalShiftsAssigned: number;
      premiumShiftsAssigned: number;
      premiumRatio: number;
      deviationFromAverage?: number;
      flagged?: boolean;
    }[],
    10,
  );

  if (overtimeLoading) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-8">
        <PageHeader title="Analytics" description="Workforce insights, overtime tracking, and fairness reporting." />
        <AnalyticsSkeleton />
      </div>
    );
  }

  if (overtimeError) {
    if (statusCode === 403) return <PermissionDenied />;
    return (
      <FullPageError
        message="Failed to load analytics."
        onRetry={() => refetchOvertime()}
      />
    );
  }

  const maxHours = Math.max(
    ...(hoursDist as { totalHours: number }[]).map((r) => r.totalHours),
    1,
  );

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      <PageHeader title="Analytics" description="Workforce insights, overtime tracking, and fairness reporting." />

      <FilterBar>
        <FilterSelect
          value={locationId}
          onValueChange={(v) => {
            setLocationId(v);
            setUnderstaffedPage(1);
            setOvertimePage(1);
          }}
          placeholder="All locations"
          options={locations.map((loc) => ({ value: loc.id, label: loc.name }))}
        />
      </FilterBar>

      {/* Understaffed shifts */}
      <DashboardCard
        title="Understaffed shifts (next 7 days)"
        description="Published shifts that don't have full headcount"
        hoverable
        action={<AlertTriangleIcon className="size-4 text-amber-500" />}
      >
          {understaffedLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-full rounded" />
              ))}
            </div>
          ) : understaffed.length === 0 ? (
            <p className="text-sm text-landing-steel">
              All shifts fully staffed.
            </p>
          ) : (
            <>
              <div className="space-y-2">
                {understaffedPagination.paginate(understaffedPage).map((s) => (
                  <div
                    key={s.shiftId}
                    className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-900 dark:bg-amber-950/30"
                  >
                    <span className="text-sm font-medium text-brand-teal-deep">
                      {s.title}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-amber-600 border-amber-400"
                    >
                      {s.assigned}/{s.needed} filled
                    </Badge>
                  </div>
                ))}
              </div>
              <PaginationControls
                currentPage={understaffedPage}
                totalPages={understaffedPagination.totalPages}
                onPageChange={setUnderstaffedPage}
              />
            </>
          )}
      </DashboardCard>

      {/* Overtime */}
      <DashboardCard
        title="Overtime dashboard"
        description="Projected hours this week. Red ≥40h, amber ≥35h."
        hoverable
        action={
          <>
            <TrendingUpIcon className="size-4 text-destructive" />
            <input
              type="date"
              className="rounded border border-input bg-background px-2 py-1 text-sm text-foreground"
              value={weekStart}
              onChange={(e) => {
                setWeekStart(getWeekStart(new Date(e.target.value)));
                setOvertimePage(1);
              }}
            />
          </>
        }
      >
          {overtimeWithCost.length === 0 ? (
            <p className="text-sm text-landing-steel">
              No staff over 35h this week.
            </p>
          ) : (
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={overtimeWithCost}
                  margin={{ top: 4, right: 8, left: -16, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={CHART_COLORS.grid}
                  />
                  <XAxis
                    dataKey="name"
                    tick={chartAxisStyle.tick}
                    axisLine={chartAxisStyle.axisLine}
                    angle={-30}
                    textAnchor="end"
                  />
                  <YAxis tick={chartAxisStyle.tick} axisLine={chartAxisStyle.axisLine} />
                  <Tooltip
                    {...chartTooltipStyle}
                    formatter={(v: number, name: string) => [
                      name === "projectedHours" ? `${v}h` : `$${v.toFixed(0)}`,
                      name === "projectedHours" ? "Projected hrs" : "OT cost",
                    ]}
                  />
                  <ReferenceLine
                    y={40}
                    stroke="var(--destructive)"
                    strokeDasharray="4 4"
                    label={{
                      value: "40h",
                      fontSize: 10,
                      fill: "var(--destructive)",
                    }}
                  />
                  <ReferenceLine
                    y={35}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    label={{ value: "35h", fontSize: 10, fill: "#f59e0b" }}
                  />
                  <Bar
                    dataKey="projectedHours"
                    radius={[4, 4, 0, 0]}
                    name="projectedHours"
                  >
                    {overtimeWithCost.map(
                      (row: { projectedHours: number }, idx: number) => (
                        <Cell
                          key={idx}
                          fill={
                            row.projectedHours >= 40
                              ? CHART_COLORS.accentOrange
                              : row.projectedHours >= 35
                                ? "#f59e0b"
                                : CHART_COLORS.primary
                          }
                        />
                      ),
                    )}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead>OT hrs</TableHead>
                    <TableHead>Est. cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overtimePagination
                    .paginate(overtimePage)
                    .map(
                      (row) => (
                        <TableRow
                          key={row.userId}
                          className={row.projectedHours >= 40 ? "bg-destructive/10" : row.projectedHours >= 35 ? "bg-amber-50 dark:bg-amber-950/20" : ""}
                        >
                          <TableCell>{row.name}</TableCell>
                          <TableCell>{row.projectedHours}h</TableCell>
                          <TableCell>
                            {row.overtimeHours > 0
                              ? `${row.overtimeHours}h`
                              : "—"}
                          </TableCell>
                          <TableCell>
                            {row.cost > 0 ? `$${row.cost.toFixed(0)}` : "—"}
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                </TableBody>
              </Table>
              <PaginationControls
                currentPage={overtimePage}
                totalPages={overtimePagination.totalPages}
                onPageChange={setOvertimePage}
              />
            </div>
          )}
      </DashboardCard>

      {/* Hours distribution */}
      <DashboardCard
        title="Hours distribution"
        description="Total hours per staff in date range"
        hoverable
        action={
          <div className="flex gap-2">
            <input
              type="date"
              className="rounded border border-input bg-background px-2 py-1 text-sm text-foreground"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange((r) => ({ ...r, startDate: e.target.value }))
              }
            />
            <input
              type="date"
              className="rounded border border-input bg-background px-2 py-1 text-sm text-foreground"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange((r) => ({ ...r, endDate: e.target.value }))
              }
            />
          </div>
        }
      >
          {hoursLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-6 w-full rounded" />
              ))}
            </div>
          ) : hoursDist.length === 0 ? (
            <p className="text-sm text-landing-steel">
              No data for this range.
            </p>
          ) : (
            <div className="space-y-4">
              <ResponsiveContainer
                width="100%"
                height={Math.max(120, hoursDist.length * 24)}
              >
                <BarChart
                  layout="vertical"
                  data={hoursDist as { name: string; totalHours: number }[]}
                  margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={CHART_COLORS.grid}
                  />
                  <XAxis type="number" tick={chartAxisStyle.tick} axisLine={chartAxisStyle.axisLine} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={chartAxisStyle.tick}
                    axisLine={chartAxisStyle.axisLine}
                    width={80}
                  />
                  <Tooltip
                    {...chartTooltipStyle}
                    formatter={(v: number) => [`${v}h`, "Hours"]}
                  />
                  <ReferenceLine
                    x={40}
                    stroke="var(--destructive)"
                    strokeDasharray="3 3"
                  />
                  <Bar
                    dataKey="totalHours"
                    radius={[0, 4, 4, 0]}
                    fill={CHART_COLORS.primary}
                  >
                    {(hoursDist as { totalHours: number }[]).map(
                      (_: unknown, idx: number) => (
                        <Cell
                          key={idx}
                          fill={
                            (hoursDist as { totalHours: number }[])[idx]
                              .totalHours >= 40
                              ? CHART_COLORS.accentOrange
                              : (hoursDist as { totalHours: number }[])[idx]
                                    .totalHours >= 35
                                ? CHART_COLORS.primarySoft
                                : CHART_COLORS.primary
                          }
                        />
                      ),
                    )}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
      </DashboardCard>

      {/* Fairness */}
      <DashboardCard
        title="Fairness report"
        description="Premium shift distribution equity across staff"
        hoverable
        action={
          <>
            <StarIcon className="size-4 text-amber-400" />
            <div className="flex flex-wrap gap-2">
              <FilterSelect
                value={fairnessLocationId}
                onValueChange={(v) => {
                  setFairnessLocationId(v);
                  setFairnessPage(1);
                }}
                placeholder="First location"
                options={locations.map((loc) => ({ value: loc.id, label: loc.name }))}
                className="min-w-0"
                triggerClassName="sm:min-w-[9rem]"
              />
              <FilterSelect
                value={selectedStaffId}
                onValueChange={setSelectedStaffId}
                placeholder="All staff"
                options={(fairness?.staff ?? []).map(
                  (s: { userId: string; name: string }) => ({
                    value: s.userId,
                    label: s.name,
                  }),
                )}
                className="min-w-0"
                triggerClassName="sm:min-w-[9rem]"
              />
              <input
                type="date"
                className="rounded border border-input bg-background px-2 py-1 text-sm text-foreground"
                value={fairnessPeriod.startDate}
                onChange={(e) => {
                  setFairnessPeriod((p) => ({ ...p, startDate: e.target.value }));
                  setFairnessPage(1);
                }}
              />
              <input
                type="date"
                className="rounded border border-input bg-background px-2 py-1 text-sm text-foreground"
                value={fairnessPeriod.endDate}
                onChange={(e) => {
                  setFairnessPeriod((p) => ({ ...p, endDate: e.target.value }));
                  setFairnessPage(1);
                }}
              />
            </div>
          </>
        }
      >
          {fairnessLoading && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-8 w-full rounded" />
              ))}
            </div>
          )}
          {!fairnessLoading && fairness && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div>
                  <p className="text-xs text-landing-steel">
                    Fairness score
                  </p>
                  <p
                    className={`text-2xl font-bold ${fairness.fairnessScore >= 0.85 ? "text-green-600" : fairness.fairnessScore >= 0.6 ? "text-amber-500" : "text-destructive"}`}
                  >
                    {Math.round((fairness.fairnessScore ?? 0) * 100)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-landing-steel">
                    Team avg premium ratio
                  </p>
                  <p className="text-lg font-semibold text-brand-teal-deep">
                    {((fairness.averagePremiumRatio ?? 0) * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              {selectedStaffId &&
                (() => {
                  const staff = (fairness.staff ?? []).find(
                    (s: { userId: string }) => s.userId === selectedStaffId,
                  ) as
                    | {
                        userId: string;
                        name: string;
                        totalShiftsAssigned: number;
                        premiumShiftsAssigned: number;
                        premiumRatio: number;
                        deviationFromAverage: number;
                        flagged?: boolean;
                      }
                    | undefined;
                  if (!staff) return null;
                  return (
                    <div
                      className={`rounded-lg border px-3 py-2 text-sm ${staff.flagged ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20" : "border-landing-hairline bg-landing-surface/50"}`}
                    >
                      <p className="font-medium text-brand-teal-deep">
                        {staff.name}
                      </p>
                      <p className="text-landing-steel">
                        Premium: {staff.premiumShiftsAssigned} /{" "}
                        {staff.totalShiftsAssigned} shifts (
                        {(staff.premiumRatio * 100).toFixed(0)}%)
                      </p>
                      <p className="text-landing-steel">
                        Deviation:{" "}
                        <strong
                          className={
                            staff.deviationFromAverage > 0.1
                              ? "text-green-600"
                              : staff.deviationFromAverage < -0.1
                                ? "text-destructive"
                                : "text-brand-teal-deep"
                          }
                        >
                          {(staff.deviationFromAverage * 100).toFixed(0)}%
                        </strong>
                      </p>
                      {staff.flagged && (
                        <Badge
                          variant="outline"
                          className="mt-1 border-amber-400 text-amber-600"
                        >
                          Flagged —{" "}
                          {staff.deviationFromAverage > 0
                            ? "over-allocated premium"
                            : "under-allocated premium"}
                        </Badge>
                      )}
                    </div>
                  );
                })()}

              {(fairness.staff ?? []).length > 0 && (
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart
                    data={(fairness.staff ?? [])
                      .slice(0, 8)
                      .map((s: { name: string; premiumRatio: number }) => ({
                        name: s.name.split(" ")[0],
                        ratio: Math.round(s.premiumRatio * 100),
                      }))}
                  >
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <Radar
                      name="Premium %"
                      dataKey="ratio"
                      stroke={CHART_COLORS.primary}
                      fill={CHART_COLORS.primary}
                      fillOpacity={0.3}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </RadarChart>
                </ResponsiveContainer>
              )}

              <Table className="min-w-[500px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff</TableHead>
                    <TableHead>Total shifts</TableHead>
                    <TableHead>Premium</TableHead>
                    <TableHead>Ratio</TableHead>
                    <TableHead>vs avg</TableHead>
                    <TableHead>Flag</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fairnessPagination
                    .paginate(fairnessPage)
                    .map(
                      (s: {
                        userId: string;
                        name: string;
                        totalShiftsAssigned: number;
                        premiumShiftsAssigned: number;
                        premiumRatio: number;
                        deviationFromAverage?: number;
                        flagged?: boolean;
                      }) => (
                        <TableRow
                          key={s.userId}
                          className={s.userId === selectedStaffId ? "bg-brand-green/[0.06]" : ""}
                        >
                          <TableCell>{s.name}</TableCell>
                          <TableCell>{s.totalShiftsAssigned}</TableCell>
                          <TableCell>
                            {s.premiumShiftsAssigned}
                          </TableCell>
                          <TableCell>
                            {(s.premiumRatio * 100).toFixed(0)}%
                          </TableCell>
                          <TableCell
                            className={(s.deviationFromAverage ?? 0) > 0 ? "text-green-600" : (s.deviationFromAverage ?? 0) < -0.1 ? "text-destructive" : ""}
                          >
                            {s.deviationFromAverage != null
                              ? `${(s.deviationFromAverage * 100).toFixed(0)}%`
                              : "—"}
                          </TableCell>
                          <TableCell>
                            {s.flagged ? (
                              <Badge
                                variant="outline"
                                className="text-xs border-amber-400 text-amber-600"
                              >
                                ⚠
                              </Badge>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                </TableBody>
              </Table>
              <PaginationControls
                currentPage={fairnessPage}
                totalPages={fairnessPagination.totalPages}
                onPageChange={setFairnessPage}
              />
            </div>
          )}
      </DashboardCard>

      {/* Hours bar chart for selected location range */}
      {!hoursLoading && hoursDist.length > 0 && (
        <DashboardCard
          title={`Hours bar — max ${maxHours.toFixed(0)}h`}
          description="Comparison of all staff hours in selected period"
          hoverable
        >
            <div className="space-y-1.5">
              {(
                hoursDist as {
                  userId: string;
                  name: string;
                  totalHours: number;
                }[]
              ).map((row) => (
                <div key={row.userId} className="flex items-center gap-2">
                  <div className="w-28 truncate text-sm text-brand-teal-deep">
                    {row.name}
                  </div>
                  <div className="h-4 flex-1 overflow-hidden rounded bg-landing-surface">
                    <div
                      className="h-full rounded transition-all"
                      style={{
                        width: `${Math.min(100, (row.totalHours / maxHours) * 100)}%`,
                        background:
                          row.totalHours >= 40
                            ? CHART_COLORS.accentOrange
                            : row.totalHours >= 35
                              ? "#f59e0b99"
                              : CHART_COLORS.primary,
                      }}
                    />
                  </div>
                  <span className="w-10 text-right text-sm text-landing-steel">
                    {row.totalHours}h
                  </span>
                </div>
              ))}
            </div>
        </DashboardCard>
      )}
    </div>
  );
}
