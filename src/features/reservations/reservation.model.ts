import "server-only";
import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";
import { RESERVATION_STATUS, RESERVATION_STATUSES, ACCESS_ACTION } from "@/constants/reservation-status";

const accessEntrySchema = new Schema(
  {
    action: { type: String, enum: Object.values(ACCESS_ACTION), required: true },
    at: { type: Date, default: () => new Date() },
  },
  { _id: false },
);

const reservationSchema = new Schema(
  {
    reference: { type: String, required: true, unique: true, uppercase: true, trim: true },
    vanId: { type: Schema.Types.ObjectId, ref: "Van", required: true },
    customer: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, lowercase: true, trim: true },
      phone: { type: String, required: true, trim: true },
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    // Copied at booking time so later price changes never rewrite past bookings.
    pricePerDaySnapshot: { type: Number, required: true, min: 0 },
    cleaningFee: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: RESERVATION_STATUSES, default: RESERVATION_STATUS.CONFIRMED },
    isUnlocked: { type: Boolean, default: false },
    accessLog: { type: [accessEntrySchema], default: [] },
  },
  { timestamps: true },
);

// Availability lookups filter on van + overlapping range, so index all three.
reservationSchema.index({ vanId: 1, startDate: 1, endDate: 1 });
reservationSchema.index({ createdAt: -1 });

export type ReservationDocument = InferSchemaType<typeof reservationSchema> & { _id: Schema.Types.ObjectId };

export const Reservation: Model<ReservationDocument> =
  (models.Reservation as Model<ReservationDocument>) ??
  model<ReservationDocument>("Reservation", reservationSchema);
