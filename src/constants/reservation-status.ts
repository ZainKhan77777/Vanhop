export const RESERVATION_STATUS = {
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
} as const;

export type ReservationStatus = (typeof RESERVATION_STATUS)[keyof typeof RESERVATION_STATUS];
export const RESERVATION_STATUSES = Object.values(RESERVATION_STATUS);

export const USER_ROLE = { ADMIN: "ADMIN", STAFF: "STAFF" } as const;
export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];
export const USER_ROLES = Object.values(USER_ROLE);

export const ACCESS_ACTION = { LOCK: "LOCK", UNLOCK: "UNLOCK" } as const;
export type AccessAction = (typeof ACCESS_ACTION)[keyof typeof ACCESS_ACTION];

/** Derived label shown in the UI, based on today's date rather than stored state. */
export const TIMELINE = {
  OUT: { key: "out", label: "Out now" },
  SOON: { key: "soon", label: "Upcoming" },
  DONE: { key: "fin", label: "Completed" },
  CANCELLED: { key: "cancelled", label: "Cancelled" },
} as const;

export const PRICING = { CLEANING_FEE: 25, DEPOSIT: 300 } as const;

export const PHONE_KEY = {
  /**
   * Off for the demo, so anyone holding a reference can try the lock/unlock
   * button straight after booking instead of waiting for the pickup day.
   *
   * Set this to true for a real deployment: the key then only works between the
   * pickup and return dates. Both the API and the key page read this flag, so
   * flipping it here changes the rule and the button in one go.
   */
  ENFORCE_RENTAL_WINDOW: false,
} as const;

/**
 * The booking reference doubles as the phone key, so it is generated from a
 * CSPRNG rather than from a counter or a timestamp. The alphabet drops the
 * characters people misread off a screen: B/8, I/1, O/0, S/5, Z/2.
 */
export const REFERENCE = {
  PREFIX: "VH-",
  ALPHABET: "ACDEFGHJKLMNPQRTUVWXY34679",
  LENGTH: 8,
  /** Lenient on purpose: it also has to match references issued before the change. */
  PATTERN: /^VH-[A-Z0-9]{4,12}$/,
} as const;
