import { defaultPortfolio } from "./default-portfolio";
import type {
  ContentEntry,
  PortfolioData,
  SiteSettings,
} from "./types";

export interface ContentRow {
  id: string;
  type: string;
  payload: string;
  status: string;
  sort_order: number;
}

export function portfolioFromRows(
  settingsPayload: string | null,
  rows: ContentRow[],
  includeDrafts: boolean,
): PortfolioData {
  const settings: SiteSettings = settingsPayload
    ? JSON.parse(settingsPayload)
    : defaultPortfolio.settings;
  const entries = rows
    .filter((row) => includeDrafts || row.status === "published")
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((row) => {
      const entry = JSON.parse(row.payload) as ContentEntry;
      return {
        ...entry,
        id: row.id,
        status: row.status,
        sortOrder: row.sort_order,
      } as ContentEntry;
    });

  return {
    settings,
    experience: entries.filter((entry) => entry.type === "experience"),
    education: entries.filter((entry) => entry.type === "education"),
    skillGroups: entries.filter((entry) => entry.type === "skillGroup"),
    projects: entries.filter((entry) => entry.type === "project"),
  };
}

