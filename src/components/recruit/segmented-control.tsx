import { useId, type ReactNode } from "react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
  disabled?: boolean;
}

interface SegmentedControlProps<T extends string> {
  label: string;
  value: T;
  options: readonly SegmentedOption<T>[];
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: SegmentedControlProps<T>) {
  const indicatorId = useId();

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="relative grid auto-cols-fr grid-flow-col rounded-lg bg-muted p-1"
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative flex h-8 items-center justify-center gap-1.5 rounded-md px-2 text-xs font-bold whitespace-nowrap transition-colors sm:px-3",
              "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
              "disabled:cursor-not-allowed disabled:opacity-40",
              isActive
                ? "text-foreground"
                : "text-muted-foreground any-hover:hover:text-foreground",
            )}
          >
            {isActive && (
              <motion.span
                layoutId={indicatorId}
                className="absolute inset-0 rounded-md bg-background shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                transition={{ type: "spring", bounce: 0.18, duration: 0.42 }}
              />
            )}
            <span className="relative z-10 inline-flex items-center gap-1.5">
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
