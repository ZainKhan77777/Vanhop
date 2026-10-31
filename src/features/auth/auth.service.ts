import "server-only";
import bcrypt from "bcryptjs";
import { connectDb } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { MESSAGES } from "@/constants/messages";
import type { SessionUser } from "@/types";
import type { UserRole } from "@/constants/reservation-status";
import { User, type UserDocument } from "./user.model";

export async function verifyCredentials(email: string, password: string): Promise<SessionUser> {
  await connectDb();
  const user = await User.findOne({ email: email.toLowerCase() }).lean<UserDocument | null>();

  // Hash a dummy value when the user is missing so the response time doesn't
  // reveal which emails exist.
  const hash = user?.passwordHash ?? "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin";
  const matches = await bcrypt.compare(password, hash);
  if (!user || !matches) throw AppError.unauthorized(MESSAGES.INVALID_CREDENTIALS);

  return { id: String(user._id), email: user.email, role: user.role as UserRole };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}
