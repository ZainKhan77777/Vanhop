import "server-only";
import type { NextRequest, NextResponse } from "next/server";
import { ok } from "@/lib/api-response";
import { handleError } from "@/lib/errors";
import { listActiveVans } from "./van.service";
import { getAvailability } from "../reservations/reservation.service";
import { availabilityQueryDto } from "./dto/availability-query.dto";

export async function listVansHandler(): Promise<NextResponse> {
  try {
    return ok(await listActiveVans());
  } catch (error) {
    return handleError(error);
  }
}

export async function availabilityHandler(
  request: NextRequest,
  params: { id: string },
): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const query = availabilityQueryDto.parse({
      from: url.searchParams.get("from") ?? undefined,
      to: url.searchParams.get("to") ?? undefined,
    });
    return ok(await getAvailability(params.id, query.from, query.to));
  } catch (error) {
    return handleError(error);
  }
}
