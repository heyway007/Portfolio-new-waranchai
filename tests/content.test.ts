import { describe, expect, it } from "vitest";
import { localize } from "../lib/content/i18n";
import { validateEntry } from "../lib/content/validation";
import type { ProjectEntry } from "../lib/content/types";

const project: ProjectEntry = {
  id: "project-style-bangkok",
  type: "project",
  slug: "style-bangkok",
  title: { en: "Style Bangkok", th: "สไตล์ แบงค็อก" },
  summary: { en: "Corporate website", th: "เว็บไซต์องค์กร" },
  body: { en: "", th: "" },
  role: { en: "Full-Stack Developer", th: "นักพัฒนา Full-Stack" },
  technologies: ["PHP", "CSS3"],
  liveUrl: "",
  coverImage: "/images/portfolio/style-bangkok.webp",
  supportingImages: [],
  imageAlt: { en: "Style Bangkok website", th: "เว็บไซต์ Style Bangkok" },
  featured: true,
  status: "published",
  sortOrder: 1,
};

describe("localize", () => {
  it("uses the requested translation", () => {
    expect(localize({ en: "Work", th: "ผลงาน" }, "th")).toBe("ผลงาน");
  });

  it("falls back to the other translation", () => {
    expect(localize({ en: "Work", th: "" }, "th")).toBe("Work");
  });
});

describe("project validation", () => {
  it("accepts an omitted project URL", () => {
    expect(validateEntry(project).ok).toBe(true);
  });

  it("rejects a malformed project URL", () => {
    expect(validateEntry({ ...project, liveUrl: "style bangkok" }).ok).toBe(
      false,
    );
  });

  it("rejects non-http project URLs", () => {
    expect(
      validateEntry({ ...project, liveUrl: "javascript:alert(1)" }).ok,
    ).toBe(false);
  });

  it("normalizes a whitespace-only URL to an omitted URL", () => {
    const result = validateEntry({ ...project, liveUrl: "   " });
    expect(result.ok).toBe(true);
    if (result.ok && result.value.type === "project") {
      expect(result.value.liveUrl).toBe("");
    }
  });

  it("returns validation errors for malformed JSON-shaped input", () => {
    expect(() =>
      validateEntry({ type: "project", status: "published" }),
    ).not.toThrow();
    expect(validateEntry({ type: "project", status: "published" }).ok).toBe(
      false,
    );
  });

  it("requires a cover image before a project is published", () => {
    expect(
      validateEntry({ ...project, coverImage: "", status: "published" }).ok,
    ).toBe(false);
    expect(
      validateEntry({ ...project, coverImage: "", status: "draft" }).ok,
    ).toBe(true);
  });

  it("requires bilingual-manageable alt text for published supporting images", () => {
    expect(
      validateEntry({
        ...project,
        supportingImages: [
          { url: "/images/portfolio/lease-it.webp", alt: { en: "", th: "" } },
        ],
      }).ok,
    ).toBe(false);
  });
});
