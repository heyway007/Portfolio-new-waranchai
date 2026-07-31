import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../../lib/auth/require-admin.server";
import {
  deleteContentEntry,
  updateContentEntry,
} from "../../../../../lib/content/database.server";
import { validateEntry } from "../../../../../lib/content/validation";
import type { ContentEntry } from "../../../../../lib/content/types";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  try {
    const db = await requireAdmin(request);
    const { id } = await context.params;
    const input = { ...(await request.json()), id } as ContentEntry;
    const result = validateEntry(input);
    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }
    const updated = await updateContentEntry(db, id, result.value);
    return updated
      ? NextResponse.json({ ok: true, value: result.value })
      : NextResponse.json(
          { ok: false, message: "Entry not found." },
          { status: 404 },
        );
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json(
      { ok: false, message: "Unable to update entry." },
      { status: 503 },
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const db = await requireAdmin(request);
    const { id } = await context.params;
    const input = (await request.json().catch(() => null)) as {
      confirm?: boolean;
    } | null;
    if (!input?.confirm) {
      return NextResponse.json(
        { ok: false, message: "Deletion confirmation is required." },
        { status: 400 },
      );
    }
    const deleted = await deleteContentEntry(db, id);
    return deleted
      ? NextResponse.json({ ok: true })
      : NextResponse.json(
          { ok: false, message: "Entry not found." },
          { status: 404 },
        );
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json(
      { ok: false, message: "Unable to delete entry." },
      { status: 503 },
    );
  }
}

