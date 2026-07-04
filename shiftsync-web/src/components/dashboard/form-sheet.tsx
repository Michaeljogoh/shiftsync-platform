"use client";

import type { ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  sheetBodyClass,
  sheetFooterClass,
  sheetHeaderClass,
  sheetShellClass,
  sheetWidthClass,
  type SheetSize,
} from "@/components/dashboard/sheet-layout";
import { cn } from "@/lib/utils";

export interface FormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  side?: "left" | "right";
  className?: string;
  showCloseButton?: boolean;
  size?: SheetSize;
}

export function FormSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  side = "right",
  className,
  showCloseButton = true,
  size = "lg",
}: FormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        showCloseButton={showCloseButton}
        className={cn(sheetShellClass, sheetWidthClass(size), className)}
      >
        <SheetHeader className={sheetHeaderClass}>
          <SheetTitle className="text-xl leading-tight">{title}</SheetTitle>
          {description && (
            <SheetDescription className="text-sm leading-relaxed">
              {description}
            </SheetDescription>
          )}
        </SheetHeader>
        <div className={sheetBodyClass}>{children}</div>
        {footer && <SheetFooter className={sheetFooterClass}>{footer}</SheetFooter>}
      </SheetContent>
    </Sheet>
  );
}

export interface DetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  header: ReactNode;
  children: ReactNode;
  tabs?: ReactNode;
  footer?: ReactNode;
  size?: SheetSize;
  className?: string;
}

/** Large detail panels — staff profile, shift details, location detail */
export function DetailSheet({
  open,
  onOpenChange,
  header,
  children,
  tabs,
  footer,
  size = "detail",
  className,
}: DetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(sheetShellClass, sheetWidthClass(size), className)}
      >
        <div className={cn(sheetHeaderClass, !tabs && "border-b")}>{header}</div>
        {tabs}
        <div className={sheetBodyClass}>{children}</div>
        {footer && <SheetFooter className={sheetFooterClass}>{footer}</SheetFooter>}
      </SheetContent>
    </Sheet>
  );
}
