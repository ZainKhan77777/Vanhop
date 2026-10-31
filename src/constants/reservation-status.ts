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
