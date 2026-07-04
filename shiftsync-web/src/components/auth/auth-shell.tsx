import Image from "next/image";
import Link from "next/link";
import { CalendarDaysIcon } from "lucide-react";
import { SchedulePreview } from "@/components/landing/schedule-preview";
import { cn } from "@/lib/utils";

export interface AuthShellProps {
  children: React.ReactNode;
  /** Cover panel headline */
  title?: string;
  /** Cover panel supporting copy */
  description?: string;
  className?: string;
}

export function AuthShell({
  children,
  title = "Scheduling that keeps every location in sync",
  description = "Plan shifts, manage swaps, and give your team real-time visibility across every site.",
  className,
}: AuthShellProps) {
  return (
    <div className={cn("flex min-h-svh bg-white", className)}>
      {/* Cover panel — hidden on small screens */}
      <aside
        className="relative hidden overflow-hidden lg:flex lg:w-1/2 lg:flex-col"
        aria-hidden={false}
      >
        <Image
          src="/auth-cover.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-linear-to-t from-brand-teal-deep via-brand-teal-deep/85 to-brand-teal-deep/55" />

        <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-12">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2.5 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-md transition-colors hover:bg-white/15"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-brand-green text-brand-teal-deep">
              <CalendarDaysIcon className="size-4" strokeWidth={2.25} />
            </span>
            <span className="font-display text-sm font-semibold tracking-tight text-white">
              ShiftSync
            </span>
          </Link>

          <div className="space-y-6">
            <div className="max-w-md space-y-3">
              <h1 className="font-display text-[2rem] font-medium leading-[1.15] tracking-tight text-white xl:text-4xl">
                {title}
              </h1>
              <p className="text-base leading-relaxed text-white/75">{description}</p>
            </div>

            <div className="pointer-events-none scale-[0.92] origin-left opacity-95 xl:scale-100">
              <SchedulePreview />
            </div>
          </div>

          <p className="font-mono text-[11px] uppercase tracking-widest text-white/40">
            Multi-location · Real-time · Role-aware
          </p>
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex w-full flex-col lg:w-1/2">
        <header className="px-6 py-5 sm:px-10 lg:hidden">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-display text-sm font-semibold text-landing-ink"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-brand-green text-brand-teal-deep">
              <CalendarDaysIcon className="size-4" strokeWidth={2.25} />
            </span>
            ShiftSync
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10 lg:py-0">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>
      </main>
    </div>
  );
}
