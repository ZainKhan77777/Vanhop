import "server-only";
import type { NextRequest, NextResponse } from "next/server";
import { ok } from "@/lib/api-response";
import { handleError } from "@/lib/errors";
import { requireAdmin } from "../auth/guards/require-admin";
import { createReservationDto } from "./dto/create-reservation.dto";
import { updateReservationDto } from "./dto/update-reservation.dto";
import { listReservationsDto } from "./dto/list-reservations.dto";
import { lockDto } from "./dto/lock.dto";
import {
  createReservation,
  listReservations,
  findReservationOrThrow,
  cancelReservation,
  setLockState,
} from "./reservation.service";

export async function createReservationHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const body = createReservationDto.parse(await request.json());
    return ok(await createReservation(body), 201);
  } catch (error) {
    return handleError(error);
  }
}

export async function listReservationsHandler(request: NextRequest): Promise<NextResponse> {
  try {
    await requireAdmin();
    const url = new URL(request.url);
    const query = listReservationsDto.parse(Object.fromEntries(url.searchParams));
    return ok(await listReservations(query));
  } catch (error) {
    return handleError(error);
  }
}

export async function getReservationHandler(params: { id: string }): Promise<NextResponse> {
  try {
    await requireAdmin();
    return ok(await findReservationOrThrow(params.id));
  } catch (error) {
    return handleError(error);
  }
}

export async function updateReservationHandler(
  request: NextRequest,
  params: { id: string },
): Promise<NextResponse> {
  try {
    await requireAdmin();
    updateReservationDto.parse(await request.json());
    return ok(await cancelReservation(params.id));
  } catch (error) {
    return handleError(error);
  }
}

export async function lockHandler(request: NextRequest, params: { id: string }): Promise<NextResponse> {
  try {
    const body = lockDto.parse(await request.json());
    return ok(await setLockState(params.id, body.unlock));
  } catch (error) {
    return handleError(error);
  }
}
