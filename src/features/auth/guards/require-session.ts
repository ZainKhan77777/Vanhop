import "server-only";
import { cookies } from "next/headers";
import { AppError } from "@/lib/errors";
import { SESSION_COOKIE } from "@/constants/routes";
import type { SessionUser } from "@/types";
import { verifySession } from "../session";

/** Returns the signed-in user, or null when there is no valid session. */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

export async function requireSession(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) throw AppError.unauthorized();
  return user;
}
