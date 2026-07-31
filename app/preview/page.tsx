import type { Metadata } from "next";
import { PreviewClient } from "./PreviewClient";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { hasPageAdminSession } from "../../lib/auth/page-guard.server";

export const metadata: Metadata = {
  title: "Portfolio Draft Preview",
  robots: { index: false, follow: false },
};

export default async function PreviewPage() {
  const requestHeaders = await headers();
  if (!(await hasPageAdminSession(requestHeaders.get("cookie") ?? ""))) {
    redirect("/admin/login");
  }
  return <PreviewClient />;
}
