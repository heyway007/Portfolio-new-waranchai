import type {
  ContentEntry,
  EducationEntry,
  ExperienceEntry,
  LocalizedText,
  ProjectImage,
  ProjectEntry,
  PublishStatus,
  SiteCopy,
  SiteSettings,
  SkillGroupEntry,
} from "./types";

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: Record<string, string> };

const COPY_KEYS: (keyof SiteCopy)[] = [
  "navAbout",
  "navWork",
  "navExperience",
  "navSkills",
  "navContact",
  "menu",
  "close",
  "skip",
  "heroWorkAction",
  "heroContactAction",
  "aboutEyebrow",
  "aboutTitle",
  "yearsLabel",
  "projectsLabel",
  "bilingualLabel",
  "workEyebrow",
  "workTitle",
  "visitWebsite",
  "caseStudy",
  "caseStudyDetails",
  "featured",
  "archive",
  "experienceEyebrow",
  "experienceTitle",
  "education",
  "present",
  "skillsEyebrow",
  "skillsTitle",
  "contactEyebrow",
  "backToTop",
];

function objectValue(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function stringValue(
  value: unknown,
  path: string,
  errors: Record<string, string>,
  required = true,
  maxLength = 2_000,
): string {
  if (typeof value !== "string") {
    errors[path] = "Must be text.";
    return "";
  }
  const normalized = value.trim();
  if (required && !normalized) errors[path] = "This field is required.";
  if (normalized.length > maxLength) {
    errors[path] = `Must be ${maxLength} characters or fewer.`;
  }
  return normalized;
}

function localizedValue(
  value: unknown,
  path: string,
  errors: Record<string, string>,
  required = true,
  maxLength = 2_000,
): LocalizedText {
  const object = objectValue(value);
  if (!object) {
    errors[path] = "Add English or Thai text.";
    return { en: "", th: "" };
  }
  const en = stringValue(object.en, `${path}.en`, errors, false, maxLength);
  const th = stringValue(object.th, `${path}.th`, errors, false, maxLength);
  if (required && !en && !th) errors[path] = "Add English or Thai text.";
  return { en, th };
}

function stringList(
  value: unknown,
  path: string,
  errors: Record<string, string>,
  required = false,
): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    errors[path] = "Must be a list of text values.";
    return [];
  }
  const result = value
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 40);
  if (required && result.length === 0) errors[path] = "Add at least one item.";
  return result;
}

function integerValue(
  value: unknown,
  path: string,
  errors: Record<string, string>,
  minimum: number,
  maximum: number,
): number {
  if (!Number.isInteger(value) || (value as number) < minimum || (value as number) > maximum) {
    errors[path] = `Must be an integer from ${minimum} to ${maximum}.`;
    return minimum;
  }
  return value as number;
}

function imageReference(
  value: unknown,
  path: string,
  errors: Record<string, string>,
  required: boolean,
): string {
  const result = stringValue(value, path, errors, required, 1_000);
  if (
    result &&
    !result.startsWith("/images/") &&
    !result.startsWith("/media/")
  ) {
    errors[path] = "Use an uploaded image or a portfolio image path.";
  }
  return result;
}

function supportingImageValues(
  value: unknown,
  errors: Record<string, string>,
  requiredAlt: boolean,
  legacyAlt: LocalizedText,
): ProjectImage[] {
  if (!Array.isArray(value)) {
    errors.supportingImages = "Must be a list of supporting images.";
    return [];
  }
  return value.slice(0, 20).map((item, index) => {
    if (typeof item === "string") {
      return {
        url: imageReference(
          item,
          `supportingImages.${index}.url`,
          errors,
          true,
        ),
        alt: legacyAlt,
      };
    }
    const object = objectValue(item);
    if (!object) {
      errors[`supportingImages.${index}`] = "Invalid supporting image.";
      return { url: "", alt: { en: "", th: "" } };
    }
    return {
      url: imageReference(
        object.url,
        `supportingImages.${index}.url`,
        errors,
        true,
      ),
      alt: localizedValue(
        object.alt,
        `supportingImages.${index}.alt`,
        errors,
        requiredAlt,
        240,
      ),
    };
  });
}

function baseEntry(
  object: Record<string, unknown>,
  errors: Record<string, string>,
) {
  const id = stringValue(object.id, "id", errors, true, 100);
  const status: PublishStatus =
    object.status === "draft" || object.status === "published"
      ? object.status
      : "draft";
  if (object.status !== "draft" && object.status !== "published") {
    errors.status = "Invalid status.";
  }
  const sortOrder = integerValue(object.sortOrder, "sortOrder", errors, 0, 10_000);
  return { id, status, sortOrder };
}

function validHttpUrl(value: string): boolean {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateSettings(value: unknown): ValidationResult<SiteSettings> {
  const errors: Record<string, string> = {};
  const object = objectValue(value);
  if (!object) return { ok: false, errors: { root: "Invalid settings." } };

  const copyObject = objectValue(object.copy);
  const copy = {} as SiteCopy;
  for (const key of COPY_KEYS) {
    copy[key] = localizedValue(copyObject?.[key], `copy.${key}`, errors, true, 180);
  }

  const email = stringValue(object.email, "email", errors, true, 320);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "A valid email is required.";
  }
  const lineUrl = stringValue(object.lineUrl, "lineUrl", errors, true, 1_000);
  if (lineUrl && !validHttpUrl(lineUrl)) {
    errors.lineUrl = "Use a valid HTTP or HTTPS URL.";
  }

  const settings: SiteSettings = {
    fullName: stringValue(object.fullName, "fullName", errors, true, 160),
    seoTitle: localizedValue(object.seoTitle, "seoTitle", errors, true, 180),
    seoDescription: localizedValue(
      object.seoDescription,
      "seoDescription",
      errors,
      true,
      320,
    ),
    copy,
    eyebrow: localizedValue(object.eyebrow, "eyebrow", errors, true, 180),
    role: localizedValue(object.role, "role", errors, true, 180),
    introduction: localizedValue(
      object.introduction,
      "introduction",
      errors,
      true,
      1_000,
    ),
    about: localizedValue(object.about, "about", errors, true, 4_000),
    availability: localizedValue(
      object.availability,
      "availability",
      errors,
      true,
      180,
    ),
    contactClosing: localizedValue(
      object.contactClosing,
      "contactClosing",
      errors,
      true,
      1_000,
    ),
    email,
    phone: stringValue(object.phone, "phone", errors, true, 60),
    lineUrl,
    lineLabel: localizedValue(
      object.lineLabel,
      "lineLabel",
      errors,
      true,
      180,
    ),
    lineQrImage: imageReference(
      object.lineQrImage,
      "lineQrImage",
      errors,
      true,
    ),
    lineQrAlt: localizedValue(
      object.lineQrAlt,
      "lineQrAlt",
      errors,
      true,
      240,
    ),
    location: localizedValue(object.location, "location", errors, true, 180),
    portrait: imageReference(object.portrait, "portrait", errors, true),
    portraitAlt: localizedValue(
      object.portraitAlt,
      "portraitAlt",
      errors,
      true,
      240,
    ),
  };

  return Object.keys(errors).length
    ? { ok: false, errors }
    : { ok: true, value: settings };
}

export function validateEntry(value: unknown): ValidationResult<ContentEntry> {
  const errors: Record<string, string> = {};
  const object = objectValue(value);
  if (!object) return { ok: false, errors: { root: "Invalid entry." } };
  const base = baseEntry(object, errors);

  if (object.type === "experience") {
    const startYear = integerValue(object.startYear, "startYear", errors, 1950, 2100);
    const current = typeof object.current === "boolean" ? object.current : false;
    if (typeof object.current !== "boolean") errors.current = "Choose whether this role is current.";
    let endYear: number | null = null;
    if (!current) {
      endYear = integerValue(object.endYear, "endYear", errors, 1950, 2100);
      if (endYear < startYear) errors.endYear = "End year cannot be before start year.";
    } else if (object.endYear !== null) {
      errors.endYear = "A current role cannot have an end year.";
    }
    const entry: ExperienceEntry = {
      ...base,
      type: "experience",
      company: localizedValue(object.company, "company", errors, true, 240),
      role: localizedValue(object.role, "role", errors, true, 240),
      summary: localizedValue(object.summary, "summary", errors, false, 2_000),
      startYear,
      endYear,
      current,
    };
    return Object.keys(errors).length
      ? { ok: false, errors }
      : { ok: true, value: entry };
  }

  if (object.type === "education") {
    const startYear = integerValue(object.startYear, "startYear", errors, 1950, 2100);
    const endYear = integerValue(object.endYear, "endYear", errors, 1950, 2100);
    if (endYear < startYear) errors.endYear = "End year cannot be before start year.";
    const entry: EducationEntry = {
      ...base,
      type: "education",
      institution: localizedValue(
        object.institution,
        "institution",
        errors,
        true,
        240,
      ),
      qualification: localizedValue(
        object.qualification,
        "qualification",
        errors,
        true,
        320,
      ),
      startYear,
      endYear,
    };
    return Object.keys(errors).length
      ? { ok: false, errors }
      : { ok: true, value: entry };
  }

  if (object.type === "skillGroup") {
    const entry: SkillGroupEntry = {
      ...base,
      type: "skillGroup",
      name: localizedValue(object.name, "name", errors, true, 180),
      skills: stringList(object.skills, "skills", errors, true),
    };
    return Object.keys(errors).length
      ? { ok: false, errors }
      : { ok: true, value: entry };
  }

  if (object.type === "project") {
    const liveUrl = stringValue(object.liveUrl, "liveUrl", errors, false, 1_000);
    if (!validHttpUrl(liveUrl)) {
      errors.liveUrl = "Use a valid http or https URL.";
    }
    const status = base.status;
    const coverImage = imageReference(
      object.coverImage,
      "coverImage",
      errors,
      status === "published",
    );
    const imageAlt = localizedValue(
      object.imageAlt,
      "imageAlt",
      errors,
      status === "published",
      240,
    );
    const supportingImages = supportingImageValues(
      object.supportingImages ?? [],
      errors,
      status === "published",
      imageAlt,
    );
    const slug = stringValue(object.slug, "slug", errors, true, 100).toLowerCase();
    if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      errors.slug = "Use lowercase letters, numbers, and single hyphens.";
    }
    const entry: ProjectEntry = {
      ...base,
      type: "project",
      slug,
      title: localizedValue(object.title, "title", errors, true, 240),
      summary: localizedValue(object.summary, "summary", errors, true, 1_000),
      body: localizedValue(object.body, "body", errors, false, 8_000),
      role: localizedValue(object.role, "role", errors, true, 240),
      technologies: stringList(
        object.technologies,
        "technologies",
        errors,
        true,
      ),
      liveUrl,
      coverImage,
      imageAlt,
      supportingImages,
      featured: typeof object.featured === "boolean" ? object.featured : false,
    };
    if (typeof object.featured !== "boolean") errors.featured = "Choose whether this project is featured.";
    return Object.keys(errors).length
      ? { ok: false, errors }
      : { ok: true, value: entry };
  }

  return { ok: false, errors: { type: "Invalid entry type." } };
}
