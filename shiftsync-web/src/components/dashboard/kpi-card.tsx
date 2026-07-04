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

const accentStyles = {
  green: {
    icon: "bg-brand-green/15 text-brand-green-dark group-hover:bg-white/15 group-hover:text-brand-green",
    badge:
      "bg-brand-green/10 text-brand-green-dark border-brand-green/20 group-hover:border-brand-green/30 group-hover:bg-brand-green/20 group-hover:text-brand-green",
  },
  teal: {
    icon: "bg-brand-teal/15 text-brand-teal group-hover:bg-white/15 group-hover:text-white",
    badge:
      "bg-brand-teal/10 text-brand-teal border-brand-teal/20 group-hover:border-white/20 group-hover:bg-white/10 group-hover:text-white/90",
  },
  orange: {
    icon: "bg-landing-accent-orange/15 text-landing-accent-orange group-hover:bg-white/15 group-hover:text-brand-green",
    badge:
      "bg-landing-accent-orange/10 text-landing-accent-orange border-landing-accent-orange/20 group-hover:border-brand-green/30 group-hover:bg-brand-green/20 group-hover:text-brand-green",
  },
  purple: {
    icon: "bg-landing-accent-purple/15 text-landing-accent-purple group-hover:bg-white/15 group-hover:text-brand-green",
    badge:
      "bg-landing-accent-purple/10 text-landing-accent-purple border-landing-accent-purple/20 group-hover:border-brand-green/30 group-hover:bg-brand-green/20 group-hover:text-brand-green",
  },
};

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
  const styles = accentStyles[accent];

  const content = (
    <div
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl border border-landing-hairline bg-white p-5 shadow-[0_1px_2px_rgba(0,30,43,0.04)] transition-all duration-300",
        "hover:-translate-y-0.5 hover:border-white/10 hover:shadow-[0_12px_28px_-6px_rgba(0,30,43,0.28)] active:scale-[0.99]",
        className,
      )}
    >
      {/* Hero surface — fades in on hover */}
      <div
        className="pointer-events-none absolute inset-0 bg-brand-teal-deep opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-brand-green/20 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-12 left-1/4 size-40 rounded-full bg-brand-teal/40 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden
      />

      <span
        className="pointer-events-none absolute -right-4 -top-4 size-16 rounded-full bg-brand-green/[0.06] transition-opacity duration-300 group-hover:opacity-0"
        aria-hidden
      />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-300",
            styles.icon,
          )}
        >
          <Icon className="size-5" strokeWidth={2} />
        </div>
        <div className="flex items-center gap-2">
          {delta && (
            <Badge
              variant="outline"
              className={cn(
                "gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold shadow-none transition-colors duration-300",
                styles.badge,
              )}
            >
              {trend === "up" && <TrendingUpIcon className="size-3" />}
              {trend === "down" && <TrendingDownIcon className="size-3" />}
              {delta}
            </Badge>
          )}
          {href && (
            <ArrowUpRightIcon className="size-4 text-landing-muted opacity-0 transition-all duration-300 group-hover:text-brand-green group-hover:opacity-100" />
          )}
        </div>
      </div>

      <div className="relative z-10 mt-5 space-y-1">
        {loading ? (
          <Skeleton className="h-9 w-24 rounded-md" />
        ) : (
          <p className="font-display text-3xl font-semibold tracking-tight text-brand-teal-deep tabular-nums transition-colors duration-300 group-hover:text-white">
            {value}
          </p>
        )}
        <p className="text-sm font-medium text-brand-teal-deep transition-colors duration-300 group-hover:text-white">
          {title}
        </p>
        {subtitle && (
          <p className="text-xs text-landing-muted transition-colors duration-300 group-hover:text-white/65">
            {subtitle}
          </p>
        )}
      </div>

      {(change || footerLink) && (
        <div className="relative z-10 mt-auto border-t border-landing-hairline/70 pt-3 transition-colors duration-300 group-hover:border-white/10">
          {change && (
            <p
              className={cn(
                "text-xs font-medium transition-colors duration-300",
                trend === "up" && "text-brand-green-dark group-hover:text-brand-green",
                trend === "down" &&
                  "text-landing-accent-orange group-hover:text-brand-green",
                trend === "neutral" &&
                  "text-landing-muted group-hover:text-white/60",
              )}
            >
              {change}
            </p>
          )}
          {footerLink && (
            <p className="mt-1 text-xs font-semibold text-brand-green-dark transition-colors duration-300 group-hover:text-brand-green">
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
