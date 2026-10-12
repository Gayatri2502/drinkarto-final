import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Public, dependency-aware liveness check for uptime monitors.
 * It intentionally reports no configuration, tenant, or database details.
 */
export async function GET() {
  const checkedAt = new Date().toISOString();
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json(
      { status: "ok", service: "drinkarto", checkedAt },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { status: "unavailable", service: "drinkarto", checkedAt },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
