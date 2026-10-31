"use client";

import { useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from "@tanstack/react-query";
import { getData, sendData } from "@/lib/axios";
import { API } from "@/constants/routes";
import { RESERVATION_STATUS } from "@/constants/reservation-status";
import type { ReservationDto, ReservationListDto } from "@/types";

export interface ReservationFilters { status?: string; q?: string; page?: number }

export function useReservations(filters: ReservationFilters): UseQueryResult<ReservationListDto, Error> {
  return useQuery({
    queryKey: ["reservations", filters],
    queryFn: () => getData<ReservationListDto>(API.reservations, { ...filters, limit: 100 }),
  });
}

export function useCancelReservation(): UseMutationResult<ReservationDto, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => sendData<ReservationDto>(API.reservation(id), { status: RESERVATION_STATUS.CANCELLED }, "patch"),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["reservations"] }),
  });
}
