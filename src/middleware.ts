import { NextResponse, type NextRequest } from "next/server";
import { verifySession } from "@/features/auth/session";
import { SESSION_COOKIE, ROUTES } from "@/constants/routes";

/**
 * Guards admin pages only. API routes call requireAdmin() themselves, because
 * middleware can be bypassed by anything that reaches the handler directly.
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === ROUTES.adminLogin) {
    if (session) return NextResponse.redirect(new URL(ROUTES.admin, request.url));
    return NextResponse.next();
  }

  if (!session) {
    const url = new URL(ROUTES.adminLogin, request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
