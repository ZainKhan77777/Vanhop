import "server-only";
import { randomInt } from "node:crypto";
import mongoose, { isValidObjectId, type FilterQuery } from "mongoose";
import { connectDb } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { MESSAGES } from "@/constants/messages";
import { PRICING, RESERVATION_STATUS, ACCESS_ACTION, REFERENCE, PHONE_KEY } from "@/constants/reservation-status";
import { rentalDays, toUtcDay, isoDay } from "@/lib/format";
import { Van, type VanDocument } from "../vans/van.model";
import { Reservation, type ReservationDocument } from "./reservation.model";
import { BookingLock, lockKey } from "./booking-lock.model";
import { sendBookingConfirmation } from "./reservation.mail";
import { conflictFilter, customerConflictFilter } from "./availability";
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
  // Equal dates are a one-day rental, not an error.
  if (end < start) throw AppError.badRequest(MESSAGES.DATE_ORDER);
  if (start < startOfToday()) throw AppError.badRequest(MESSAGES.DATE_IN_PAST);

  const days = rentalDays(start, end);
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

  const id = await insertGuarded(String(van._id), input.customer.email, start, end, payload);
  const doc = await findPopulated({ _id: id });
  if (!doc) throw AppError.notFound(MESSAGES.RESERVATION_NOT_FOUND);

  const reservation = toReservationDto(doc);

  // The booking is already committed, so mail must not be able to undo it.
  // sendBookingConfirmation swallows its own errors; this guard is belt and braces.
  try {
    await sendBookingConfirmation(reservation);
  } catch (error) {
    console.error("[reservation] confirmation email failed", error);
  }

  return reservation;
}

/**
 * Two people can pass an availability check in the same instant, so the check and
 * the insert have to be atomic.
 *
 * Two things are checked, both of them races:
 *   1. the van is free for the range;
 *   2. this customer has no other live booking over the same range, on any van.
 *
 * A transaction on its own is NOT enough here, which is the subtle part. Mongo
 * gives snapshot isolation: concurrent transactions each read "nothing clashes"
 * from their own snapshot and then insert two *different* documents, which the
 * server does not consider a conflict. Both commit, and the van is double-booked.
 *
 * So each booking first bumps a counter on a shared BookingLock row — one per
 * van, one per customer. Writing the same document *is* a conflict, so Mongo
 * aborts the loser with a TransientTransactionError, withTransaction retries it,
 * and the retry reads the winner's reservation and throws a clean 409.
 *
 * Fallback: a standalone mongod (local dev) has no transactions. There we insert
 * first and re-check; the row with the lowest _id wins so the losers — and only
 * the losers — delete themselves.
 */
async function insertGuarded(
  vanId: string,
  email: string,
  start: Date,
  end: Date,
  payload: Record<string, unknown>,
): Promise<string> {
  // Created outside the transaction: a concurrent upsert of a brand-new key
  // raises a duplicate-key error, which is not transient and would not be retried.
  await ensureLocks(vanId, email);

  const session = await mongoose.startSession();
  try {
    let createdId = "";
    await session.withTransaction(async () => {
      await takeLocks(vanId, email, session);
      await assertNoClash(vanId, email, start, end, null, session);
      const [created] = await Reservation.create([{ ...payload, reference: newReference() }], { session });
      createdId = String(created._id);
    });
    return createdId;
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (!isTransactionUnsupported(error)) throw error;

    const created = await Reservation.create({ ...payload, reference: newReference() });
    try {
      await assertNoClash(vanId, email, start, end, String(created._id), null);
    } catch (clash) {
      await Reservation.deleteOne({ _id: created._id });
      throw clash;
    }
    return String(created._id);
  } finally {
    await session.endSession();
  }
}

/** Makes sure both lock rows exist, so the in-transaction bump is a plain update. */
async function ensureLocks(vanId: string, email: string): Promise<void> {
  const keys = [lockKey.van(vanId), lockKey.customer(email)];
  await Promise.all(
    keys.map((key) =>
      BookingLock.updateOne({ key }, { $setOnInsert: { key, seq: 0 } }, { upsert: true })
        // Two requests can create the same key at once; whoever loses just carries on.
        .catch((error: unknown) => {
          if ((error as { code?: number }).code !== 11000) throw error;
        }),
    ),
  );
}

/** The write that makes concurrent bookings for one van collide. */
async function takeLocks(vanId: string, email: string, session: mongoose.ClientSession): Promise<void> {
  // Always in the same order, so two requests can never deadlock holding one each.
  for (const key of [lockKey.van(vanId), lockKey.customer(email)].sort()) {
    await BookingLock.updateOne({ key }, { $inc: { seq: 1 } }, { session });
  }
}

/** Both conflict checks, sharing one shape so the two paths above can't drift. */
async function assertNoClash(
  vanId: string,
  email: string,
  start: Date,
  end: Date,
  excludeId: string | null,
  session: mongoose.ClientSession | null,
): Promise<void> {
  // Without transactions the losers must not all delete each other, so the
  // oldest _id wins and only rows created after it count as a clash.
  const not = excludeId ? { _id: { $lt: excludeId } } : {};

  const vanClash = await Reservation.countDocuments({ ...conflictFilter(vanId, start, end), ...not })
    .session(session);
  if (vanClash > 0) throw AppError.conflict(MESSAGES.DATES_UNAVAILABLE);

  const ownClash = await Reservation.countDocuments({ ...customerConflictFilter(email, start, end), ...not })
    .session(session);
  if (ownClash > 0) throw AppError.conflict(MESSAGES.CUSTOMER_DOUBLE_BOOKED);
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

/**
 * Deliberately keyed on the booking reference and nothing else.
 *
 * The phone key is unauthenticated by design — the customer never gets an
 * account — so the reference is the credential, the way an airline booking code
 * is. Accepting a Mongo `_id` here as well would mean an id leaked anywhere
 * (an admin URL, a log line) could unlock a van, so ids are not accepted.
 */
export async function setLockState(reference: string, unlock: boolean): Promise<ReservationDto> {
  await connectDb();
  const current = await Reservation.findOne({ reference: reference.trim().toUpperCase() });
  if (!current) throw AppError.notFound(MESSAGES.RESERVATION_NOT_FOUND);
  if (current.status === RESERVATION_STATUS.CANCELLED) throw AppError.forbidden(MESSAGES.KEY_CANCELLED);
  if (current.status !== RESERVATION_STATUS.CONFIRMED) throw AppError.forbidden(MESSAGES.KEY_NOT_ACTIVE);

  // The phone key is only live between pickup and return — unless the demo flag
  // is off, in which case holding the reference is enough.
  if (PHONE_KEY.ENFORCE_RENTAL_WINDOW) {
    const today = startOfToday();
    if (toUtcDay(current.startDate) > today || toUtcDay(current.endDate) < today) {
      throw AppError.forbidden(MESSAGES.KEY_NOT_ACTIVE);
    }
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

/**
 * The reference is the only thing standing between a stranger and someone's
 * phone key, so it comes from a CSPRNG — not Math.random, and not the clock,
 * which would make references issued near each other guessable from one another.
 */
function newReference(): string {
  let out = REFERENCE.PREFIX;
  for (let i = 0; i < REFERENCE.LENGTH; i += 1) {
    out += REFERENCE.ALPHABET[randomInt(REFERENCE.ALPHABET.length)];
  }
  return out;
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
