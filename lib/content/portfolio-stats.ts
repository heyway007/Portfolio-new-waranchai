import type { PortfolioData } from "./types";

type PortfolioCollections = Pick<
  PortfolioData,
  "experience" | "projects" | "skillGroups"
>;

export interface PortfolioStats {
  experienceYears: number;
  projectCount: number;
  skillCount: number;
}

export function getPortfolioStats(
  data: PortfolioCollections,
  currentYear = new Date().getFullYear(),
): PortfolioStats {
  const publishedExperience = data.experience.filter(
    (entry) => entry.status === "published",
  );
  const publishedProjects = data.projects.filter(
    (entry) => entry.status === "published",
  );
  const publishedSkillGroups = data.skillGroups.filter(
    (entry) => entry.status === "published",
  );
  const earliestStartYear = publishedExperience.reduce<number | null>(
    (earliest, entry) =>
      earliest === null ? entry.startYear : Math.min(earliest, entry.startYear),
    null,
  );

  return {
    experienceYears:
      earliestStartYear === null
        ? 0
        : Math.max(0, currentYear - earliestStartYear),
    projectCount: publishedProjects.length,
    skillCount: publishedSkillGroups.reduce(
      (total, group) => total + group.skills.length,
      0,
    ),
  };
}
