import "server-only";
import mongoose, { isValidObjectId, type FilterQuery } from "mongoose";
import { connectDb } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { MESSAGES } from "@/constants/messages";
import { PRICING, RESERVATION_STATUS, ACCESS_ACTION } from "@/constants/reservation-status";
import { nights, toUtcDay, isoDay } from "@/lib/format";
import { Van, type VanDocument } from "../vans/van.model";
import { Reservation, type ReservationDocument } from "./reservation.model";
import { conflictFilter } from "./availability";
import { toReservationDto } from "./reservation.types";
import type { CreateReservationDto } from "./dto/create-reservation.dto";
import type { ListReservationsDto } from "./dto/list-reservations.dto";
import type { AvailabilityDto, ReservationDto, ReservationListDto, DateRange } from "@/types";

const VAN_FIELDS = "name kind imageUrl pricePerDay";

/* ---------------------------------------------------------------- availability */

export async function getAvailability(vanIdOrSlug: string, from?: string, to?: string): Promise<AvailabilityDto> {
  await connectDb();
  const van = await resolveVan(vanIdOrSlug);

  // Only look ahead; past bookings can never clash with a new one.
  const docs = await Reservation.find({
    vanId: van._id,
    status: { $ne: RESERVATION_STATUS.CANCELLED },
    endDate: { $gte: startOfToday() },
  })
    .select("startDate endDate")
    .sort({ startDate: 1 })
    .lean<Array<Pick<ReservationDocument, "startDate" | "endDate">>>();

  const bookedRanges: DateRange[] = docs.map((d) => ({ from: isoDay(d.startDate), to: isoDay(d.endDate) }));

  let available = true;
  if (from && to) {
    const start = toUtcDay(from);
    const end = toUtcDay(to);
    available = end > start && (await Reservation.countDocuments(conflictFilter(String(van._id), start, end))) === 0;
  }

  return { available, bookedRanges };
}

/* -------------------------------------------------------------------- create */

export async function createReservation(input: CreateReservationDto): Promise<ReservationDto> {
  await connectDb();
  const van = await resolveVan(input.vanId);

  const start = toUtcDay(input.startDate);
  const end = toUtcDay(input.endDate);
  if (end <= start) throw AppError.badRequest(MESSAGES.DATE_ORDER);
  if (start < startOfToday()) throw AppError.badRequest(MESSAGES.DATE_IN_PAST);

  const days = nights(start, end);
  const payload = {
    vanId: van._id,
    customer: input.customer,
    startDate: start,
    endDate: end,
    pricePerDaySnapshot: van.pricePerDay,
    cleaningFee: PRICING.CLEANING_FEE,
    totalAmount: days * van.pricePerDay + PRICING.CLEANING_FEE,
    status: RESERVATION_STATUS.CONFIRMED,
  };

  const id = await insertGuarded(String(van._id), start, end, payload);
  const doc = await findPopulated({ _id: id });
  if (!doc) throw AppError.notFound(MESSAGES.RESERVATION_NOT_FOUND);
  return toReservationDto(doc);
}

/**
 * Two people can pass an availability check in the same instant, so the check and
 * the insert have to be atomic.
 *
 * Preferred path: a Mongoose transaction — Atlas runs a replica set, so the
 * re-check and the insert commit together or not at all.
 *
 * Fallback: a standalone mongod (local dev) has no transactions, so we insert and
 * immediately re-check. If another booking slipped in, we delete ours and report
 * the clash. The write that committed first wins; the loser never stays stored.
 */
async function insertGuarded(
  vanId: string,
  start: Date,
  end: Date,
  payload: Record<string, unknown>,
): Promise<string> {
  const session = await mongoose.startSession();
  try {
    let createdId = "";
    await session.withTransaction(async () => {
      const clash = await Reservation.countDocuments(conflictFilter(vanId, start, end)).session(session);
      if (clash > 0) throw AppError.conflict(MESSAGES.DATES_UNAVAILABLE);
      const [created] = await Reservation.create([{ ...payload, reference: newReference() }], { session });
      createdId = String(created._id);
    });
    return createdId;
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (!isTransactionUnsupported(error)) throw error;

    const created = await Reservation.create({ ...payload, reference: newReference() });
    const clash = await Reservation.countDocuments({
      ...conflictFilter(vanId, start, end),
      _id: { $ne: created._id },
    });
    if (clash > 0) {
      await Reservation.deleteOne({ _id: created._id });
      throw AppError.conflict(MESSAGES.DATES_UNAVAILABLE);
    }
    return String(created._id);
  } finally {
    await session.endSession();
  }
}

/* ---------------------------------------------------------------------- read */

export async function listReservations(query: ListReservationsDto): Promise<ReservationListDto> {
  await connectDb();
  const filter: FilterQuery<ReservationDocument> = {};
  if (query.status) filter.status = query.status;
  if (query.q) {
    const rx = new RegExp(escapeRegex(query.q), "i");
    Object.assign(filter, { $or: [{ reference: rx }, { "customer.name": rx }, { "customer.email": rx }] });
  }

  const skip = (query.page - 1) * query.limit;
  const [docs, total] = await Promise.all([
    Reservation.find(filter).populate<{ vanId: VanDocument }>("vanId", VAN_FIELDS)
      .sort({ createdAt: -1 }).skip(skip).limit(query.limit).lean(),
    Reservation.countDocuments(filter),
  ]);

  return {
    items: docs.map((d) => toReservationDto(d as never)),
    total,
    page: query.page,
    pages: Math.max(1, Math.ceil(total / query.limit)),
  };
}

export async function findReservationOrThrow(idOrReference: string): Promise<ReservationDto> {
  await connectDb();
  const doc = await findPopulated(byIdOrReference(idOrReference));
  if (!doc) throw AppError.notFound(MESSAGES.RESERVATION_NOT_FOUND);
  return toReservationDto(doc);
}

/* -------------------------------------------------------------------- mutate */

export async function cancelReservation(id: string): Promise<ReservationDto> {
  await connectDb();
  const current = await Reservation.findOne(byIdOrReference(id));
  if (!current) throw AppError.notFound(MESSAGES.RESERVATION_NOT_FOUND);
  if (current.status === RESERVATION_STATUS.CANCELLED) throw AppError.conflict(MESSAGES.ALREADY_CANCELLED);

  current.status = RESERVATION_STATUS.CANCELLED;
  current.isUnlocked = false;
  await current.save();

  return findReservationOrThrow(String(current._id));
}

export async function setLockState(idOrReference: string, unlock: boolean): Promise<ReservationDto> {
  await connectDb();
  const current = await Reservation.findOne(byIdOrReference(idOrReference));
  if (!current) throw AppError.notFound(MESSAGES.RESERVATION_NOT_FOUND);
  if (current.status !== RESERVATION_STATUS.CONFIRMED) throw AppError.forbidden(MESSAGES.KEY_NOT_ACTIVE);

  // The phone key is only live between pickup and return.
  const today = startOfToday();
  if (toUtcDay(current.startDate) > today || toUtcDay(current.endDate) < today) {
    throw AppError.forbidden(MESSAGES.KEY_NOT_ACTIVE);
  }

  current.isUnlocked = unlock;
  current.accessLog = [
    { action: unlock ? ACCESS_ACTION.UNLOCK : ACCESS_ACTION.LOCK, at: new Date() },
    ...(current.accessLog ?? []),
  ].slice(0, 20) as typeof current.accessLog;
  await current.save();

  return findReservationOrThrow(String(current._id));
}

/* ------------------------------------------------------------------- helpers */

async function resolveVan(idOrSlug: string): Promise<VanDocument> {
  const query = isValidObjectId(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug.toLowerCase() };
  const van = await Van.findOne({ ...query, isActive: true }).lean<VanDocument | null>();
  if (!van) throw AppError.notFound(MESSAGES.VAN_NOT_FOUND);
  return van;
}

function findPopulated(filter: FilterQuery<ReservationDocument>) {
  return Reservation.findOne(filter).populate<{ vanId: VanDocument }>("vanId", VAN_FIELDS).lean();
}

function byIdOrReference(value: string): FilterQuery<ReservationDocument> {
  return isValidObjectId(value) ? { _id: value } : { reference: value.toUpperCase() };
}

function newReference(): string {
  return `VH-${Math.floor(1000 + Math.random() * 9000)}${Date.now().toString(36).slice(-2).toUpperCase()}`;
}

function startOfToday(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function isTransactionUnsupported(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /Transaction|replica set|sessions are not supported/i.test(message);
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
