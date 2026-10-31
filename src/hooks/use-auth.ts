"use client";

import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { sendData } from "@/lib/axios";
import { API } from "@/constants/routes";
import type { SessionUser } from "@/types";
import type { LoginDto } from "@/features/auth/dto/login.dto";

export function useLogin(): UseMutationResult<SessionUser, Error, LoginDto> {
  return useMutation({ mutationFn: (input) => sendData<SessionUser>(API.login, input) });
}

export function useLogout(): UseMutationResult<{ signedOut: boolean }, Error, void> {
  return useMutation({ mutationFn: () => sendData<{ signedOut: boolean }>(API.logout) });
}
