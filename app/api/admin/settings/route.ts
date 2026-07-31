import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/auth/require-admin.server";
import { saveSettings } from "../../../../lib/content/database.server";
import { validateSettings } from "../../../../lib/content/validation";
import type { SiteSettings } from "../../../../lib/content/types";

export const dynamic = "force-dynamic";

export async function PUT(request: Request) {
  try {
    const db = await requireAdmin(request);
    const input = (await request.json()) as SiteSettings;
    const result = validateSettings(input);
    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }
    await saveSettings(db, result.value);
    return NextResponse.json({ ok: true, value: result.value });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json(
      { ok: false, message: "Unable to save settings." },
      { status: 503 },
    );
  }
}

