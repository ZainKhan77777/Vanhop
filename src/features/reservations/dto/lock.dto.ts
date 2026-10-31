import { z } from "zod";

export const lockDto = z.object({ unlock: z.boolean() });

export type LockDto = z.infer<typeof lockDto>;
