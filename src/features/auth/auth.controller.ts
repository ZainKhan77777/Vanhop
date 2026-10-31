import "server-only";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import { ok } from "@/lib/api-response";
import { handleError } from "@/lib/errors";
import { SESSION_COOKIE } from "@/constants/routes";
import { loginDto } from "./dto/login.dto";
import { verifyCredentials } from "./auth.service";
import { signSession, SESSION_MAX_AGE } from "./session";
import { getSession, requireSession } from "./guards/require-session";

export async function loginHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const body = loginDto.parse(await request.json());
    const user = await verifyCredentials(body.email, body.password);
    const token = await signSession(user);

    const store = await cookies();
    store.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    return ok(user);
  } catch (error) {
    return handleError(error);
  }
}

export async function logoutHandler(): Promise<NextResponse> {
  try {
    const store = await cookies();
    store.delete(SESSION_COOKIE);
    return ok({ signedOut: true });
  } catch (error) {
    return handleError(error);
  }
}

export async function meHandler(): Promise<NextResponse> {
  try {
    return ok(await requireSession());
  } catch (error) {
    return handleError(error);
  }
}

export { getSession };
