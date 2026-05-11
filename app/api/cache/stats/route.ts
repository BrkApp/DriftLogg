import { NextResponse } from "next/server";
import { cache } from "@/lib/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey) {
    return NextResponse.json(
      { error: "ADMIN_KEY is not set on the server." },
      { status: 503 }
    );
  }
  const provided = request.headers.get("x-admin-key");
  if (provided !== adminKey) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const stats = await cache.stats();
  return NextResponse.json(stats);
}
