export type Language = "en" | "th";
export type PublishStatus = "draft" | "published";
export type EntryType = "experience" | "education" | "skillGroup" | "project";

export interface LocalizedText {
  en: string;
  th: string;
}

export interface SiteCopy {
  navAbout: LocalizedText;
  navWork: LocalizedText;
  navExperience: LocalizedText;
  navSkills: LocalizedText;
  navContact: LocalizedText;
  menu: LocalizedText;
  close: LocalizedText;
  skip: LocalizedText;
  heroWorkAction: LocalizedText;
  heroContactAction: LocalizedText;
  aboutEyebrow: LocalizedText;
  aboutTitle: LocalizedText;
  yearsLabel: LocalizedText;
  projectsLabel: LocalizedText;
  bilingualLabel: LocalizedText;
  workEyebrow: LocalizedText;
  workTitle: LocalizedText;
  visitWebsite: LocalizedText;
  caseStudy: LocalizedText;
  caseStudyDetails: LocalizedText;
  featured: LocalizedText;
  archive: LocalizedText;
  experienceEyebrow: LocalizedText;
  experienceTitle: LocalizedText;
  education: LocalizedText;
  present: LocalizedText;
  skillsEyebrow: LocalizedText;
  skillsTitle: LocalizedText;
  contactEyebrow: LocalizedText;
  backToTop: LocalizedText;
}

export interface SiteSettings {
  fullName: string;
  seoTitle: LocalizedText;
  seoDescription: LocalizedText;
  copy: SiteCopy;
  eyebrow: LocalizedText;
  role: LocalizedText;
  introduction: LocalizedText;
  about: LocalizedText;
  availability: LocalizedText;
  contactClosing: LocalizedText;
  email: string;
  phone: string;
  location: LocalizedText;
  portrait: string;
  portraitAlt: LocalizedText;
}

export interface BaseEntry {
  id: string;
  type: EntryType;
  status: PublishStatus;
  sortOrder: number;
}

export interface ExperienceEntry extends BaseEntry {
  type: "experience";
  company: LocalizedText;
  role: LocalizedText;
  summary: LocalizedText;
  startYear: number;
  endYear: number | null;
  current: boolean;
}

export interface EducationEntry extends BaseEntry {
  type: "education";
  institution: LocalizedText;
  qualification: LocalizedText;
  startYear: number;
  endYear: number;
}

export interface SkillGroupEntry extends BaseEntry {
  type: "skillGroup";
  name: LocalizedText;
  skills: string[];
}

export interface ProjectEntry extends BaseEntry {
  type: "project";
  slug: string;
  title: LocalizedText;
  summary: LocalizedText;
  body: LocalizedText;
  role: LocalizedText;
  technologies: string[];
  liveUrl: string;
  coverImage: string;
  imageAlt: LocalizedText;
  supportingImages?: string[];
  featured: boolean;
}

export type ContentEntry =
  | ExperienceEntry
  | EducationEntry
  | SkillGroupEntry
  | ProjectEntry;

export interface PortfolioData {
  settings: SiteSettings;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skillGroups: SkillGroupEntry[];
  projects: ProjectEntry[];
}
