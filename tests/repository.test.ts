import { describe, expect, it } from "vitest";
import { portfolioFromRows } from "../lib/content/repository";
import { defaultPortfolio } from "../lib/content/default-portfolio";

const publishedProject = {
  id: "project-live",
  type: "project",
  payload: JSON.stringify({
    ...defaultPortfolio.projects[0],
    id: "project-live",
    status: "published",
  }),
  status: "published",
  sort_order: 0,
};

const draftProject = {
  id: "project-draft",
  type: "project",
  payload: JSON.stringify({
    ...defaultPortfolio.projects[1],
    id: "project-draft",
    status: "draft",
  }),
  status: "draft",
  sort_order: 1,
};

describe("portfolioFromRows", () => {
  it("excludes drafts from the public aggregate", () => {
    const result = portfolioFromRows(
      JSON.stringify(defaultPortfolio.settings),
      [publishedProject, draftProject],
      false,
    );

    expect(result.projects.map((project) => project.id)).toEqual([
      "project-live",
    ]);
  });

  it("includes drafts in the admin aggregate", () => {
    const result = portfolioFromRows(
      JSON.stringify(defaultPortfolio.settings),
      [publishedProject, draftProject],
      true,
    );

    expect(result.projects.map((project) => project.id)).toEqual([
      "project-live",
      "project-draft",
    ]);
  });

  it("fills LINE defaults into stored settings created before LINE fields", () => {
    const legacySettings = {
      ...defaultPortfolio.settings,
    } as Record<string, unknown>;
    delete legacySettings.lineUrl;
    delete legacySettings.lineLabel;
    delete legacySettings.lineQrImage;
    delete legacySettings.lineQrAlt;

    const result = portfolioFromRows(
      JSON.stringify(legacySettings),
      [],
      false,
    );

    expect(result.settings.lineUrl).toBe(
      "https://line.me/ti/p/gxajAHMh2V",
    );
    expect(result.settings.lineQrImage).toBe(
      "/images/portfolio/line-qr.jpg",
    );
    expect(result.settings.lineLabel).toEqual({
      en: "Add me on LINE",
      th: "เพิ่มเพื่อนทาง LINE",
    });
  });
});
