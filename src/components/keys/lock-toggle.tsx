"use client";

import { cn } from "@/lib/format";

interface Props {
  unlocked: boolean;
  pending: boolean;
  disabled?: boolean;
  pulse: number;
  onToggle: () => void;
}

export function LockToggle({ unlocked, pending, disabled = false, pulse, onToggle }: Props): React.JSX.Element {
  const off = pending || disabled;

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={off}
      aria-pressed={unlocked}
      className={cn(
        "relative flex h-16 w-full max-w-[340px] items-center rounded-full border-[1.5px] shadow-sm2",
        "transition-colors duration-500 ease-soft disabled:cursor-not-allowed disabled:opacity-55",
        off ? "" : "hover:shadow-md2",
        unlocked ? "border-brass bg-brass" : "border-line-2 bg-surface-2",
      )}
    >
      {pulse > 0 && (
        <>
          <span className="pointer-events-none absolute inset-0 animate-ring rounded-full border-2 border-brass" />
          <span className="pointer-events-none absolute inset-0 animate-ring rounded-full border-2 border-brass [animation-delay:.16s]" />
        </>
      )}

      {/* Positioned against the track, so it can never land on the label. */}
      <span
        className={cn(
          "absolute top-[5px] grid h-[52px] w-[52px] place-items-center rounded-full bg-white",
          "shadow-[0_2px_8px_rgba(14,22,38,.16)] transition-[left] duration-[550ms] ease-soft",
        )}
        style={{ left: unlocked ? "calc(100% - 57px)" : "5px" }}
      >
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.9" strokeLinecap="round"
          className={cn("h-6 w-6 transition-colors duration-500", unlocked ? "stroke-brass" : "stroke-navy-900")}>
          <path d="M8 11V7a4 4 0 0 1 8 0v4" className="transition-transform duration-500 ease-soft"
            style={{ transformOrigin: "center bottom", transform: unlocked ? "translate(4px,-6px) rotate(18deg)" : "none" }} />
          <rect x="5" y="11" width="14" height="9" rx="2.6" />
        </svg>
      </span>

      <span
        className={cn("flex-1 text-center text-[15px] font-bold transition-all duration-[550ms] ease-soft",
          unlocked ? "pl-4 pr-[62px] text-white" : "pl-[62px] pr-4 text-navy-900")}
      >
        {pending ? "Working…" : disabled ? "Key not active" : unlocked ? "Lock the van" : "Unlock the van"}
      </span>
    </button>
  );
}
