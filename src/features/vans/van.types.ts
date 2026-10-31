import type { VanDto } from "@/types";
import type { VanDocument } from "./van.model";

/** Mongoose document -> the shape the client is allowed to see. */
export function toVanDto(doc: VanDocument): VanDto {
  return {
    id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    kind: doc.kind,
    description: doc.description,
    pricePerDay: doc.pricePerDay,
    imageUrl: doc.imageUrl,
    specs: doc.specs ?? [],
    badge: doc.badge ?? null,
  };
}
