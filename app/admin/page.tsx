import type { Metadata } from "next";
import { AdminClient } from "./AdminClient";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { hasPageAdminSession } from "../../lib/auth/page-guard.server";

export const metadata: Metadata = {
  title: "Portfolio Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const requestHeaders = await headers();
  if (!(await hasPageAdminSession(requestHeaders.get("cookie") ?? ""))) {
    redirect("/admin/login");
  }
  return <AdminClient />;
}
