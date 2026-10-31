"use client";

import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { sendData } from "@/lib/axios";
import { API } from "@/constants/routes";
import type { ReservationDto } from "@/types";
import type { CreateReservationDto } from "@/features/reservations/dto/create-reservation.dto";

export function useCreateReservation(): UseMutationResult<ReservationDto, Error, CreateReservationDto> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => sendData<ReservationDto>(API.reservations, input),
    onSuccess: (created) => {
      void queryClient.invalidateQueries({ queryKey: ["availability", created.van.id] });
      void queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
  });
}
