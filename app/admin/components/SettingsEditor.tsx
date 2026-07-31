import type { SiteSettings } from "../../../lib/content/types";
import { BilingualField } from "./BilingualField";
import { ImageUploader } from "./ImageUploader";

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
        <BilingualField
          label="Location"
          value={value.location}
          onChange={(location) => onChange({ ...value, location })}
        />
        <div>
          <p className="admin-field-title">Portrait</p>
          <ImageUploader
            value={value.portrait}
            onChange={(portrait) => onChange({ ...value, portrait })}
          />
        </div>
        <BilingualField
          label="Portrait alternative text"
          value={value.portraitAlt}
          onChange={(portraitAlt) => onChange({ ...value, portraitAlt })}
        />
      </div>
    </section>
  );
}

