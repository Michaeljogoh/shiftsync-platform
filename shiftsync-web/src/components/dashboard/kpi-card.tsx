"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRightIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface KpiCardProps {
  title: string;
  subtitle?: string;
  value: string | number;
  href?: string;
  footerLink?: string;
  loading?: boolean;
  change?: string;
  delta?: string;
  trend?: "up" | "down" | "neutral";
  icon: LucideIcon;
  accent?: "green" | "teal" | "orange" | "purple";
  className?: string;
}


export function KpiCard({
  title,
  subtitle,
  value,
  href,
  footerLink,
  loading,
  change,
  delta,
  trend = "neutral",
  icon: Icon,
  accent = "green",
  className,
}: KpiCardProps) {
  const content = (
    <div
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-brand-teal-deep p-5 shadow-[0_4px_16px_-4px_rgba(0,30,43,0.3)]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-brand-green/20 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-12 left-1/4 size-40 rounded-full bg-brand-teal/40 blur-2xl"
        aria-hidden
      />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-brand-green",
          )}
        >
          <Icon className="size-5" strokeWidth={2} />
        </div>
        <div className="flex items-center gap-2">
          {delta && (
            <Badge
              variant="outline"
              className="gap-1 rounded-full border-brand-green/30 bg-brand-green/20 px-2 py-0.5 text-[11px] font-semibold text-brand-green shadow-none"
            >
              {trend === "up" && <TrendingUpIcon className="size-3" />}
              {trend === "down" && <TrendingDownIcon className="size-3" />}
              {delta}
            </Badge>
          )}
          {href && (
            <ArrowUpRightIcon className="size-4 text-brand-green" />
          )}
        </div>
      </div>

      <div className="relative z-10 mt-5 space-y-1">
        {loading ? (
          <Skeleton className="h-9 w-24 rounded-md bg-white/10" />
        ) : (
          <p className="font-display text-3xl font-semibold tracking-tight text-white tabular-nums">
            {value}
          </p>
        )}
        <p className="text-sm font-medium text-white">
          {title}
        </p>
        {subtitle && (
          <p className="text-xs text-white/65">
            {subtitle}
          </p>
        )}
      </div>

      {(change || footerLink) && (
        <div className="relative z-10 mt-auto border-t border-white/10 pt-3">
          {change && (
            <p className="text-xs font-medium text-white/60">
              {change}
            </p>
          )}
          {footerLink && (
            <p className="mt-1 text-xs font-semibold text-brand-green">
              {footerLink}
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand-green/40 focus-visible:ring-offset-2"
      >
        {content}
      </Link>
    );
  }

  return content;
}
