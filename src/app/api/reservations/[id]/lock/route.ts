import type { NextRequest, NextResponse } from "next/server";
import { lockHandler } from "@/features/reservations/reservation.controller";

export const dynamic = "force-dynamic";

export function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  return ctx.params.then((params) => lockHandler(request, params));
}
