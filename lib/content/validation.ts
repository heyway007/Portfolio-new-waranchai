import type {
  ContentEntry,
  LocalizedText,
  ProjectEntry,
  SiteSettings,
} from "./types";

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: Record<string, string> };

function hasTranslation(value: LocalizedText): boolean {
  return Boolean(value.en.trim() || value.th.trim());
}

function isHttpUrl(value: string): boolean {
  if (!value.trim()) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateSettings(
  value: SiteSettings,
): ValidationResult<SiteSettings> {
  const errors: Record<string, string> = {};
  if (!value.fullName.trim()) errors.fullName = "Name is required.";
  if (!hasTranslation(value.role)) errors.role = "Role is required.";
  if (!hasTranslation(value.introduction)) {
    errors.introduction = "Introduction is required.";
  }
  if (!value.email.trim() || !value.email.includes("@")) {
    errors.email = "A valid email is required.";
  }
  if (!value.phone.trim()) errors.phone = "Phone is required.";
  return Object.keys(errors).length
    ? { ok: false, errors }
    : { ok: true, value };
}

export function validateEntry(
  value: ContentEntry,
): ValidationResult<ContentEntry> {
  const errors: Record<string, string> = {};
  const validTypes = new Set([
    "experience",
    "education",
    "skillGroup",
    "project",
  ]);

  if (!validTypes.has(value.type)) errors.type = "Invalid entry type.";
  if (!["draft", "published"].includes(value.status)) {
    errors.status = "Invalid status.";
  }
  if (!Number.isInteger(value.sortOrder) || value.sortOrder < 0) {
    errors.sortOrder = "Sort order must be a non-negative integer.";
  }

  if (value.type === "experience") {
    if (!hasTranslation(value.company)) errors.company = "Company is required.";
    if (!hasTranslation(value.role)) errors.role = "Role is required.";
  }

  if (value.type === "education") {
    if (!hasTranslation(value.institution)) {
      errors.institution = "Institution is required.";
    }
    if (!hasTranslation(value.qualification)) {
      errors.qualification = "Qualification is required.";
    }
  }

  if (value.type === "skillGroup") {
    if (!hasTranslation(value.name)) errors.name = "Group name is required.";
    if (!value.skills.length) errors.skills = "Add at least one skill.";
  }

  if (value.type === "project") {
    const project = value as ProjectEntry;
    if (!project.slug.trim()) errors.slug = "Slug is required.";
    if (!hasTranslation(project.title)) errors.title = "Title is required.";
    if (!hasTranslation(project.summary)) {
      errors.summary = "Summary is required.";
    }
    if (!project.technologies.length) {
      errors.technologies = "Add at least one technology.";
    }
    if (!isHttpUrl(project.liveUrl)) {
      errors.liveUrl = "Use a valid http or https URL.";
    }
  }

  return Object.keys(errors).length
    ? { ok: false, errors }
    : { ok: true, value };
}

