import { NextResponse } from "next/server";
import { getPublishedPortfolio } from "../../../lib/content/repository.server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getPublishedPortfolio();
    return NextResponse.json(
      { ok: true, data },
      { headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=300" } },
    );
  } catch {
    return NextResponse.json(
      { ok: false, message: "Portfolio content is temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
