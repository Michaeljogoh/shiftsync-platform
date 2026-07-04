"use client";

import { motion, useReducedMotion } from "framer-motion";
import { easeOut, fadeUp, staggerContainer } from "./motion";

const shifts = [
  {
    title: "Evening service",
    location: "Coastal Eats Downtown",
    time: "4:00 PM - 11:00 PM EST",
    staff: 6,
    needed: 8,
    status: "published" as const,
  },
  {
    title: "Brunch shift",
    location: "Coastal Eats Midtown",
    time: "9:00 AM - 3:00 PM EST",
    staff: 5,
    needed: 5,
    status: "published" as const,
  },
  {
    title: "Bar coverage",
    location: "Coastal Eats West",
    time: "5:00 PM - 12:00 AM PST",
    staff: 2,
    needed: 4,
    status: "draft" as const,
  },
];

export function SchedulePreview() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
      variants={staggerContainer}
      className="relative w-full max-w-lg"
    >
      <div className="absolute -inset-4 rounded-2xl bg-brand-green/10 blur-2xl" aria-hidden />
      <div className="relative overflow-hidden rounded-xl border border-landing-hairline-dark/60 bg-brand-teal-deep shadow-[0_12px_24px_-4px_rgba(0,30,43,0.12)]">
        <div className="flex items-center justify-between border-b border-landing-hairline-dark px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-brand-green" aria-hidden />
            <span className="font-mono text-xs text-landing-muted">Week of Jun 16</span>
          </div>
          <span className="rounded-full bg-brand-green/15 px-2.5 py-0.5 font-display text-[11px] font-semibold text-brand-green">
            Live
          </span>
        </div>

        <div className="space-y-0 p-1">
          {shifts.map((shift) => (
            <motion.div
              key={shift.title}
              variants={fadeUp}
              transition={{ duration: 0.5, ease: easeOut }}
              className="rounded-lg px-3 py-3 transition-colors hover:bg-white/[0.03]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-medium text-white">
                    {shift.title}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-landing-muted">
                    {shift.location}
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-landing-stone">
                    {shift.time}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                      shift.status === "published"
                        ? "bg-brand-green-soft/20 text-brand-green"
                        : "bg-white/10 text-landing-muted"
                    }`}
                  >
                    {shift.status}
                  </span>
                  <p className="mt-1.5 font-mono text-[11px] text-landing-stone">
                    {shift.staff}/{shift.needed} staff
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="border-t border-landing-hairline-dark px-4 py-2.5">
          <p className="font-mono text-[10px] text-landing-stone">
            socket · schedule.published · 2 locations updated
          </p>
        </div>
      </div>
    </motion.div>
  );
}
