import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/auth/require-admin.server";
import { createContentEntry } from "../../../../lib/content/database.server";
import { validateEntry } from "../../../../lib/content/validation";
import type { ContentEntry } from "../../../../lib/content/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const db = await requireAdmin(request);
    const input = (await request.json()) as ContentEntry;
    const entry = { ...input, id: crypto.randomUUID() } as ContentEntry;
    const result = validateEntry(entry);
    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }
    await createContentEntry(db, result.value);
    return NextResponse.json(
      { ok: true, value: result.value },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { ok: false, message: "Request body must be valid JSON." },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { ok: false, message: "Unable to create entry." },
      { status: 503 },
    );
  }
}
