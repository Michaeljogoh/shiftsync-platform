'use client';

import { Button } from '@/components/ui/button';
import { FormSheet } from '@/components/dashboard/form-sheet';
import { useConstraintFeedbackStore } from '@/lib/stores/constraint-feedback.store';
import { AlertTriangleIcon } from 'lucide-react';

export function OvertimeWarningModal() {
  const { overtimeWarning, closeOvertimeWarning } =
    useConstraintFeedbackStore();

  if (!overtimeWarning) return null;

  const {
    userName,
    projectedWeeklyHours,
    limitHours = 40,
    estimatedOvertimeCost,
    onUndo,
  } = overtimeWarning;

  const progressPct = Math.min(100, (projectedWeeklyHours / limitHours) * 100);

  return (
    <FormSheet
      open={!!overtimeWarning}
      onOpenChange={(open) => !open && closeOvertimeWarning()}
      title="Assignment created — overtime warning"
      size="md"
      showCloseButton={false}
      footer={
        <>
          <Button variant="outline" onClick={onUndo}>
            Undo assignment
          </Button>
          <Button
            className="rounded-full bg-brand-green text-brand-teal-deep hover:bg-brand-green/90"
            onClick={closeOvertimeWarning}
          >
            OK, I understand
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-landing-accent-orange">
          <AlertTriangleIcon className="size-5 shrink-0" />
          <span className="text-sm font-medium">Approaching weekly limit</span>
        </div>
        <p className="text-sm text-brand-teal-deep">
          Adding this shift will bring <strong>{userName}</strong> to{' '}
          <strong>{projectedWeeklyHours} hours</strong> this week.
        </p>
        <div>
          <div className="mb-1 flex justify-between text-xs text-landing-steel">
            <span>Weekly hours</span>
            <span>
              {projectedWeeklyHours}h / {limitHours}h limit
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-landing-hairline">
            <div
              className="h-full rounded-full bg-brand-green transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
        {estimatedOvertimeCost != null && estimatedOvertimeCost > 0 && (
          <p className="text-sm text-landing-steel">
            Estimated additional cost if they reach 40h: ~$
            {estimatedOvertimeCost.toFixed(2)}/hr for any hours beyond 40.
          </p>
        )}
      </div>
    </FormSheet>
  );
}
