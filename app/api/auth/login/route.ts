import { NextResponse } from "next/server";
import { verifyPassword } from "../../../../lib/auth/password";
import {
  clearLoginAttempts,
  isLoginLimited,
  loginAttemptKey,
  recordFailedLogin,
} from "../../../../lib/auth/rate-limit.server";
import { createAdminSession } from "../../../../lib/auth/session.server";
import { getRuntimeEnv } from "../../../../lib/platform/env.server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const runtime = getRuntimeEnv();
  if (!runtime.ADMIN_EMAIL || !runtime.ADMIN_PASSWORD_HASH) {
    return NextResponse.json(
      { ok: false, message: "Administrator access is not configured." },
      { status: 503 },
    );
  }
  const body = (await request.json().catch(() => null)) as {
    email?: string;
    password?: string;
  } | null;
  const email = body?.email?.trim().toLowerCase() ?? "";
  const password = body?.password ?? "";
  if (!email || !password || password.length > 256) {
    return NextResponse.json(
      { ok: false, message: "Invalid email or password." },
      { status: 400 },
    );
  }
  const key = await loginAttemptKey(request, email);
  if (await isLoginLimited(runtime.DB, key)) {
    return NextResponse.json(
      { ok: false, message: "Too many attempts. Try again later." },
      { status: 429 },
    );
  }
  const emailMatches = email === runtime.ADMIN_EMAIL.trim().toLowerCase();
  const passwordMatches = emailMatches
    ? await verifyPassword(password, runtime.ADMIN_PASSWORD_HASH)
    : false;
  if (!emailMatches || !passwordMatches) {
    await recordFailedLogin(runtime.DB, key);
    return NextResponse.json(
      { ok: false, message: "Invalid email or password." },
      { status: 401 },
    );
  }
  await clearLoginAttempts(runtime.DB, key);
  const session = await createAdminSession(runtime.DB);
  return NextResponse.json(
    { ok: true },
    { headers: { "Set-Cookie": session.cookie } },
  );
}

