import { NextResponse } from "next/server";
import { clearSessionCookie } from "../../../../lib/auth/session";
import { deleteAdminSession } from "../../../../lib/auth/session.server";
import { getRuntimeEnv } from "../../../../lib/platform/env.server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const db = getRuntimeEnv().DB;
  if (db) await deleteAdminSession(db, request);
  return NextResponse.json(
    { ok: true },
    { headers: { "Set-Cookie": clearSessionCookie() } },
  );
}
