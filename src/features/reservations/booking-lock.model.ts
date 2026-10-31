import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

/**
 * One row per thing that bookings have to queue behind — a van, or a customer.
 *
 * It exists purely to be written to. A MongoDB transaction gives snapshot
 * isolation, not serialisability: two transactions that each *read* "no
 * clashing booking" and then *insert* two different reservation documents are
 * not in conflict as far as the server is concerned, so both commit and the van
 * ends up double-booked. Writes to the *same* document do conflict, so bumping
 * a shared counter here forces concurrent bookings for one van into a queue.
 * The loser is retried by withTransaction, sees the winner's row, and 409s.
 */
const bookingLockSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    seq: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export type BookingLockDocument = InferSchemaType<typeof bookingLockSchema>;

export const BookingLock: Model<BookingLockDocument> =
  (models.BookingLock as Model<BookingLockDocument>) ??
  model<BookingLockDocument>("BookingLock", bookingLockSchema);

export const lockKey = {
  van: (vanId: string) => `van:${vanId}`,
  customer: (email: string) => `customer:${email.trim().toLowerCase()}`,
};
