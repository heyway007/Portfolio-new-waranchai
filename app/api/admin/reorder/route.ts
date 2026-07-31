import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/auth/require-admin.server";
import { reorderContentEntries } from "../../../../lib/content/database.server";
import type { EntryType } from "../../../../lib/content/types";

const types = new Set<EntryType>([
  "experience",
  "education",
  "skillGroup",
  "project",
]);

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const db = await requireAdmin(request);
    const input = (await request.json()) as {
      type?: EntryType;
      orderedIds?: string[];
    };
    if (
      !input.type ||
      !types.has(input.type) ||
      !Array.isArray(input.orderedIds) ||
      new Set(input.orderedIds).size !== input.orderedIds.length
    ) {
      return NextResponse.json(
        { ok: false, message: "Invalid order." },
        { status: 400 },
      );
    }
    await reorderContentEntries(db, input.type, input.orderedIds);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { ok: false, message: "Request body must be valid JSON." },
        { status: 400 },
      );
    }
    const message =
      error instanceof Error ? error.message : "Unable to reorder entries.";
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}
