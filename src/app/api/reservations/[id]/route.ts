import type { NextRequest, NextResponse } from "next/server";
import {
  getReservationHandler,
  updateReservationHandler,
} from "@/features/reservations/reservation.controller";

export const dynamic = "force-dynamic";

export function GET(_request: NextRequest, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  return ctx.params.then(getReservationHandler);
}

export function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  return ctx.params.then((params) => updateReservationHandler(request, params));
}
