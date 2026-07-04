'use client';

import { Button } from '@/components/ui/button';
import { FormSheet } from '@/components/dashboard/form-sheet';
import { useConstraintFeedbackStore } from '@/lib/stores/constraint-feedback.store';
import { AlertTriangleIcon, CheckCircleIcon } from 'lucide-react';

export function ConstraintViolationModal() {
  const { constraintViolation, closeConstraintViolation } =
    useConstraintFeedbackStore();

  if (!constraintViolation) return null;

  const { title, reason, suggestions, onAssignUserId } = constraintViolation;

  return (
    <FormSheet
      open={!!constraintViolation}
      onOpenChange={(open) => !open && closeConstraintViolation()}
      title={title}
      size="md"
      showCloseButton={false}
      footer={
        <Button variant="outline" onClick={closeConstraintViolation}>
          Close
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-brand-green-dark">
          <AlertTriangleIcon className="size-5 shrink-0" />
          <span className="text-sm font-medium">Constraint violation</span>
        </div>
        <div>
          <p className="text-sm font-medium text-landing-steel">Reason</p>
          <p className="mt-1 text-sm text-brand-teal-deep">{reason}</p>
        </div>
        {suggestions.length > 0 && (
          <div>
            <p className="text-sm font-medium text-landing-steel">
              Suggested alternatives
            </p>
            <ul className="mt-2 flex flex-col gap-3">
              {suggestions.map((s) => {
                const nearOT = /near OT|approaching overtime|overtime/i.test(s.reason);
                return (
                  <li
                    key={s.userId}
                    className="rounded-xl border border-landing-hairline bg-landing-surface/60 p-3 transition-colors hover:border-brand-green/25 hover:bg-brand-green/[0.03]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        {nearOT ? (
                          <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-landing-accent-orange" />
                        ) : (
                          <CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-brand-green-dark" />
                        )}
                        <div>
                          <p className="font-medium text-brand-teal-deep">{s.name}</p>
                          <p className="text-xs text-landing-steel">{s.reason}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="rounded-full bg-brand-green text-brand-teal-deep hover:bg-brand-green/90"
                        onClick={() => onAssignUserId(s.userId)}
                      >
                        Assign {s.name.split(' ')[0]}
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </FormSheet>
  );
}
