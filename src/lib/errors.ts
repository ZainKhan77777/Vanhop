import type { NextResponse } from "next/server";
import { ZodError } from "zod";
import { fail } from "./api-response";
import { MESSAGES } from "@/constants/messages";

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(message: string, statusCode = 400, code = "APP_ERROR") {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
  }

  static badRequest(message: string): AppError { return new AppError(message, 400, "BAD_REQUEST"); }
  static unauthorized(message: string = MESSAGES.AUTH_REQUIRED): AppError { return new AppError(message, 401, "UNAUTHORIZED"); }
  static forbidden(message: string = MESSAGES.FORBIDDEN): AppError { return new AppError(message, 403, "FORBIDDEN"); }
  static notFound(message: string = MESSAGES.NOT_FOUND): AppError { return new AppError(message, 404, "NOT_FOUND"); }
  static conflict(message: string): AppError { return new AppError(message, 409, "CONFLICT"); }
}

/** Single place that turns anything thrown in a controller into the envelope. */
export function handleError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    const first = error.issues[0];
    return fail(first ? first.message : MESSAGES.INVALID_INPUT, 422, "VALIDATION_ERROR");
  }
  if (error instanceof AppError) return fail(error.message, error.statusCode, error.code);

  // Mongoose and driver internals must never reach the client.
  console.error("[unhandled]", error);
  return fail(MESSAGES.SERVER_ERROR, 500, "SERVER_ERROR");
}
