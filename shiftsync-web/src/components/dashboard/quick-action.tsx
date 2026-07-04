import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuickAction({
  icon: Icon,
  label,
  href,
  accent = "green",
  variant = "default",
}: {
  icon: LucideIcon;
  label: string;
  href: string;
  accent?: "green" | "teal" | "orange" | "purple";
  variant?: "default" | "on-dark";
}) {
  const lightStyles = {
    green: "bg-brand-green/10 text-brand-green-dark hover:bg-brand-green/15",
    teal: "bg-brand-teal/10 text-brand-teal hover:bg-brand-teal/15",
    orange:
      "bg-landing-accent-orange/10 text-landing-accent-orange hover:bg-landing-accent-orange/15",
    purple:
      "bg-landing-accent-purple/10 text-landing-accent-purple hover:bg-landing-accent-purple/15",
  };

  const darkHoverStyles = {
    green:
      "border-white/10 bg-white/[0.07] text-white hover:border-brand-green/50 hover:bg-brand-green hover:text-brand-teal-deep hover:shadow-[0_10px_24px_-8px_rgba(0,237,100,0.45)]",
    teal:
      "border-white/10 bg-white/[0.07] text-white hover:border-brand-green/50 hover:bg-brand-green hover:text-brand-teal-deep hover:shadow-[0_10px_24px_-8px_rgba(0,237,100,0.45)]",
    orange:
      "border-white/10 bg-white/[0.07] text-white hover:border-brand-green/50 hover:bg-brand-green hover:text-brand-teal-deep hover:shadow-[0_10px_24px_-8px_rgba(0,237,100,0.45)]",
    purple:
      "border-white/10 bg-white/[0.07] text-white hover:border-brand-green/50 hover:bg-brand-green hover:text-brand-teal-deep hover:shadow-[0_10px_24px_-8px_rgba(0,237,100,0.45)]",
  };

  const isOnDark = variant === "on-dark";

  return (
    <Link
      href={href}
      className={cn(
        "group/action flex h-full min-h-[4.75rem] flex-col items-center justify-center gap-2 rounded-xl px-3 py-3 text-center transition-all duration-200 active:scale-[0.97]",
        isOnDark
          ? cn("border hover:-translate-y-0.5", darkHoverStyles[accent])
          : lightStyles[accent],
      )}
    >
      <Icon
        className={cn(
          "size-5 transition-colors duration-200",
          isOnDark && "text-white/85 group-hover/action:text-brand-teal-deep",
        )}
        strokeWidth={2}
      />
      <span
        className={cn(
          "text-xs font-semibold transition-colors duration-200",
          isOnDark
            ? "text-white/90 group-hover/action:text-brand-teal-deep"
            : "text-brand-teal-deep",
        )}
      >
        {label}
      </span>
    </Link>
  );
}
