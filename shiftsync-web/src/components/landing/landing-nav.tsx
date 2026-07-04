"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion";
import { ArrowRightIcon, CalendarDaysIcon, MenuIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Roles", href: "#roles" },
  { label: "Real-time", href: "#realtime" },
  { label: "FAQ", href: "#faq" },
];

const SCROLL_THRESHOLD = 48;

function scrollProgress(y: number) {
  return Math.min(Math.max(y / SCROLL_THRESHOLD, 0), 1);
}

function foregroundFromScroll(y: number) {
  const t = scrollProgress(y);
  if (t >= 1) return "#000000";
  if (t <= 0) return "rgba(255,255,255,0.92)";
  const v = Math.round(255 * (1 - t));
  return `rgb(${v},${v},${v})`;
}

function NavText({
  scrollY,
  reduceMotion,
  isSolid,
  className,
  href,
  children,
  onClick,
}: {
  scrollY: MotionValue<number>;
  reduceMotion: boolean | null;
  isSolid: boolean;
  className?: string;
  href: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  const color = useTransform(scrollY, foregroundFromScroll);

  if (reduceMotion) {
    return (
      <a
        href={href}
        onClick={onClick}
        className={cn(
          className,
          isSolid ? "text-black! hover:text-black/70!" : "text-white! hover:text-white!",
        )}
      >
        {children}
      </a>
    );
  }

  return (
    <motion.a
      href={href}
      onClick={onClick}
      style={{ color }}
      className={className}
    >
      {children}
    </motion.a>
  );
}

function NavLinkText({
  scrollY,
  reduceMotion,
  isSolid,
  className,
  href,
  children,
  onClick,
}: {
  scrollY: MotionValue<number>;
  reduceMotion: boolean | null;
  isSolid: boolean;
  className?: string;
  href: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  const color = useTransform(scrollY, foregroundFromScroll);

  if (reduceMotion) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          className,
          isSolid ? "text-black! hover:text-black/70!" : "text-white! hover:text-white!",
        )}
      >
        {children}
      </Link>
    );
  }

  return (
    <motion.span style={{ color }} className="inline-flex">
      <Link href={href} onClick={onClick} className={cn(className, "text-inherit")}>
        {children}
      </Link>
    </motion.span>
  );
}

function isDarkDocument() {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

type LandingNavProps = {
  isAuthenticated?: boolean;
};

export function LandingNav({ isAuthenticated }: LandingNavProps) {
  const [open, setOpen] = useState(false);
  const [isSolid, setIsSolid] = useState(false);
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const next = latest > SCROLL_THRESHOLD;
    setIsSolid((prev) => (prev === next ? prev : next));
  });

  useEffect(() => {
    setIsSolid(window.scrollY > SCROLL_THRESHOLD);
  }, []);

  const pillBg = useTransform(scrollY, (y) => {
    const t = scrollProgress(y);
    if (isDarkDocument()) return `rgba(15,45,58,${0.06 + t * 0.88})`;
    return `rgba(255,255,255,${0.08 + t * 0.86})`;
  });
  const pillBorder = useTransform(scrollY, (y) => {
    const t = scrollProgress(y);
    if (isDarkDocument()) return `rgba(28,45,56,${0.12 + t * 0.83})`;
    return `rgba(225,229,232,${0.2 + t * 0.75})`;
  });
  const pillShadow = useTransform(scrollY, (y) => {
    const t = scrollProgress(y);
    return `0 ${8 * t}px ${32 * t}px rgba(0,30,43,${0.1 * t})`;
  });
  const pillBlur = useTransform(scrollY, (y) => `blur(${scrollProgress(y) * 14}px)`);
  const navForeground = useTransform(scrollY, foregroundFromScroll);
  const iconForeground = useTransform(scrollY, (y) =>
    scrollProgress(y) >= 1 ? "#000000" : "rgba(255,255,255,0.92)",
  );

  const navLinkClass =
    "font-display text-sm font-medium transition-opacity duration-200 hover:opacity-70";

  const signInClass =
    "hidden font-display text-sm font-medium transition-opacity duration-200 hover:opacity-70 sm:inline";

  const logoWordClass = "hidden font-display text-base font-semibold sm:inline";

  const pillMotionStyle = reduceMotion
    ? undefined
    : {
        backgroundColor: pillBg,
        borderColor: pillBorder,
        boxShadow: pillShadow,
        backdropFilter: pillBlur,
        WebkitBackdropFilter: pillBlur,
      };

  const pillClassName = cn(
    "pointer-events-auto mx-auto flex h-[3.25rem] max-w-4xl items-center justify-between gap-3 rounded-full border px-3 sm:h-14 sm:gap-4 sm:px-5",
    reduceMotion &&
      (isSolid
        ? "border-landing-hairline bg-white/95 shadow-[0_8px_32px_rgba(0,30,43,0.1)] backdrop-blur-md dark:border-landing-hairline-dark dark:bg-[#0f2d3a]/95"
        : "border-white/20 bg-white/[0.08] backdrop-blur-sm"),
  );

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4 lg:px-8">
      <motion.div style={pillMotionStyle} className={pillClassName}>
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span
            className={cn(
              "flex size-8 items-center justify-center rounded-lg transition-colors duration-200",
              isSolid
                ? "bg-brand-teal-deep text-brand-green"
                : "bg-white/15 text-brand-green",
            )}
          >
            <CalendarDaysIcon className="size-4" strokeWidth={2} />
          </span>
          {reduceMotion ? (
            <span
              className={cn(
                logoWordClass,
                isSolid ? "text-black!" : "text-white!",
              )}
            >
              ShiftSync
            </span>
          ) : (
            <motion.span style={{ color: navForeground }} className={logoWordClass}>
              ShiftSync
            </motion.span>
          )}
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-6 lg:flex" aria-label="Main">
          {navLinks.map((link) => (
            <NavText
              key={link.href}
              href={link.href}
              scrollY={scrollY}
              reduceMotion={reduceMotion}
              isSolid={isSolid}
              className={navLinkClass}
            >
              {link.label}
            </NavText>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:flex lg:gap-3">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-landing-ink px-4 font-display text-sm font-semibold text-white transition-transform active:scale-[0.97]"
            >
              Dashboard
              <ArrowRightIcon className="size-3.5" strokeWidth={2.5} />
            </Link>
          ) : (
            <>
              <NavLinkText
                href="/login"
                scrollY={scrollY}
                reduceMotion={reduceMotion}
                isSolid={isSolid}
                className={signInClass}
              >
                Log in
              </NavLinkText>
              <Link
                href="/signup"
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-landing-ink px-4 font-display text-sm font-semibold text-white transition-transform active:scale-[0.97]"
              >
                Get started
                <ArrowRightIcon className="size-3.5" strokeWidth={2.5} />
              </Link>
            </>
          )}
        </div>

        {reduceMotion ? (
          <button
            type="button"
            className={cn(
              "inline-flex size-9 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 sm:size-10 lg:hidden",
              isSolid
                ? "border-landing-hairline text-black!"
                : "border-white/25 text-white!",
            )}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <XIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        ) : (
          <motion.button
            type="button"
            style={{ color: iconForeground }}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-landing-hairline/50 transition-colors duration-200 sm:size-10 lg:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <XIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </motion.button>
        )}
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: easeOut }}
            className={cn(
              "pointer-events-auto mx-auto mt-2 max-w-4xl overflow-hidden rounded-2xl border p-2 lg:hidden",
              isSolid
                ? "border-landing-hairline bg-white/95 shadow-lg backdrop-blur-md dark:border-landing-hairline-dark dark:bg-[#0f2d3a]/95"
                : "border-white/15 bg-brand-teal-deep/90 shadow-lg backdrop-blur-md",
            )}
          >
            <nav className="flex flex-col gap-0.5" aria-label="Mobile">
              {navLinks.map((link) => (
                <NavText
                  key={link.href}
                  href={link.href}
                  scrollY={scrollY}
                  reduceMotion={reduceMotion}
                  isSolid={isSolid}
                  className={cn(navLinkClass, "rounded-xl px-3 py-2.5")}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </NavText>
              ))}
              <div
                className={cn(
                  "mt-1 flex flex-col gap-2 border-t pt-3",
                  isSolid ? "border-landing-hairline dark:border-landing-hairline-dark" : "border-white/15",
                )}
              >
                {isAuthenticated ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full bg-landing-ink font-display text-sm font-semibold text-white"
                    onClick={() => setOpen(false)}
                  >
                    Open dashboard
                    <ArrowRightIcon className="size-3.5" />
                  </Link>
                ) : (
                  <>
                    <NavLinkText
                      href="/login"
                      scrollY={scrollY}
                      reduceMotion={reduceMotion}
                      isSolid={isSolid}
                      className="inline-flex h-11 w-full items-center justify-center rounded-full border border-landing-hairline font-display text-sm font-semibold"
                      onClick={() => setOpen(false)}
                    >
                      Log in
                    </NavLinkText>
                    <Link
                      href="/signup"
                      className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full bg-landing-ink font-display text-sm font-semibold text-white"
                      onClick={() => setOpen(false)}
                    >
                      Get started
                      <ArrowRightIcon className="size-3.5" />
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

const easeOut = [0.23, 1, 0.32, 1] as const;
