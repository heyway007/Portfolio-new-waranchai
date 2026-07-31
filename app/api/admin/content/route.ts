import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/auth/require-admin.server";
import { loadPortfolio } from "../../../../lib/content/database.server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const db = await requireAdmin(request);
    return NextResponse.json({ ok: true, data: await loadPortfolio(db, true) });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json(
      { ok: false, message: "Unable to load portfolio content." },
      { status: 503 },
    );
  }
}

