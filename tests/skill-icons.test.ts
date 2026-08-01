import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { defaultPortfolio } from "../lib/content/default-portfolio";
import {
  FALLBACK_SKILL_ICON,
  getSkillIcon,
} from "../lib/content/skill-icons";

describe("skill icon registry", () => {
  it("maps every default skill to a local non-fallback SVG", async () => {
    const skills = defaultPortfolio.skillGroups.flatMap((group) => group.skills);

    expect(skills).toHaveLength(22);
    expect(new Set(skills).size).toBe(22);

    for (const skill of skills) {
      const iconPath = getSkillIcon(skill);
      expect(iconPath).toMatch(/^\/icons\/skills\/[a-z0-9-]+\.svg$/);
      expect(iconPath).not.toBe(FALLBACK_SKILL_ICON);

      const source = await readFile(
        path.join(process.cwd(), "public", iconPath.replace(/^\/+/, "")),
        "utf8",
      );
      expect(source).toMatch(/<svg\b[^>]*viewBox=/i);
      expect(source).not.toMatch(/(?:href|src)=["']https?:\/\//i);
      expect(source).not.toMatch(/<script\b/i);
    }
  });

  it("uses the local generic icon for an unknown CMS skill", () => {
    expect(getSkillIcon("New Tool")).toBe(FALLBACK_SKILL_ICON);
    expect(getSkillIcon("  new tool  ")).toBe(FALLBACK_SKILL_ICON);
  });
});
