"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion, useInView } from "framer-motion";
import {
  ArrowLeftRightIcon,
  BarChart3Icon,
  BellIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  ShieldCheckIcon,
  UsersIcon,
  ZapIcon,
} from "lucide-react";
import { LandingNav } from "./landing-nav";
import { SchedulePreview } from "./schedule-preview";
import { easeOut, fadeUp, staggerContainer, scaleIn } from "./motion";

type LandingPageProps = {
  isAuthenticated?: boolean;
};

const locations = [
  "Coastal Eats Downtown",
  "Coastal Eats Midtown",
  "Coastal Eats West",
  "Coastal Eats Pacific",
];

const features = [
  {
    tag: "Scheduling",
    tagColor: "bg-landing-accent-orange",
    icon: CalendarDaysIcon,
    title: "Publish shifts with confidence",
    description:
      "Weekly calendar and list views with location timezone display, draft and publish flows, and constraint-aware staff assignment.",
    tint: "from-brand-teal-deep to-brand-teal",
  },
  {
    tag: "Swaps",
    tagColor: "bg-landing-accent-purple",
    icon: ArrowLeftRightIcon,
    title: "Swap and drop workflows",
    description:
      "Staff submit swap requests or drop shifts. Managers approve in one place. Claim drops without extra approval steps.",
    tint: "bg-landing-surface-feature",
  },
  {
    tag: "Analytics",
    tagColor: "bg-brand-green-dark",
    icon: BarChart3Icon,
    title: "Overtime and fairness insights",
    description:
      "Projected hours, cost estimates, and fairness reports so managers catch risks before they hit payroll.",
    tint: "bg-white",
  },
  {
    tag: "On-duty",
    tagColor: "bg-landing-accent-blue",
    icon: ClockIcon,
    title: "Live roster per location",
    description:
      "See who is on the floor right now. Duty updates stream over WebSocket so the roster stays current.",
    tint: "bg-landing-surface",
  },
  {
    tag: "Constraints",
    tagColor: "bg-landing-accent-pink",
    icon: ShieldCheckIcon,
    title: "Rules enforced at assign time",
    description:
      "Double-booking, rest periods, and consecutive-day limits checked on every assignment with override paths for managers.",
    tint: "bg-brand-teal-deep text-white",
  },
];

const roles = [
  {
    id: "admin",
    label: "Admin",
    headline: "Full platform control",
    points: [
      "Manage users, locations, and skills",
      "Publish schedules across all sites",
      "Export analytics and audit logs",
    ],
  },
  {
    id: "manager",
    label: "Manager",
    headline: "Scoped to your locations",
    points: [
      "Create and publish shifts locally",
      "Approve swaps and review availability",
      "View overtime for your team",
    ],
  },
  {
    id: "staff",
    label: "Staff",
    headline: "Self-service schedule access",
    points: [
      "View published shifts in your timezone",
      "Submit swaps and claim open drops",
      "Set weekly availability windows",
    ],
  },
];

const faqs = [
  {
    q: "Does ShiftSync handle multiple timezones?",
    a: "Yes. Each location stores its IANA timezone. Shift times display in the location zone, with a secondary label when your personal timezone differs.",
  },
  {
    q: "What happens when I assign someone who is already booked?",
    a: "The API blocks overlapping assignments across any location. Managers see a constraint modal with suggested alternatives or can override with a reason.",
  },
  {
    q: "Do schedule changes update in real time?",
    a: "Connected clients receive Socket.IO events for publishes, edits, assignments, and on-duty roster changes. No manual refresh needed.",
  },
];

const socketEvents = [
  "schedule.published",
  "assignment.created",
  "swap.status_changed",
  "duty.update",
  "notification.new",
];

function RevealSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={reduceMotion ? false : "hidden"}
      animate={inView ? "visible" : "hidden"}
      variants={fadeUp}
      transition={{ duration: 0.55, ease: easeOut }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function LandingPage({ isAuthenticated }: LandingPageProps) {
  const reduceMotion = useReducedMotion();
  const [activeRole, setActiveRole] = useState("manager");

  return (
    <div className="landing font-display text-landing-ink antialiased">
      <LandingNav isAuthenticated={isAuthenticated} />

      {/* Hero */}
      <section className="relative min-h-screen overflow-hidden bg-brand-teal-deep">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(0,237,100,0.12),transparent)]"
          aria-hidden
        />
        <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-32 pt-20 sm:px-8 sm:pt-24 lg:grid-cols-2 lg:items-center lg:gap-16 lg:pb-40 lg:pt-28">
          <motion.div
            initial={reduceMotion ? false : "hidden"}
            animate="visible"
            variants={staggerContainer}
            className="max-w-xl"
          >
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5, ease: easeOut }}
              className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-green"
            >
              Multi-location scheduling
            </motion.p>
            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.55, ease: easeOut, delay: 0.05 }}
              className="mt-4 text-4xl font-medium leading-[1.1] tracking-[-0.03em] text-white sm:text-5xl lg:text-[3.5rem]"
            >
              One schedule.
              <br />
              Every location in sync.
            </motion.h1>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.55, ease: easeOut, delay: 0.1 }}
              className="mt-5 max-w-md text-base leading-relaxed text-landing-muted sm:text-lg"
            >
              ShiftSync helps restaurant groups plan shifts, enforce labor rules,
              and keep staff updated across sites in real time.
            </motion.p>
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.55, ease: easeOut, delay: 0.15 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link
                href={isAuthenticated ? "/dashboard" : "/signup"}
                className="inline-flex h-11 items-center rounded-full bg-brand-green px-6 text-sm font-semibold text-landing-ink transition-transform active:scale-[0.97]"
              >
                {isAuthenticated ? "Open dashboard" : "Get started"}
              </Link>
              <a
                href="#features"
                className="inline-flex h-11 items-center rounded-full border border-landing-hairline-dark px-6 text-sm font-semibold text-white transition-transform active:scale-[0.97]"
              >
                See features
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: easeOut, delay: 0.2 }}
            className="flex justify-center lg:justify-end"
          >
            <SchedulePreview />
          </motion.div>
        </div>
      </section>

      {/* Logo wall */}
      <section className="border-b border-landing-hairline bg-white py-12">
        <RevealSection className="mx-auto max-w-7xl px-4 sm:px-8">
          <p className="text-center font-display text-sm font-medium text-landing-steel">
            Built for groups running multiple sites
          </p>
          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {locations.map((name, i) => (
              <motion.div
                key={name}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.4, ease: easeOut, delay: i * 0.06 }}
                className="landing-card-hover landing-location-card flex cursor-default items-center justify-center rounded-lg border border-brand-green/30 bg-landing-surface-feature px-4 py-5 text-center"
              >
                <span className="font-display text-sm font-medium text-brand-green-dark transition-colors duration-200">{name}</span>
              </motion.div>
            ))}
          </div>
        </RevealSection>
      </section>

      {/* Features bento */}
      <section id="features" className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <RevealSection>
            <h2 className="max-w-lg text-3xl font-medium tracking-[-0.02em] text-landing-ink sm:text-4xl">
              Everything ops teams need to run the floor
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-landing-steel">
              From draft shifts to published schedules, swap approvals to live
              on-duty rosters. One platform for admins, managers, and staff.
            </p>
          </RevealSection>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              const isDark = feature.tint.includes("brand-teal-deep");
              const span =
                i === 0
                  ? "sm:col-span-2 lg:col-span-2 lg:row-span-2"
                  : i === 4
                    ? "lg:col-span-2"
                    : "";

              return (
                <motion.article
                  key={feature.title}
                  initial={reduceMotion ? false : "hidden"}
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={scaleIn}
                  transition={{ duration: 0.5, ease: easeOut, delay: i * 0.05 }}
                  className={`group relative overflow-hidden rounded-xl border border-landing-hairline p-6 ${span} ${
                    feature.tint.startsWith("from-")
                      ? `bg-linear-to-br ${feature.tint} text-white`
                      : feature.tint
                  }`}
                >
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white ${feature.tagColor}`}
                  >
                    {feature.tag}
                  </span>
                  <Icon
                    className={`mt-4 size-6 ${isDark || feature.tint.startsWith("from-") ? "text-brand-green" : "text-brand-green-dark"}`}
                    strokeWidth={1.75}
                  />
                  <h3
                    className={`mt-3 font-display text-lg font-medium ${isDark || feature.tint.startsWith("from-") ? "text-white" : "text-landing-ink"}`}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className={`mt-2 text-sm leading-relaxed ${isDark || feature.tint.startsWith("from-") ? "text-landing-muted" : "text-landing-steel"}`}
                  >
                    {feature.description}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="bg-landing-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <RevealSection className="max-w-2xl">
            <h2 className="text-3xl font-medium tracking-[-0.02em] text-landing-ink sm:text-4xl">
              Permission-aware for every role
            </h2>
            <p className="mt-4 text-base leading-relaxed text-landing-steel">
              Admins run the full platform. Managers work within their locations.
              Staff get self-service tools without admin access.
            </p>
          </RevealSection>

          <div className="mt-10 flex flex-wrap gap-2">
            {roles.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setActiveRole(role.id)}
                className={`rounded-full border px-4 py-2 font-display text-sm font-medium transition-colors ${
                  activeRole === role.id
                    ? "border-landing-ink bg-landing-ink text-white"
                    : "border-landing-hairline bg-white text-landing-steel hover:text-landing-ink"
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {roles
              .filter((r) => r.id === activeRole)
              .map((role) => (
                <motion.div
                  key={role.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: easeOut }}
                  className="mt-8 grid gap-8 rounded-xl border border-landing-hairline bg-white p-8 lg:grid-cols-2 lg:items-center"
                >
                  <div>
                    <h3 className="text-2xl font-medium text-landing-ink">{role.headline}</h3>
                    <ul className="mt-6 space-y-4">
                      {role.points.map((point) => (
                        <li key={point} className="flex gap-3 text-sm text-landing-slate">
                          <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-brand-green-dark" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: UsersIcon, label: "Team" },
                      { icon: MapPinIcon, label: "Locations" },
                      { icon: BellIcon, label: "Alerts" },
                      { icon: ZapIcon, label: "Live sync" },
                    ].map(({ icon: Icon, label }) => (
                      <div
                        key={label}
                        className="landing-card-hover bg-black     landing-role-card flex flex-col items-center gap-2 rounded-lg border border-brand-teal bg-brand-teal-deep p-5 text-center"
                      >
                        <Icon
                          className="landing-role-card-icon size-5 text-white transition-colors duration-200"
                          strokeWidth={1.75}
                        />
                        <span className="landing-role-card-label text-xs font-medium text-white transition-colors duration-200">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Real-time */}
      <section id="realtime" className="bg-brand-teal-deep py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-8 lg:grid-cols-2 lg:items-center">
          <RevealSection>
            <h2 className="text-3xl font-medium tracking-[-0.02em] text-white sm:text-4xl">
              Updates reach the floor in seconds
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-landing-muted">
              Socket.IO rooms scoped by user, location, and admin feed keep
              schedules, swaps, and on-duty rosters synchronized.
            </p>
          </RevealSection>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: easeOut }}
            className="rounded-xl border border-landing-hairline-dark bg-[#0a2530] p-5 font-mono text-sm"
          >
            <p className="text-landing-muted">// connected events</p>
            <ul className="mt-3 space-y-2">
              {socketEvents.map((event, i) => (
                <motion.li
                  key={event}
                  initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, ease: easeOut, delay: i * 0.07 }}
                  className="text-brand-green"
                >
                  socket.on(&quot;{event}&quot;)
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-8">
          <RevealSection>
            <h2 className="text-3xl font-medium tracking-[-0.02em] text-landing-ink sm:text-4xl">
              Common questions
            </h2>
          </RevealSection>

          <div className="mt-10 divide-y divide-landing-hairline">
            {faqs.map((item, i) => (
              <motion.details
                key={item.q}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.4, ease: easeOut, delay: i * 0.06 }}
                className="group py-5"
              >
                <summary className="cursor-pointer list-none font-display text-base font-semibold text-landing-ink marker:content-none [&::-webkit-details-marker]:hidden">
                  {item.q}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-landing-steel">{item.a}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-4 mb-4 sm:mx-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55, ease: easeOut }}
          className="mx-auto max-w-7xl rounded-2xl bg-brand-teal-deep px-8 py-16 text-center sm:px-16"
        >
          <h2 className="text-3xl font-medium tracking-[-0.02em] text-white sm:text-4xl">
            Ready to unify your schedules?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-landing-muted">
            Sign in with your team credentials or explore the demo environment
            with seeded Coastal Eats accounts.
          </p>
          <Link
            href={isAuthenticated ? "/dashboard" : "/signup"}
            className="mt-8 inline-flex h-11 items-center rounded-full bg-brand-green px-7 text-sm font-semibold text-landing-ink transition-transform active:scale-[0.97]"
          >
            {isAuthenticated ? "Go to dashboard" : "Sign in to ShiftSync"}
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-teal-deep px-4 py-16 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-display text-base font-semibold text-white">
              <span className="flex size-8 items-center justify-center rounded-lg bg-brand-green/15 text-brand-green">
                <CalendarDaysIcon className="size-4" />
              </span>
              ShiftSync
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-landing-muted">
              Shift scheduling and workforce management for multi-location
              restaurant groups.
            </p>
          </div>
          <div>
            <p className="font-display text-sm font-semibold text-white">Product</p>
            <ul className="mt-4 space-y-2">
              {["Features", "Roles", "Real-time", "FAQ"].map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase().replace("-", "")}`}
                    className="text-sm text-landing-muted transition-colors hover:text-white"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-display text-sm font-semibold text-white">Account</p>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/login" className="text-sm text-landing-muted transition-colors hover:text-white">
                  Sign in
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-landing-muted transition-colors hover:text-white">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="mx-auto mt-12 max-w-7xl border-t border-landing-hairline-dark pt-8 text-sm text-landing-stone">
          ShiftSync Platform. Scheduling built for ops teams.
        </p>
      </footer>
    </div>
  );
}
