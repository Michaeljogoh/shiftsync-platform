'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormSheet } from '@/components/dashboard/form-sheet';
import { useConstraintFeedbackStore } from '@/lib/stores/constraint-feedback.store';
import { BanIcon } from 'lucide-react';

const MIN_REASON_LENGTH = 20;

export function ConsecutiveDayOverrideModal() {
  const { consecutiveDayOverride, closeConsecutiveDayOverride } =
    useConstraintFeedbackStore();
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!consecutiveDayOverride) return null;

  const { userName, onSubmitOverride } = consecutiveDayOverride;
  const valid = reason.trim().length >= MIN_REASON_LENGTH;

  const handleSubmit = async () => {
    if (!valid) return;
    setSubmitting(true);
    try {
      await onSubmitOverride(reason.trim());
      closeConsecutiveDayOverride();
      setReason('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeConsecutiveDayOverride();
      setReason('');
    }
  };

  return (
    <FormSheet
      open={!!consecutiveDayOverride}
      onOpenChange={handleOpenChange}
      title="7th consecutive day — override required"
      size="md"
      showCloseButton={false}
      footer={
        <>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!valid || submitting}
            className="rounded-full bg-brand-green text-brand-teal-deep hover:bg-brand-green/90"
            onClick={handleSubmit}
          >
            {submitting ? 'Submitting…' : 'Override & assign'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-destructive">
          <BanIcon className="size-5 shrink-0" />
          <span className="text-sm font-medium">Manager approval required</span>
        </div>
        <p className="text-sm text-brand-teal-deep">
          <strong>{userName}</strong> would be working their 7th consecutive
          day. This requires documented manager approval.
        </p>
        <div>
          <label
            htmlFor="override-reason"
            className="text-sm font-medium text-brand-teal-deep"
          >
            Override reason
          </label>
          <textarea
            id="override-reason"
            className="mt-1.5 w-full rounded-lg border border-landing-hairline bg-white px-3 py-2 text-sm text-brand-teal-deep placeholder:text-landing-muted focus-visible:border-brand-green focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-green/25"
            placeholder={`Minimum ${MIN_REASON_LENGTH} characters`}
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            minLength={MIN_REASON_LENGTH}
          />
          <p className="mt-1 text-xs text-landing-muted">
            This reason will be logged in the audit trail.
          </p>
        </div>
      </div>
    </FormSheet>
  );
}
