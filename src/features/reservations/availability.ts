import type { FilterQuery } from "mongoose";
import { RESERVATION_STATUS } from "@/constants/reservation-status";
import { toUtcDay } from "@/lib/format";
import type { DateRange } from "@/types";

/**
 * The single source of truth for overlap. Both the API and the calendar UI use it.
 *
 * Both ends are inclusive: the return date is the last day the customer has the
 * van, so a booking ending on the 8th and one starting on the 8th DO clash. That
 * also makes a single-day rental expressible — pick up and return on the 6th.
 */
export function rangesOverlap(aStart: Date | string, aEnd: Date | string, bStart: Date | string, bEnd: Date | string): boolean {
  return toUtcDay(aStart).getTime() <= toUtcDay(bEnd).getTime()
      && toUtcDay(aEnd).getTime() >= toUtcDay(bStart).getTime();
}

/** Mongo filter matching any live reservation that clashes with the given range. */
export function conflictFilter(vanId: string, start: Date, end: Date): FilterQuery<Record<string, unknown>> {
  return {
    vanId,
    status: { $ne: RESERVATION_STATUS.CANCELLED },
    startDate: { $lte: end },
    endDate: { $gte: start },
  };
}

/**
 * Mongo filter matching any live reservation this same customer already holds
 * over the given range, on any van.
 *
 * One person cannot drive two vans at once, so overlapping bookings under the
 * same email are a mistake (a double-submitted form) far more often than a real
 * intent. Booking several vans is still fine as long as the dates don't overlap.
 */
export function customerConflictFilter(email: string, start: Date, end: Date): FilterQuery<Record<string, unknown>> {
  return {
    "customer.email": email.trim().toLowerCase(),
    status: { $ne: RESERVATION_STATUS.CANCELLED },
    startDate: { $lte: end },
    endDate: { $gte: start },
  };
}

/** True when a candidate range is free against a list of already-booked ranges. */
export function isRangeFree(ranges: DateRange[], start: Date | string, end: Date | string): boolean {
  return !ranges.some((r) => rangesOverlap(start, end, r.from, r.to));
}

/**
 * Every individual day covered by the booked ranges, for disabling calendar cells.
 * The return day is included, because the van is not back until it is over.
 */
export function blockedDays(ranges: DateRange[]): Set<string> {
  const days = new Set<string>();
  for (const range of ranges) {
    const end = toUtcDay(range.to).getTime();
    for (let t = toUtcDay(range.from).getTime(); t <= end; t += 86_400_000) {
      days.add(new Date(t).toISOString().slice(0, 10));
    }
  }
  return days;
}
