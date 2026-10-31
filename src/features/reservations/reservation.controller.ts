import "server-only";
import type { NextRequest, NextResponse } from "next/server";
import { ok } from "@/lib/api-response";
import { AppError, handleError } from "@/lib/errors";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { MESSAGES } from "@/constants/messages";
import { REFERENCE } from "@/constants/reservation-status";
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

/** Generous for a real customer tapping the toggle, useless for a guesser. */
const LOCK_ATTEMPTS_PER_MINUTE = 20;

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

/**
 * The only unauthenticated mutation in the app, because the customer has no
 * account — the booking reference is the credential.
 *
 * Two guards make that safe enough to ship: the reference must look like one
 * before we touch the database, and a caller gets a handful of attempts a
 * minute, so the 26^8 keyspace can't be walked.
 */
export async function lockHandler(request: NextRequest, params: { id: string }): Promise<NextResponse> {
  try {
    const reference = params.id.trim().toUpperCase();
    if (!REFERENCE.PATTERN.test(reference)) throw AppError.badRequest(MESSAGES.BAD_REFERENCE);

    rateLimit(`lock:${clientIp(request)}`, LOCK_ATTEMPTS_PER_MINUTE);

    const body = lockDto.parse(await request.json());
    return ok(await setLockState(reference, body.unlock));
  } catch (error) {
    return handleError(error);
  }
}
