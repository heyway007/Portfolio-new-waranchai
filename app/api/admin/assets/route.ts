import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/auth/require-admin.server";
import {
  inspectImage,
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
    const inspection = inspectImage(file.type, bytes);
    if (!inspection.ok) {
      return NextResponse.json(
        { ok: false, message: inspection.error },
        { status: 400 },
      );
    }
    const id = crypto.randomUUID();
    const key = `portfolio/${id}.${validation.extension}`;
    const bucket = getRuntimeEnv().PORTFOLIO_ASSETS;
    if (!bucket) {
      return NextResponse.json(
        { ok: false, message: "Image storage is unavailable." },
        { status: 503 },
      );
    }
    const altEn = String(formData.get("altEn") ?? "").trim().slice(0, 240);
    const altTh = String(formData.get("altTh") ?? "").trim().slice(0, 240);
    await bucket.put(key, bytes, {
      httpMetadata: { contentType: file.type },
    });
    try {
      await db
        .prepare(
          `INSERT INTO assets
            (id, storage_key, filename, mime_type, size, alt_en, alt_th, width, height, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          id,
          key,
          file.name.slice(0, 240),
          file.type,
          file.size,
          altEn,
          altTh,
          inspection.width,
          inspection.height,
          Date.now(),
        )
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
