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
});
