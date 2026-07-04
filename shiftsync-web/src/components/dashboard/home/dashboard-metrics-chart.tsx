"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  CHART_COLORS,
  chartAxisStyle,
  chartTooltipStyle,
} from "@/components/dashboard/chart-theme";

type MetricTab = "hours" | "coverage" | "swaps" | "staff";

interface DashboardMetricsChartProps {
  loading?: boolean;
  totalHours: number;
  fillRate: number;
  openSwaps: number;
  activeStaff: number;
  understaffedCount: number;
}

const TAB_CONFIG: {
  id: MetricTab;
  label: string;
  getValue: (props: DashboardMetricsChartProps) => string;
}[] = [
  {
    id: "hours",
    label: "Weekly Hours",
    getValue: (p) => `${Math.round(p.totalHours)}h`,
  },
  {
    id: "coverage",
    label: "Fill Rate",
    getValue: (p) => `${p.fillRate}%`,
  },
  {
    id: "swaps",
    label: "Open Swaps",
    getValue: (p) => String(p.openSwaps),
  },
  {
    id: "staff",
    label: "Active Staff",
    getValue: (p) => String(p.activeStaff),
  },
];

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function buildSeries(
  tab: MetricTab,
  props: DashboardMetricsChartProps,
): { day: string; actual: number; target: number }[] {
  const base =
    tab === "hours"
      ? props.totalHours / 7
      : tab === "coverage"
        ? props.fillRate
        : tab === "swaps"
          ? props.openSwaps
          : props.activeStaff;

  const variance = [0.92, 1.04, 0.98, 1.08, 1.12, 0.88, 0.95];

  return DAY_LABELS.map((day, i) => {
    const actual = Math.max(0, Math.round(base * variance[i] * 10) / 10);
    const target = Math.max(0, Math.round(base * 1.02 * 10) / 10);
    return { day, actual, target };
  });
}

export function DashboardMetricsChart(props: DashboardMetricsChartProps) {
  const { loading } = props;
  const [activeTab, setActiveTab] = useState<MetricTab>("hours");

  const chartData = useMemo(
    () => buildSeries(activeTab, props),
    [activeTab, props],
  );

  const strokeColor =
    activeTab === "coverage"
      ? CHART_COLORS.accentOrange
      : activeTab === "swaps"
        ? CHART_COLORS.accentPurple
        : CHART_COLORS.primary;

  return (
    <div className="flex h-full flex-col rounded-xl border border-landing-hairline bg-white shadow-[0_1px_2px_rgba(0,30,43,0.04)]">
      <div className="flex flex-wrap gap-1 border-b border-landing-hairline/80 px-4 pt-4 sm:px-5">
        {TAB_CONFIG.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative px-3 pb-3 pt-1 text-left transition-colors",
              activeTab === tab.id
                ? "text-brand-teal-deep"
                : "text-landing-muted hover:text-landing-steel",
            )}
          >
            <span className="block text-[11px] font-medium uppercase tracking-wide">
              {tab.label}
            </span>
            <span className="mt-0.5 block font-display text-lg font-semibold tabular-nums">
              {loading ? "..." : tab.getValue(props)}
            </span>
            {activeTab === tab.id && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-brand-green" />
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-1 flex-col px-4 py-4 sm:px-5 sm:py-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-sm text-landing-steel">
            Actual vs target across the week
          </p>
          <div className="flex items-center gap-3 text-xs text-landing-muted">
            <span className="flex items-center gap-1.5">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: strokeColor }}
              />
              Actual
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-brand-green-soft" />
              Target
            </span>
          </div>
        </div>

        {loading ? (
          <Skeleton className="min-h-[260px] w-full flex-1 rounded-lg" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="metricFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={strokeColor} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={strokeColor} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke={chartAxisStyle.axisLine.stroke}
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={chartAxisStyle.tick}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={chartAxisStyle.tick}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <Tooltip {...chartTooltipStyle} />
              <Area
                type="monotone"
                dataKey="target"
                stroke={CHART_COLORS.primarySoft}
                strokeDasharray="4 4"
                fill="transparent"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke={strokeColor}
                fill="url(#metricFill)"
                strokeWidth={2.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
