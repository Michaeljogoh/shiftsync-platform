import Link from "next/link";
import { CircleAlertIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type DashboardAlert = {
  label: string;
  tone: "danger" | "warning" | "info";
  href?: string;
  count?: number;
};

const toneStyles = {
  danger:
    "border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10",
  warning:
    "border-landing-accent-orange/30 bg-landing-accent-orange/10 text-landing-accent-orange hover:bg-landing-accent-orange/15",
  info: "border-brand-green/30 bg-brand-green/10 text-brand-green-dark hover:bg-brand-green/15",
};

export function DashboardAlertsStrip({ alerts }: { alerts: DashboardAlert[] }) {
  if (alerts.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {alerts.map((alert) => {
        const className = cn(
          "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
          toneStyles[alert.tone],
        );

        const content = (
          <>
            <CircleAlertIcon className="size-3.5 shrink-0" />
            {alert.label}
          </>
        );

        if (alert.href) {
          return (
            <Link key={alert.label} href={alert.href} className={className}>
              {content}
            </Link>
          );
        }

        return (
          <div key={alert.label} className={className}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
