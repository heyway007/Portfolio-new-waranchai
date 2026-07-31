import { getRuntimeEnv } from "../platform/env.server";
import { defaultPortfolio } from "./default-portfolio";
import { loadPortfolio } from "./database.server";
import type { PortfolioData } from "./types";

export async function getPublishedPortfolio(): Promise<PortfolioData> {
  try {
    return await loadPortfolio(getRuntimeEnv().DB, false);
  } catch {
    return defaultPortfolio;
  }
}

export function getAdminPortfolio(): Promise<PortfolioData> {
  return loadPortfolio(getRuntimeEnv().DB, true);
}

