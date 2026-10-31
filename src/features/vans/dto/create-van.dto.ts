import { z } from "zod";

export const createVanDto = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers and hyphens"),
  kind: z.string().min(2),
  description: z.string().min(10),
  pricePerDay: z.number().int().positive(),
  imageUrl: z.string().url(),
  specs: z.array(z.string()).default([]),
  badge: z.string().nullable().default(null),
  isActive: z.boolean().default(true),
});

export type CreateVanDto = z.infer<typeof createVanDto>;
