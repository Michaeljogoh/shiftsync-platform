'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { FormSheet } from '@/components/dashboard/form-sheet';
import { FormSelectField } from '@/components/dashboard/form-select-field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { queryKeys } from '@/lib/query-keys';
import { createShiftSchema, type CreateShiftInput } from '@/lib/validations/shifts';
import type { LocationSummary } from '@/lib/api/server/locations';
import type { SkillSummary } from '@/lib/api/server/skills';
import { createShiftAction } from './actions';

const primaryBtnClass =
  'rounded-full bg-brand-green text-brand-teal-deep hover:bg-brand-green/90 font-semibold';

interface CreateShiftFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locations: LocationSummary[];
  skills: SkillSummary[];
  defaultLocationId?: string;
  defaultWeek?: string;
}

export function CreateShiftForm({
  open,
  onOpenChange,
  locations,
  skills,
  defaultLocationId,
  defaultWeek,
}: CreateShiftFormProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<CreateShiftInput>({
    resolver: zodResolver(createShiftSchema),
    defaultValues: {
      locationId: defaultLocationId ?? '',
      requiredSkillId: '',
      title: '',
      startAt: '',
      endAt: '',
      headcountNeeded: 1,
      editCutoffHours: 48,
    },
  });

  async function onSubmit(values: CreateShiftInput) {
    const formData = new FormData();
    formData.set('locationId', values.locationId);
    formData.set('requiredSkillId', values.requiredSkillId);
    formData.set('title', values.title);
    // datetime-local gives "YYYY-MM-DDTHH:mm"; backend accepts no-offset ISO (interpreted in location TZ)
    const startAt = values.startAt.includes(':') && values.startAt.split(':').length === 2
      ? `${values.startAt}:00`
      : values.startAt;
    const endAt = values.endAt.includes(':') && values.endAt.split(':').length === 2
      ? `${values.endAt}:00`
      : values.endAt;
    formData.set('startAt', startAt);
    formData.set('endAt', endAt);
    formData.set('headcountNeeded', String(values.headcountNeeded));
    if (values.editCutoffHours != null) formData.set('editCutoffHours', String(values.editCutoffHours));

    const result = await createShiftAction(formData);

    if (result.success) {
      toast.success('Shift created');
      reset();
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.shifts.all() });
      return;
    }

    if (result.errors && typeof result.errors === 'object') {
      for (const [field, messages] of Object.entries(result.errors)) {
        const msg = Array.isArray(messages) ? messages[0] : messages;
        if (msg) setError(field as keyof CreateShiftInput, { message: msg });
      }
    }
    if (result.error && !result.errors) {
      toast.error(result.error);
    }
    if (result.suggestions && Array.isArray(result.suggestions) && result.suggestions.length > 0) {
      toast.error(result.error, { description: 'See suggestions in the form.' });
    }
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Add shift"
      description="Create a new shift. Times are in the location's timezone if no offset is provided."
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" form="create-shift-form" disabled={isSubmitting} className={primaryBtnClass}>
            {isSubmitting ? 'Creating…' : 'Create shift'}
          </Button>
        </>
      }
    >
      <form id="create-shift-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormSelectField
          control={control}
          name="locationId"
          label="Location"
          placeholder="Select location"
          options={locations.map((loc) => ({
            value: loc.id,
            label: `${loc.name} (${loc.ianaTimezone})`,
          }))}
          error={errors.locationId?.message}
        />

        <FormSelectField
          control={control}
          name="requiredSkillId"
          label="Required skill"
          placeholder="Select skill"
          options={skills.map((skill) => ({ value: skill.id, label: skill.name }))}
          error={errors.requiredSkillId?.message}
        />

        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" placeholder="e.g. Bar shift" {...register('title')} />
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="startAt">Start (local)</Label>
            <Input
              id="startAt"
              type="datetime-local"
              {...register('startAt')}
            />
            {errors.startAt && (
              <p className="text-xs text-destructive">{errors.startAt.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="endAt">End (local)</Label>
            <Input
              id="endAt"
              type="datetime-local"
              {...register('endAt')}
            />
            {errors.endAt && (
              <p className="text-xs text-destructive">{errors.endAt.message}</p>
            )}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="headcountNeeded">Headcount needed</Label>
          <Input
            id="headcountNeeded"
            type="number"
            min={1}
            max={50}
            {...register('headcountNeeded', { valueAsNumber: true })}
          />
          {errors.headcountNeeded && (
            <p className="text-xs text-destructive">{errors.headcountNeeded.message}</p>
          )}
        </div>
      </form>
    </FormSheet>
  );
}
