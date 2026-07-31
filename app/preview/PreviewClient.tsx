"use client";

import { useEffect, useState } from "react";
import type { PortfolioData } from "../../lib/content/types";
import { PortfolioClient } from "../components/portfolio/PortfolioClient";

export function PreviewClient() {
  const [data, setData] = useState<PortfolioData | null>(null);

  useEffect(() => {
    fetch("/api/admin/content")
      .then((response) => {
        if (response.status === 401) {
          window.location.assign("/admin/login");
          return null;
        }
        return response.json() as Promise<{
          ok?: boolean;
          data?: PortfolioData;
        }>;
      })
      .then((result) => {
        if (result?.ok && result.data) setData(result.data);
      })
      .catch(() => undefined);
  }, []);

  if (!data) {
    return <main className="admin-loading">Loading preview…</main>;
  }
  return <PortfolioClient data={data} preview />;
}
