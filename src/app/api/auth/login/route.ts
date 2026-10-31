import type { NextRequest, NextResponse } from "next/server";
import { loginHandler } from "@/features/auth/auth.controller";

export const dynamic = "force-dynamic";

export function POST(request: NextRequest): Promise<NextResponse> {
  return loginHandler(request);
}
