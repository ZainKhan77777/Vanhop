/**
 * Feature barrel. Next.js has no DI container, so a "module" here is just the
 * public surface of the feature — everything outside imports from this file.
 */
export { Van } from "./van.model";
export { listActiveVans, findVanOrThrow } from "./van.service";
export { listVansHandler, availabilityHandler } from "./van.controller";
export { createVanDto, type CreateVanDto } from "./dto/create-van.dto";
