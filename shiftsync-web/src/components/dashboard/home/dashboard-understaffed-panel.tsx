import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface UnderstaffedShift {
  shiftId: string;
  title: string;
  needed: number;
  assigned: number;
}

export function DashboardUnderstaffedPanel({
  shifts,
  loading,
}: {
  shifts: UnderstaffedShift[];
  loading?: boolean;
}) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-landing-hairline bg-white shadow-[0_1px_2px_rgba(0,30,43,0.04)]">
      <div className="flex items-center justify-between border-b border-landing-hairline/80 px-5 py-4">
        <div>
          <h3 className="font-display text-base font-semibold text-brand-teal-deep">
            Understaffed Shifts
          </h3>
          <p className="text-sm text-landing-steel">Next 7 days</p>
        </div>
        <Link
          href="/analytics"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-green-dark hover:underline"
        >
          View analytics
          <ArrowUpRightIcon className="size-3.5" />
        </Link>
      </div>

      <div className="flex-1 p-4">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : shifts.length === 0 ? (
          <div className="flex h-full min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-landing-hairline bg-landing-surface/60 px-4 text-center">
            <p className="text-sm font-medium text-brand-teal-deep">
              All shifts covered
            </p>
            <p className="mt-1 text-xs text-landing-steel">
              No understaffed shifts in the next week.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {shifts.slice(0, 5).map((shift) => {
              const gap = shift.needed - shift.assigned;
              const pct = Math.round((shift.assigned / shift.needed) * 100);
              return (
                <li
                  key={shift.shiftId}
                  className="rounded-xl border border-landing-hairline/80 bg-landing-surface/40 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-brand-teal-deep">
                        {shift.title}
                      </p>
                      <p className="mt-0.5 text-xs text-landing-steel">
                        {shift.assigned}/{shift.needed} assigned
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "shrink-0 text-xs",
                        gap >= 2
                          ? "border-destructive/30 text-destructive"
                          : "border-landing-accent-orange/30 text-landing-accent-orange",
                      )}
                    >
                      -{gap} staff
                    </Badge>
                  </div>
                  <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-landing-hairline">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        pct >= 80
                          ? "bg-brand-green"
                          : pct >= 50
                            ? "bg-landing-accent-orange"
                            : "bg-destructive",
                      )}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
