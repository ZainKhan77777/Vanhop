"use client";

import { cn } from "@/lib/format";

export interface ChipOption { value: string; label: string; count: number }

interface Props { options: ChipOption[]; active: string; onChange: (value: string) => void }

export function FilterChips({ options, active, onChange }: Props): React.JSX.Element {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={active === option.value}
          className={cn(
            "rounded-full border px-3.5 py-2 text-[13.5px] font-semibold transition-all duration-200",
            active === option.value
              ? "border-navy-900 bg-navy-900 text-white"
              : "border-line bg-surface-2 text-muted hover:border-line-2 hover:text-navy-900",
          )}
        >
          {option.label}
          <span className="ml-1.5 tabular-nums opacity-65">{option.count}</span>
        </button>
      ))}
    </div>
  );
}
