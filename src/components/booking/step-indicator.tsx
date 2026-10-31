import { cn } from "@/lib/format";

const STEPS = ["Van", "Dates", "Details", "Done"] as const;

export function StepIndicator({ current }: { current: number }): React.JSX.Element {
  return (
    <ol className="flex flex-wrap items-center gap-2.5">
      {STEPS.map((label, i) => {
        const state = i < current ? "done" : i === current ? "now" : "next";
        return (
          <li key={label} className="flex items-center gap-2.5">
            <span className={cn("flex items-center gap-2.5 text-[13.5px] font-semibold",
              state === "next" ? "text-white/55" : "text-white")}>
              <span className={cn(
                "grid h-6 w-6 place-items-center rounded-full border-[1.5px] text-xs transition-all duration-[400ms]",
                state === "next" ? "border-white/20" : "border-white bg-white text-navy-900",
              )}>
                {i + 1}
              </span>
              {label}
            </span>
            {i < STEPS.length - 1 && <span className="h-px w-8 bg-white/20" />}
          </li>
        );
      })}
    </ol>
  );
}
