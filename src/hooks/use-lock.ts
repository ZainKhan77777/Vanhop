"use client";

import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { sendData } from "@/lib/axios";
import { API } from "@/constants/routes";
import type { ReservationDto } from "@/types";

export function useLock(reservationId: string): UseMutationResult<ReservationDto, Error, boolean> {
  return useMutation({
    mutationFn: (unlock) => sendData<ReservationDto>(API.lock(reservationId), { unlock }),
  });
}
