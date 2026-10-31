"use client";

import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { sendData } from "@/lib/axios";
import { API } from "@/constants/routes";
import type { ReservationDto } from "@/types";

/** Keyed on the booking reference — the lock endpoint does not accept Mongo ids. */
export function useLock(reference: string): UseMutationResult<ReservationDto, Error, boolean> {
  return useMutation({
    mutationFn: (unlock) => sendData<ReservationDto>(API.lock(reference), { unlock }),
  });
}
