import "server-only";
import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";
import { USER_ROLE, USER_ROLES } from "@/constants/reservation-status";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: USER_ROLES, default: USER_ROLE.ADMIN },
  },
  { timestamps: true },
);

// The hash must never travel further than the service layer.
userSchema.set("toJSON", {
  transform: (_doc, ret: Record<string, unknown>) => {
    delete ret.passwordHash;
    return ret;
  },
});

export type UserDocument = InferSchemaType<typeof userSchema> & { _id: Schema.Types.ObjectId };

export const User: Model<UserDocument> =
  (models.User as Model<UserDocument>) ?? model<UserDocument>("User", userSchema);
