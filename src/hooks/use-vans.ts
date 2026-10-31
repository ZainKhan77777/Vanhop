"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getData } from "@/lib/axios";
import { API } from "@/constants/routes";
import type { VanDto } from "@/types";

export function useVans(): UseQueryResult<VanDto[], Error> {
  return useQuery({ queryKey: ["vans"], queryFn: () => getData<VanDto[]>(API.vans) });
}
