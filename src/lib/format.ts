const DAY_MS = 86_400_000;

/** Georgian lari. Exported so JSX can use it \u2014 "\u20BE" in an attribute is literal text. */
export const CURRENCY = "\u20BE";

export function gel(amount: number): string {
  return `${CURRENCY}${Math.round(amount).toLocaleString("en-GB")}`;
}

/** Normalises any date to UTC midnight so comparisons ignore clock time and zone. */
export function toUtcDay(value: Date | string): Date {
  const d = new Date(value);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function isoDay(value: Date | string): string {
  return toUtcDay(value).toISOString().slice(0, 10);
}

/**
 * Billable days for a rental, where the return date is the last day the
 * customer keeps the van — not a checkout the morning after.
 *
 * Pick up and return on the same day and that is one day, which is what people
 * expect when they tap a single date in the calendar.
 */
export function rentalDays(from: Date | string, to: Date | string): number {
  const span = Math.round((toUtcDay(to).getTime() - toUtcDay(from).getTime()) / DAY_MS);
  return Math.max(0, span + 1);
}

export function addDays(value: Date | string, days: number): Date {
  return new Date(toUtcDay(value).getTime() + days * DAY_MS);
}

export function formatDay(value: Date | string): string {
  return toUtcDay(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

export function formatLongDay(value: Date | string): string {
  return toUtcDay(value).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "G";
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
