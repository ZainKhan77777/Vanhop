import axios, { AxiosError } from "axios";
import type { ApiEnvelope } from "./api-response";

export const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Turn the envelope's error into a thrown Error so React Query handles it normally.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiEnvelope<unknown>>) =>
    Promise.reject(new Error(error.response?.data?.error?.message ?? "Something went wrong. Please try again.")),
);

export async function getData<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const { data } = await api.get<ApiEnvelope<T>>(url, { params });
  if (!data.success || data.data === null) throw new Error(data.error?.message ?? "Request failed");
  return data.data;
}

export async function sendData<T>(url: string, body?: unknown, method: "post" | "patch" = "post"): Promise<T> {
  const { data } = await api.request<ApiEnvelope<T>>({ url, method, data: body });
  if (!data.success || data.data === null) throw new Error(data.error?.message ?? "Request failed");
  return data.data;
}
