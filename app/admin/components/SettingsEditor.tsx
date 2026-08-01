import type { SiteCopy, SiteSettings } from "../../../lib/content/types";
import { BilingualField } from "./BilingualField";
import { ImageUploader } from "./ImageUploader";

const copyFields: { key: keyof SiteCopy; label: string }[] = [
  { key: "navAbout", label: "Navigation — About" },
  { key: "navWork", label: "Navigation — Work" },
  { key: "navExperience", label: "Navigation — Experience" },
  { key: "navSkills", label: "Navigation — Skills" },
  { key: "navContact", label: "Navigation — Contact" },
  { key: "menu", label: "Menu button" },
  { key: "close", label: "Close button" },
  { key: "skip", label: "Skip link" },
  { key: "heroWorkAction", label: "Hero work action" },
  { key: "heroContactAction", label: "Hero contact action" },
  { key: "aboutEyebrow", label: "About eyebrow" },
  { key: "aboutTitle", label: "About heading" },
  { key: "yearsLabel", label: "Experience statistic label" },
  { key: "projectsLabel", label: "Projects statistic label" },
  { key: "bilingualLabel", label: "Languages statistic label" },
  { key: "workEyebrow", label: "Work eyebrow" },
  { key: "workTitle", label: "Work heading" },
  { key: "visitWebsite", label: "Visit website action" },
  { key: "caseStudy", label: "Case study label" },
  { key: "caseStudyDetails", label: "Case study details action" },
  { key: "featured", label: "Featured label" },
  { key: "archive", label: "Archive label" },
  { key: "experienceEyebrow", label: "Experience eyebrow" },
  { key: "experienceTitle", label: "Experience heading" },
  { key: "education", label: "Education heading" },
  { key: "present", label: "Present label" },
  { key: "skillsEyebrow", label: "Skills eyebrow" },
  { key: "skillsTitle", label: "Skills heading" },
  { key: "contactEyebrow", label: "Contact eyebrow" },
  { key: "backToTop", label: "Back to top action" },
];

export function SettingsEditor({
  value,
  saving,
  onChange,
  onSave,
}: {
  value: SiteSettings;
  saving: boolean;
  onChange(value: SiteSettings): void;
  onSave(): void;
}) {
  return (
    <section className="admin-editor">
      <div className="admin-editor-heading">
        <div>
          <p className="eyebrow">Profile & contact</p>
          <h2>Portfolio identity</h2>
        </div>
        <button className="admin-primary-button" onClick={onSave} disabled={saving}>
          {saving ? "Saving…" : "Save profile"}
        </button>
      </div>
      <div className="admin-form-grid">
        <label>
          Full name
          <input
            value={value.fullName}
            onChange={(event) => onChange({ ...value, fullName: event.target.value })}
          />
        </label>
        <BilingualField
          label="SEO page title"
          value={value.seoTitle}
          onChange={(seoTitle) => onChange({ ...value, seoTitle })}
        />
        <BilingualField
          label="SEO description"
          value={value.seoDescription}
          multiline
          onChange={(seoDescription) => onChange({ ...value, seoDescription })}
        />
        <BilingualField
          label="Role"
          value={value.role}
          onChange={(role) => onChange({ ...value, role })}
        />
        <BilingualField
          label="Hero eyebrow"
          value={value.eyebrow}
          onChange={(eyebrow) => onChange({ ...value, eyebrow })}
        />
        <BilingualField
          label="Introduction"
          value={value.introduction}
          multiline
          onChange={(introduction) => onChange({ ...value, introduction })}
        />
        <BilingualField
          label="About"
          value={value.about}
          multiline
          onChange={(about) => onChange({ ...value, about })}
        />
        <BilingualField
          label="Availability"
          value={value.availability}
          onChange={(availability) => onChange({ ...value, availability })}
        />
        <BilingualField
          label="Contact closing"
          value={value.contactClosing}
          multiline
          onChange={(contactClosing) => onChange({ ...value, contactClosing })}
        />
        <div className="admin-inline-fields">
          <label>
            Email
            <input
              type="email"
              value={value.email}
              onChange={(event) => onChange({ ...value, email: event.target.value })}
            />
          </label>
          <label>
            Phone
            <input
              value={value.phone}
              onChange={(event) => onChange({ ...value, phone: event.target.value })}
            />
          </label>
        </div>
        <label>
          LINE add-friend URL
          <input
            type="url"
            value={value.lineUrl}
            onChange={(event) =>
              onChange({ ...value, lineUrl: event.target.value })
            }
          />
        </label>
        <BilingualField
          label="LINE link label"
          value={value.lineLabel}
          onChange={(lineLabel) => onChange({ ...value, lineLabel })}
        />
        <div>
          <p className="admin-field-title">LINE QR code</p>
          <ImageUploader
            value={value.lineQrImage}
            alt={value.lineQrAlt}
            onChange={(lineQrImage) => onChange({ ...value, lineQrImage })}
          />
        </div>
        <BilingualField
          label="LINE QR alternative text"
          value={value.lineQrAlt}
          onChange={(lineQrAlt) => onChange({ ...value, lineQrAlt })}
        />
        <BilingualField
          label="Location"
          value={value.location}
          onChange={(location) => onChange({ ...value, location })}
        />
        <div>
          <p className="admin-field-title">Portrait</p>
          <ImageUploader
            value={value.portrait}
            alt={value.portraitAlt}
            onChange={(portrait) => onChange({ ...value, portrait })}
          />
        </div>
        <BilingualField
          label="Portrait alternative text"
          value={value.portraitAlt}
          onChange={(portraitAlt) => onChange({ ...value, portraitAlt })}
        />
        <div className="admin-copy-fields">
          <p className="admin-field-title">Interface copy</p>
          {copyFields.map(({ key, label }) => (
            <BilingualField
              key={key}
              label={label}
              value={value.copy[key]}
              onChange={(copyValue) =>
                onChange({
                  ...value,
                  copy: { ...value.copy, [key]: copyValue },
                })
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
