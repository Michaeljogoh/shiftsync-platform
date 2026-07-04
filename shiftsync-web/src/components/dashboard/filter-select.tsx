"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const ALL_VALUE = "__all__";

export interface FilterSelectOption {
  value: string;
  label: string;
}

export interface FilterSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: FilterSelectOption[];
  className?: string;
  triggerClassName?: string;
}

export function FilterSelect({
  value,
  onValueChange,
  placeholder,
  options,
  className,
  triggerClassName,
}: FilterSelectProps) {
  return (
    <div className={cn("min-w-[10rem] flex-1 sm:flex-initial", className)}>
      <Select
        value={value || ALL_VALUE}
        onValueChange={(v) => onValueChange(v === ALL_VALUE ? "" : v)}
      >
        <SelectTrigger
          className={cn(
            "h-10 w-full border-landing-hairline bg-white text-brand-teal-deep transition-colors hover:border-brand-green/40 hover:bg-brand-green/[0.03] sm:h-9 sm:min-w-[11rem]",
            triggerClassName,
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="border-landing-hairline">
          <SelectItem value={ALL_VALUE}>{placeholder}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export interface FormSelectProps {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  options: FilterSelectOption[];
  disabled?: boolean;
  className?: string;
  emptyValue?: string;
}

export function FormSelect({
  id,
  value,
  onValueChange,
  placeholder = "Select…",
  options,
  disabled,
  className,
  emptyValue = "",
}: FormSelectProps) {
  const sentinel = "__empty__";
  const selectValue = value || sentinel;

  return (
    <Select
      value={selectValue}
      onValueChange={(v) => onValueChange(v === sentinel ? emptyValue : v)}
      disabled={disabled}
    >
      <SelectTrigger
        id={id}
        className={cn(
          "h-11 w-full border-landing-hairline bg-white text-brand-teal-deep transition-colors hover:border-brand-green/40 focus-visible:border-brand-green focus-visible:ring-brand-green/25",
          className,
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="border-landing-hairline">
        {placeholder && (
          <SelectItem value={sentinel} disabled={options.every((o) => o.value !== "")}>
            {placeholder}
          </SelectItem>
        )}
        {options
          .filter((o) => o.value !== "")
          .map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
}
