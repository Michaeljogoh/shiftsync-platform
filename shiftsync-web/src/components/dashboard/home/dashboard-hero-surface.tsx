import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const dashboardHeroSurfaceClass =
  "relative overflow-hidden rounded-2xl border border-white/10 bg-brand-teal-deep shadow-[0_12px_24px_-4px_rgba(0,30,43,0.18)]";

interface DashboardHeroSurfaceProps {
  children: ReactNode;
  className?: string;
  /** Smaller glow orbs for nested panels */
  compact?: boolean;
}

export function DashboardHeroSurface({
  children,
  className,
  compact = false,
}: DashboardHeroSurfaceProps) {
  return (
    <div className={cn(dashboardHeroSurfaceClass, className)}>
      <div
        className={cn(
          "pointer-events-none absolute -right-12 -top-12 rounded-full bg-brand-green/20 blur-3xl",
          compact ? "size-36" : "size-56",
        )}
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute -bottom-16 left-1/4 rounded-full bg-brand-teal/40 blur-3xl",
          compact ? "size-48" : "size-72",
        )}
        aria-hidden
      />
      <div className="relative">{children}</div>
    </div>
  );
}
