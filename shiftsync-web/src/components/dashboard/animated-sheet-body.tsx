"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const easeOut = [0.23, 1, 0.32, 1] as const;

export function AnimatedSheetBody({
  open,
  side = "right",
  children,
  className,
}: {
  open: boolean;
  side?: "left" | "right";
  children: ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const x = side === "right" ? 24 : -24;

  if (reduceMotion) {
    return open ? <div className={className}>{children}</div> : null;
  }

  return (
    <motion.div
      key="sheet-body"
      initial={{ opacity: 0, x: open ? x : 0 }}
      animate={{ opacity: open ? 1 : 0, x: open ? 0 : x }}
      transition={{ duration: 0.28, ease: easeOut }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
