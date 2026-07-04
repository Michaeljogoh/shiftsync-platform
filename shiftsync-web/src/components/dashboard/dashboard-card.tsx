import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface DashboardCardProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  noPadding?: boolean;
  /** Enable mint hover lift on the card surface */
  hoverable?: boolean;
  /** Stretch card to fill grid/flex parent height */
  fillHeight?: boolean;
  /** Dark teal hero surface (matches dashboard header) */
  variant?: "default" | "hero";
}

export function DashboardCard({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
  noPadding,
  hoverable = false,
  fillHeight = false,
  variant = "default",
}: DashboardCardProps) {
  const isHero = variant === "hero";

  return (
    <Card
      className={cn(
        "group overflow-hidden transition-all duration-200",
        isHero
          ? "rounded-2xl border-white/10 bg-brand-teal-deep shadow-[0_12px_24px_-4px_rgba(0,30,43,0.18)] ring-0"
          : "rounded-xl border-landing-hairline bg-white shadow-[0_1px_2px_rgba(0,30,43,0.04)]",
        fillHeight && "flex h-full flex-col",
        hoverable &&
          !isHero &&
          "hover:-translate-y-0.5 hover:border-brand-green/25 hover:bg-brand-green/[0.02] hover:shadow-[0_8px_24px_-4px_rgba(0,30,43,0.1)]",
        hoverable &&
          isHero &&
          "hover:border-brand-green/25 hover:shadow-[0_16px_32px_-8px_rgba(0,30,43,0.35)]",
        className,
      )}
    >
      {isHero && (
        <>
          <div
            className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-brand-green/15 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-14 left-1/4 size-52 rounded-full bg-brand-teal/35 blur-3xl"
            aria-hidden
          />
        </>
      )}
      <CardHeader
        className={cn(
          "relative flex flex-row items-start justify-between gap-3 px-5 py-4 transition-colors",
          isHero
            ? "border-b border-white/10 bg-white/[0.04]"
            : "border-b border-landing-hairline/80 bg-landing-surface/50 group-hover:bg-brand-green/[0.04]",
        )}
      >
        <div className="space-y-0.5">
          <CardTitle
            className={cn(
              "font-display text-base font-semibold",
              isHero ? "text-white" : "text-brand-teal-deep",
            )}
          >
            {title}
          </CardTitle>
          {description && (
            <CardDescription
              className={cn(
                "text-sm",
                isHero ? "text-white/65" : "text-landing-steel",
              )}
            >
              {description}
            </CardDescription>
          )}
        </div>
        {action}
      </CardHeader>
      <CardContent
        className={cn(
          "relative",
          noPadding ? "p-0" : "px-5 py-4",
          fillHeight && "flex flex-1 flex-col",
          contentClassName,
        )}
      >
        {children}
      </CardContent>
    </Card>
  );
}
