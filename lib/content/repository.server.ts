import { getRuntimeEnv } from "../platform/env.server";
import { loadPortfolio } from "./database.server";
import type { PortfolioData } from "./types";

export async function getPublishedPortfolio(): Promise<PortfolioData> {
  const db = getRuntimeEnv().DB;
  if (!db) throw new Error("Portfolio database binding is unavailable.");
  return loadPortfolio(db, false);
}

export function getAdminPortfolio(): Promise<PortfolioData> {
  const db = getRuntimeEnv().DB;
  if (!db) throw new Error("Portfolio database binding is unavailable.");
  return loadPortfolio(db, true);
}
