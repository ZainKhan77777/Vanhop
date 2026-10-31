import "server-only";
import type { NextRequest } from "next/server";
import { AppError } from "./errors";
import { MESSAGES } from "@/constants/messages";

/**
 * A deliberately small fixed-window limiter, held in process memory.
 *
 * It exists to make guessing a booking reference pointless rather than to be a
 * production rate limiter: serverless instances don't share this map, so a real
 * deployment would move the counter to Redis or Upstash. For a single Node
 * process — dev, or one Vercel instance — it does the job.
 */
const WINDOW_MS = 60_000;
const hits = new Map<string, { count: number; resetAt: number }>();

export function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
}

/** Throws a 429-ish AppError once `limit` calls for this key land inside the window. */
export function rateLimit(key: string, limit: number): void {
  const now = Date.now();

  // Cheap sweep so the map can't grow without bound in a long-lived process.
  if (hits.size > 5_000) {
    for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
  }

  const entry = hits.get(key);
  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }

  entry.count += 1;
  if (entry.count > limit) throw new AppError(MESSAGES.TOO_MANY_ATTEMPTS, 429, "RATE_LIMITED");
}
