export const ROUTES = {
  home: "/",
  book: (vanId: string) => `/book/${vanId}`,
  keys: (reference: string) => `/keys/${reference}`,
  keysLookup: "/keys",
  adminLogin: "/admin/login",
  admin: "/admin",
  adminReservations: "/admin/reservations",
  adminFleet: "/admin/fleet",
} as const;

export const API = {
  vans: "/vans",
  availability: (vanId: string) => `/vans/${vanId}/availability`,
  reservations: "/reservations",
  reservation: (id: string) => `/reservations/${id}`,
  lock: (id: string) => `/reservations/${id}/lock`,
  login: "/auth/login",
  logout: "/auth/logout",
  me: "/auth/me",
} as const;

export const SESSION_COOKIE = "vh_session";
