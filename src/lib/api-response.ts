import { NextResponse } from "next/server";

export interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  error: { message: string; code: string } | null;
}

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data, error: null } satisfies ApiEnvelope<T>, { status });
}

export function fail(message: string, status = 400, code = "APP_ERROR"): NextResponse {
  return NextResponse.json(
    { success: false, data: null, error: { message, code } } satisfies ApiEnvelope<never>,
    { status },
  );
}
