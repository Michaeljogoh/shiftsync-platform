import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FilterBar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end gap-3 rounded-xl border border-landing-hairline bg-white p-4 shadow-[0_1px_2px_rgba(0,30,43,0.04)] transition-colors duration-200 hover:border-brand-green/20 hover:bg-brand-green/[0.02]",
        className,
      )}
    >
      {children}
    </div>
  );
}
