import { describe, expect, it } from "vitest";
import { defaultPortfolio } from "../lib/content/default-portfolio";
import { getPortfolioStats } from "../lib/content/portfolio-stats";

describe("getPortfolioStats", () => {
  it("derives all values from CMS-managed entries", () => {
    expect(getPortfolioStats(defaultPortfolio, 2026)).toEqual({
      experienceYears: 10,
      projectCount: defaultPortfolio.projects.length,
      skillCount: defaultPortfolio.skillGroups.reduce(
        (total, group) => total + group.skills.length,
        0,
      ),
    });
  });

  it("returns zero experience for empty content", () => {
    expect(
      getPortfolioStats(
        { experience: [], projects: [], skillGroups: [] },
        2026,
      ),
    ).toEqual({
      experienceYears: 0,
      projectCount: 0,
      skillCount: 0,
    });
  });

  it("never returns a negative experience span", () => {
    expect(
      getPortfolioStats(
        {
          experience: [{ ...defaultPortfolio.experience[0], startYear: 2030 }],
          projects: [],
          skillGroups: [],
        },
        2026,
      ).experienceYears,
    ).toBe(0);
  });

  it("does not count draft entries in public statistics", () => {
    expect(
      getPortfolioStats(
        {
          experience: [
            { ...defaultPortfolio.experience[0], status: "draft" },
          ],
          projects: [{ ...defaultPortfolio.projects[0], status: "draft" }],
          skillGroups: [
            { ...defaultPortfolio.skillGroups[0], status: "draft" },
          ],
        },
        2026,
      ),
    ).toEqual({
      experienceYears: 0,
      projectCount: 0,
      skillCount: 0,
    });
  });
});
