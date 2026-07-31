import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/auth/require-admin.server";
import {
  matchesImageSignature,
  validateImageMeta,
} from "../../../../lib/assets/validation";
import { getRuntimeEnv } from "../../../../lib/platform/env.server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const db = await requireAdmin(request);
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, message: "Choose an image to upload." },
        { status: 400 },
      );
    }
    const validation = validateImageMeta({ type: file.type, size: file.size });
    if (!validation.ok) {
      return NextResponse.json(
        { ok: false, message: validation.error },
        { status: 400 },
      );
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!matchesImageSignature(file.type, bytes.slice(0, 16))) {
      return NextResponse.json(
        { ok: false, message: "The file content does not match its image type." },
        { status: 400 },
      );
    }
    const id = crypto.randomUUID();
    const key = `portfolio/${id}.${validation.extension}`;
    const bucket = getRuntimeEnv().PORTFOLIO_ASSETS;
    await bucket.put(key, bytes, {
      httpMetadata: { contentType: file.type },
    });
    try {
      await db
        .prepare(
          `INSERT INTO assets
            (id, storage_key, filename, mime_type, size, alt_en, alt_th, created_at)
           VALUES (?, ?, ?, ?, ?, '', '', ?)`,
        )
        .bind(id, key, file.name, file.type, file.size, Date.now())
        .run();
    } catch (error) {
      await bucket.delete(key);
      throw error;
    }
    return NextResponse.json(
      {
        ok: true,
        asset: {
          id,
          url: `/media/${key}`,
          filename: file.name,
          mimeType: file.type,
          size: file.size,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json(
      { ok: false, message: "Unable to upload image." },
      { status: 503 },
    );
  }
}

