import type { FilterQuery } from "mongoose";
import { RESERVATION_STATUS } from "@/constants/reservation-status";
import { toUtcDay } from "@/lib/format";
import type { DateRange } from "@/types";

/**
 * The single source of truth for overlap. Both the API and the calendar UI use it.
 *
 * The end date is treated as checkout (exclusive), so a booking ending on the 8th
 * and one starting on the 8th do not clash — a van returned in the morning can go
 * out again the same afternoon.
 */
export function rangesOverlap(aStart: Date | string, aEnd: Date | string, bStart: Date | string, bEnd: Date | string): boolean {
  return toUtcDay(aStart).getTime() < toUtcDay(bEnd).getTime()
      && toUtcDay(aEnd).getTime() > toUtcDay(bStart).getTime();
}

/** Mongo filter matching any live reservation that clashes with the given range. */
export function conflictFilter(vanId: string, start: Date, end: Date): FilterQuery<Record<string, unknown>> {
  return {
    vanId,
    status: { $ne: RESERVATION_STATUS.CANCELLED },
    startDate: { $lt: end },
    endDate: { $gt: start },
  };
}

/** True when a candidate range is free against a list of already-booked ranges. */
export function isRangeFree(ranges: DateRange[], start: Date | string, end: Date | string): boolean {
  return !ranges.some((r) => rangesOverlap(start, end, r.from, r.to));
}

/** Every individual day covered by the booked ranges, for disabling calendar cells. */
export function blockedDays(ranges: DateRange[]): Set<string> {
  const days = new Set<string>();
  for (const range of ranges) {
    const end = toUtcDay(range.to).getTime();
    for (let t = toUtcDay(range.from).getTime(); t < end; t += 86_400_000) {
      days.add(new Date(t).toISOString().slice(0, 10));
    }
  }
  return days;
}
