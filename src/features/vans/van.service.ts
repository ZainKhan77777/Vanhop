import "server-only";
import { isValidObjectId } from "mongoose";
import { connectDb } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { MESSAGES } from "@/constants/messages";
import type { VanDto } from "@/types";
import { Van, type VanDocument } from "./van.model";
import { toVanDto } from "./van.types";

export async function listActiveVans(): Promise<VanDto[]> {
  await connectDb();
  const docs = await Van.find({ isActive: true }).sort({ pricePerDay: 1 }).lean<VanDocument[]>();
  return docs.map(toVanDto);
}

/** Accepts either a Mongo id or a slug, so URLs can stay readable. */
export async function findVanOrThrow(idOrSlug: string): Promise<VanDto> {
  await connectDb();
  const query = isValidObjectId(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug.toLowerCase() };
  const doc = await Van.findOne({ ...query, isActive: true }).lean<VanDocument | null>();
  if (!doc) throw AppError.notFound(MESSAGES.VAN_NOT_FOUND);
  return toVanDto(doc);
}
