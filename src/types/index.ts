import type { ReservationStatus, UserRole, AccessAction } from "@/constants/reservation-status";

export interface VanDto {
  id: string;
  name: string;
  slug: string;
  kind: string;
  description: string;
  pricePerDay: number;
  imageUrl: string;
  specs: string[];
  badge: string | null;
}

export interface DateRange { from: string; to: string }

export interface AvailabilityDto {
  available: boolean;
  bookedRanges: DateRange[];
}

export interface AccessEntry { action: AccessAction; at: string }

export interface ReservationDto {
  id: string;
  reference: string;
  van: Pick<VanDto, "id" | "name" | "kind" | "imageUrl" | "pricePerDay">;
  customer: { name: string; email: string; phone: string };
  startDate: string;
  endDate: string;
  nights: number;
  pricePerDaySnapshot: number;
  cleaningFee: number;
  totalAmount: number;
  status: ReservationStatus;
  isUnlocked: boolean;
  accessLog: AccessEntry[];
  createdAt: string;
}

export interface ReservationListDto {
  items: ReservationDto[];
  total: number;
  page: number;
  pages: number;
}

export interface SessionUser { id: string; email: string; role: UserRole }
