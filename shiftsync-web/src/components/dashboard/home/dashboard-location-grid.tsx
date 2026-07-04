import { MapPinIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { DashboardHeroSurface } from "@/components/dashboard/home/dashboard-hero-surface";

export interface LocationStatus {
  id: string;
  name: string;
  isActive: boolean;
  ianaTimezone: string;
}

function formatTimezone(tz: string): string {
  try {
    const parts = tz.split("/");
    return parts[parts.length - 1]?.replace(/_/g, " ") ?? tz;
  } catch {
    return tz;
  }
}

export function DashboardLocationGrid({
  locations,
  loading,
}: {
  locations: LocationStatus[];
  loading?: boolean;
}) {
  const active = locations.filter((l) => l.isActive);

  return (
    <DashboardHeroSurface compact className="flex h-full flex-col">
      <div className="border-b border-white/10 px-5 py-4">
        <h3 className="font-display text-base font-semibold text-white">
          Locations
        </h3>
        <p className="text-sm text-white/65">
          {active.length} active restaurant{active.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid flex-1 gap-2 p-4 sm:grid-cols-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-24 rounded-xl bg-white/10"
            />
          ))
        ) : active.length === 0 ? (
          <p className="col-span-full py-8 text-center text-sm text-white/60">
            No active locations
          </p>
        ) : (
          active.map((location) => (
            <div
              key={location.id}
              className={cn(
                "group/location relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.07] p-4 transition-all duration-200",
                "hover:-translate-y-0.5 hover:border-brand-green/40 hover:bg-brand-green hover:shadow-[0_10px_24px_-8px_rgba(0,237,100,0.35)]",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white transition-colors group-hover/location:text-brand-teal-deep">
                    {location.name}
                  </p>
                  <p className="mt-1 text-xs text-white/65 transition-colors group-hover/location:text-brand-teal-deep/80">
                    {formatTimezone(location.ianaTimezone)}
                  </p>
                </div>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white transition-colors group-hover/location:bg-brand-teal-deep/15 group-hover/location:text-brand-teal-deep">
                  <MapPinIcon className="size-4" />
                </span>
              </div>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-green/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-green transition-colors group-hover/location:bg-brand-teal-deep/10 group-hover/location:text-brand-teal-deep">
                <span className="size-1.5 rounded-full bg-current" />
                Live
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardHeroSurface>
  );
}
