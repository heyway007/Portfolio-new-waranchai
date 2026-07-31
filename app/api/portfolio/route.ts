import { NextResponse } from "next/server";
import { getPublishedPortfolio } from "../../../lib/content/repository.server";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getPublishedPortfolio();
  return NextResponse.json(
    { ok: true, data },
    { headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=300" } },
  );
}

