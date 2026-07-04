import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** DESIGN.md-aligned sheet widths */
export const sheetWidths = {
  /** Simple confirm / small forms — 28rem */
  sm: "w-full sm:max-w-md",
  /** Standard forms — 32rem */
  md: "w-full sm:max-w-lg",
  /** Complex forms — 36rem */
  lg: "w-full sm:max-w-xl",
  /** Detail panels (staff, shift) — 42rem */
  xl: "w-full sm:max-w-2xl",
  /** Wide detail (staff profile, location) — 48rem */
  detail: "w-full sm:max-w-3xl",
} as const;

export type SheetSize = keyof typeof sheetWidths;

export function sheetWidthClass(size: SheetSize = "md") {
  return sheetWidths[size];
}

export const sheetShellClass =
  "flex h-full max-h-svh flex-col gap-0 overflow-hidden p-0 font-display";

export const sheetHeaderClass =
  "shrink-0 space-y-1 border-b border-landing-hairline bg-landing-surface/40 px-6 py-5 pr-14";

export const sheetBodyClass =
  "min-h-0 flex-1 overflow-y-auto px-6 py-5";

export const sheetFooterClass =
  "shrink-0 flex flex-row justify-end gap-2 border-t border-landing-hairline bg-landing-surface/60 px-6 py-4";

export const sheetTabsClass =
  "flex shrink-0 gap-1.5 overflow-x-auto border-b border-landing-hairline bg-white px-6 py-3";

export const sheetSectionClass =
  "rounded-xl border border-landing-hairline bg-white p-4 transition-colors hover:border-brand-green/20 hover:bg-brand-green/[0.02]";

export function SheetField({
  label,
  value,
  children,
  className,
}: {
  label: string;
  value?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-landing-steel">
        {label}
      </p>
      {children ?? (
        <p className="text-sm font-medium leading-relaxed text-brand-teal-deep">
          {value ?? "—"}
        </p>
      )}
    </div>
  );
}

export function SheetSection({
  title,
  description,
  action,
  children,
  className,
  hoverable = true,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
}) {
  return (
    <section
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-landing-hairline bg-white p-4",
        hoverable &&
          "transition-colors duration-200 hover:border-brand-green/25 hover:bg-brand-green/[0.02]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-sm font-semibold text-brand-teal-deep">
            {title}
          </h3>
          {description && (
            <p className="mt-0.5 text-xs leading-relaxed text-landing-steel">
              {description}
            </p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
