"use client";

import { useMemo, useState } from "react";
import { cn, isoDay, rentalDays } from "@/lib/format";
import { blockedDays, isRangeFree } from "@/features/reservations/availability";
import type { DateRange } from "@/types";

interface Props {
  bookedRanges: DateRange[];
  from: string | null;
  to: string | null;
  onChange: (from: string | null, to: string | null) => void;
}

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export function DateRangeCalendar({ bookedRanges, from, to, onChange }: Props): React.JSX.Element {
  const [offset, setOffset] = useState(0);
  const [awaitingEnd, setAwaitingEnd] = useState(false);
  const blocked = useMemo(() => blockedDays(bookedRanges), [bookedRanges]);
  const today = isoDay(new Date());

  const months = useMemo(() => {
    const base = new Date();
    return [0, 1].map((i) => {
      const d = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + offset + i, 1));
      return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
    });
  }, [offset]);

  /**
   * One tap is already a valid booking — pick up and return on the same day —
   * so the first tap sets both ends. A second tap extends the return date; a
   * third starts a new selection.
   */
  function startAt(day: string): void {
    onChange(day, day);
    setAwaitingEnd(true);
  }

  function pick(day: string): void {
    if (!from || !awaitingEnd) { startAt(day); return; }
    // Tapping the pickup day again confirms the one-day rental as it stands.
    if (day === from) { setAwaitingEnd(false); return; }
    // Going backwards reads as choosing a different pickup day.
    if (day < from) { startAt(day); return; }
    // A range is only valid if nothing booked sits between the two ends.
    if (!isRangeFree(bookedRanges, from, day)) { startAt(day); return; }
    onChange(from, day);
    setAwaitingEnd(false);
  }

  return (
    <div>
      <div className="mb-3.5 flex items-center justify-between">
        <button type="button" onClick={() => setOffset((o) => Math.max(0, o - 1))} disabled={offset === 0}
          className="rounded-full border border-line px-3 py-1.5 text-sm font-semibold disabled:opacity-40">←</button>
        <p className="text-[13px] font-semibold text-muted">
          {awaitingEnd
            ? "Tap a later day to extend, or carry on for a one-day rental"
            : "Tap a day to book it — tap a second day for a longer rental"}
        </p>
        <button type="button" onClick={() => setOffset((o) => o + 1)}
          className="rounded-full border border-line px-3 py-1.5 text-sm font-semibold">→</button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {months.map(({ year, month }) => (
          <Month key={`${year}-${month}`} year={year} month={month} today={today}
            blocked={blocked} from={from} to={to} onPick={pick} />
        ))}
      </div>

      <p className="mt-4 flex flex-wrap items-center gap-4 text-[12.5px] text-muted">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-navy-900" />Your dates</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-rose/25" />Already booked</span>
      </p>
    </div>
  );
}

interface MonthProps {
  year: number; month: number; today: string;
  blocked: Set<string>; from: string | null; to: string | null;
  onPick: (day: string) => void;
}

function Month({ year, month, today, blocked, from, to, onPick }: MonthProps): React.JSX.Element {
  const first = new Date(Date.UTC(year, month, 1));
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const lead = (first.getUTCDay() + 6) % 7; // Monday-first grid

  return (
    <div>
      <p className="mb-2.5 text-center text-[15px] font-semibold">
        {first.toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" })}
      </p>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-muted">
        {WEEKDAYS.map((w) => <span key={w} className="py-1">{w}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: lead }).map((_, i) => <span key={`pad-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = isoDay(new Date(Date.UTC(year, month, i + 1)));
          const isPast = day < today;
          const isBlocked = blocked.has(day);
          const isStart = day === from;
          const isEnd = day === to;
          const inRange = Boolean(from && to && day > from && day < to);
          const disabled = isPast || isBlocked;

          return (
            <button
              key={day}
              type="button"
              disabled={disabled}
              onClick={() => onPick(day)}
              aria-label={new Date(day).toLocaleDateString("en-GB", { dateStyle: "long", timeZone: "UTC" })}
              className={cn(
                "aspect-square rounded-lg text-[13.5px] font-semibold transition-all duration-200 ease-soft",
                disabled && "cursor-not-allowed text-rose/50 line-through",
                !disabled && !isStart && !isEnd && !inRange && "hover:bg-surface-2",
                inRange && "bg-navy-900/10",
                (isStart || isEnd) && "scale-105 bg-navy-900 text-white",
              )}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Billable days, counting both the pickup and the return day. */
export function rentalDaysBetween(from: string | null, to: string | null): number {
  if (!from || !to) return 0;
  return rentalDays(from, to);
}
