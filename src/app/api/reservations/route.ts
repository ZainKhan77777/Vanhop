import type { NextRequest, NextResponse } from "next/server";
import {
  createReservationHandler,
  listReservationsHandler,
} from "@/features/reservations/reservation.controller";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest): Promise<NextResponse> {
  return listReservationsHandler(request);
}

export function POST(request: NextRequest): Promise<NextResponse> {
  return createReservationHandler(request);
}
