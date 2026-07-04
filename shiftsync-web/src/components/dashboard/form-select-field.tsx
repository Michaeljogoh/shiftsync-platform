"use client";

import {
  type Control,
  Controller,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Label } from "@/components/ui/label";
import { FormSelect, type FilterSelectOption } from "@/components/dashboard/filter-select";
import { cn } from "@/lib/utils";

export interface FormSelectFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
  options: FilterSelectOption[];
  error?: string;
  className?: string;
}

export function FormSelectField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  options,
  error,
  className,
}: FormSelectFieldProps<T>) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <Label className="text-sm font-medium text-brand-teal-deep">{label}</Label>
      )}
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <FormSelect
            id={String(name)}
            value={field.value ?? ""}
            onValueChange={field.onChange}
            placeholder={placeholder}
            options={options}
          />
        )}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
