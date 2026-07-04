import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export interface PendingSwap {
  id: string;
  type: string;
  status: string;
  createdAt: string;
  initiator?: { firstName: string; lastName: string };
}

export function DashboardPendingSwapsPanel({
  swaps,
  loading,
}: {
  swaps: PendingSwap[];
  loading?: boolean;
}) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-landing-hairline bg-white shadow-[0_1px_2px_rgba(0,30,43,0.04)]">
      <div className="flex items-center justify-between border-b border-landing-hairline/80 px-5 py-4">
        <div>
          <h3 className="font-display text-base font-semibold text-brand-teal-deep">
            Pending Approvals
          </h3>
          <p className="text-sm text-landing-steel">Swap and drop requests</p>
        </div>
        <Link
          href="/swaps"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-green-dark hover:underline"
        >
          Review all
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
        ) : swaps.length === 0 ? (
          <div className="flex h-full min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-landing-hairline bg-landing-surface/60 px-4 text-center">
            <p className="text-sm font-medium text-brand-teal-deep">
              Queue is clear
            </p>
            <p className="mt-1 text-xs text-landing-steel">
              No swap requests waiting for approval.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {swaps.slice(0, 5).map((swap) => (
              <li
                key={swap.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-landing-hairline/80 bg-landing-surface/40 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-brand-teal-deep">
                    {swap.initiator
                      ? `${swap.initiator.firstName} ${swap.initiator.lastName}`
                      : "Staff member"}
                  </p>
                  <p className="mt-0.5 text-xs capitalize text-landing-steel">
                    {swap.type.replace("_", " ")}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <Badge variant="secondary" className="text-[10px] capitalize">
                    {swap.status.replace("_", " ")}
                  </Badge>
                  <span className="text-[10px] text-landing-muted">
                    {new Date(swap.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
