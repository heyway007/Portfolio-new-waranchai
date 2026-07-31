"use client";

import { useCallback, useEffect, useState } from "react";
import type { PortfolioData } from "../../lib/content/types";
import { PortfolioClient } from "../components/portfolio/PortfolioClient";

export function PreviewClient() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const response = await fetch("/api/admin/content");
      if (response.status === 401) {
        window.location.assign("/admin/login");
        return;
      }
      const result = (await response.json()) as {
        ok?: boolean;
        message?: string;
        data?: PortfolioData;
      };
      if (!response.ok || !result.ok || !result.data) {
        throw new Error(result.message ?? "Unable to load preview.");
      }
      setData(result.data);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to load preview.",
      );
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  if (!data) {
    return (
      <main className="admin-loading">
        <div>
          <p>{error || "Loading preview…"}</p>
          {error ? (
            <button className="admin-primary-button" onClick={() => void load()}>
              Retry
            </button>
          ) : null}
        </div>
      </main>
    );
  }
  return <PortfolioClient data={data} preview />;
}
