import type { NextRequest, NextResponse } from "next/server";
import { availabilityHandler } from "@/features/vans/van.controller";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  return ctx.params.then((params) => availabilityHandler(request, params));
}
