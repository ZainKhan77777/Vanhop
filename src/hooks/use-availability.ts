"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getData } from "@/lib/axios";
import { API } from "@/constants/routes";
import type { AvailabilityDto } from "@/types";

export function useAvailability(vanId: string | null): UseQueryResult<AvailabilityDto, Error> {
  return useQuery({
    queryKey: ["availability", vanId],
    queryFn: () => getData<AvailabilityDto>(API.availability(vanId as string)),
    enabled: Boolean(vanId),
  });
}
