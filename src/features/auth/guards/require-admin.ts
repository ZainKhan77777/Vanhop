import "server-only";
import { AppError } from "@/lib/errors";
import { USER_ROLE } from "@/constants/reservation-status";
import type { SessionUser } from "@/types";
import { requireSession } from "./require-session";

/**
 * Called explicitly at the top of every admin controller. Middleware alone only
 * guards page navigation, so API routes verify the session again here.
 */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireSession();
  if (user.role !== USER_ROLE.ADMIN) throw AppError.forbidden();
  return user;
}
