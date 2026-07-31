import type {
  ContentEntry,
  EducationEntry,
  ExperienceEntry,
  SkillGroupEntry,
} from "../../../lib/content/types";
import { BilingualField } from "./BilingualField";

type EditableEntry = ExperienceEntry | EducationEntry | SkillGroupEntry;

export function EntryListEditor({
  title,
  eyebrow,
  entries,
  savingId,
  onChange,
  onSave,
  onCreate,
  onDelete,
  onMove,
}: {
  title: string;
  eyebrow: string;
  entries: EditableEntry[];
  savingId: string;
  onChange(entry: EditableEntry): void;
  onSave(entry: ContentEntry): void;
  onCreate(): void;
  onDelete(entry: ContentEntry): void;
  onMove(index: number, direction: -1 | 1): void;
}) {
  return (
    <section className="admin-editor">
      <div className="admin-editor-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
        <button className="admin-primary-button" onClick={onCreate}>
          Add entry
        </button>
      </div>
      <div className="admin-entry-list">
        {entries.map((entry, index) => (
          <details className="admin-entry-card" key={entry.id} open={index === 0}>
            <summary>
              <span>
                {entry.type === "experience"
                  ? entry.company.en || entry.company.th
                  : entry.type === "education"
                    ? entry.institution.en || entry.institution.th
                    : entry.name.en || entry.name.th}
              </span>
              <span className={`status-pill ${entry.status}`}>{entry.status}</span>
            </summary>
            <div className="admin-entry-body">
              {entry.type === "experience" ? (
                <>
                  <BilingualField
                    label="Company"
                    value={entry.company}
                    onChange={(company) => onChange({ ...entry, company })}
                  />
                  <BilingualField
                    label="Role"
                    value={entry.role}
                    onChange={(role) => onChange({ ...entry, role })}
                  />
                  <BilingualField
                    label="Summary"
                    value={entry.summary}
                    multiline
                    onChange={(summary) => onChange({ ...entry, summary })}
                  />
                  <div className="admin-inline-fields">
                    <label>
                      Start year
                      <input
                        type="number"
                        value={entry.startYear}
                        onChange={(event) =>
                          onChange({ ...entry, startYear: Number(event.target.value) })
                        }
                      />
                    </label>
                    <label>
                      End year
                      <input
                        type="number"
                        value={entry.endYear ?? ""}
                        disabled={entry.current}
                        onChange={(event) =>
                          onChange({
                            ...entry,
                            endYear: event.target.value ? Number(event.target.value) : null,
                          })
                        }
                      />
                    </label>
                    <label className="checkbox-field">
                      <input
                        type="checkbox"
                        checked={entry.current}
                        onChange={(event) =>
                          onChange({
                            ...entry,
                            current: event.target.checked,
                            endYear: event.target.checked ? null : entry.endYear,
                          })
                        }
                      />
                      Current role
                    </label>
                  </div>
                </>
              ) : null}
              {entry.type === "education" ? (
                <>
                  <BilingualField
                    label="Institution"
                    value={entry.institution}
                    onChange={(institution) => onChange({ ...entry, institution })}
                  />
                  <BilingualField
                    label="Qualification"
                    value={entry.qualification}
                    multiline
                    onChange={(qualification) => onChange({ ...entry, qualification })}
                  />
                  <div className="admin-inline-fields">
                    <label>
                      Start year
                      <input
                        type="number"
                        value={entry.startYear}
                        onChange={(event) =>
                          onChange({ ...entry, startYear: Number(event.target.value) })
                        }
                      />
                    </label>
                    <label>
                      End year
                      <input
                        type="number"
                        value={entry.endYear}
                        onChange={(event) =>
                          onChange({ ...entry, endYear: Number(event.target.value) })
                        }
                      />
                    </label>
                  </div>
                </>
              ) : null}
              {entry.type === "skillGroup" ? (
                <>
                  <BilingualField
                    label="Group name"
                    value={entry.name}
                    onChange={(name) => onChange({ ...entry, name })}
                  />
                  <label>
                    Skills — comma separated
                    <textarea
                      rows={3}
                      value={entry.skills.join(", ")}
                      onChange={(event) =>
                        onChange({
                          ...entry,
                          skills: event.target.value
                            .split(",")
                            .map((item) => item.trim())
                            .filter(Boolean),
                        })
                      }
                    />
                  </label>
                </>
              ) : null}
              <label>
                Publishing status
                <select
                  value={entry.status}
                  onChange={(event) =>
                    onChange({
                      ...entry,
                      status: event.target.value as "draft" | "published",
                    })
                  }
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>
              <div className="admin-card-actions">
                <button
                  className="admin-primary-button"
                  onClick={() => onSave(entry)}
                  disabled={savingId === entry.id}
                >
                  {savingId === entry.id ? "Saving…" : "Save"}
                </button>
                <button
                  className="admin-secondary-button"
                  onClick={() => onMove(index, -1)}
                  disabled={index === 0}
                >
                  Move up
                </button>
                <button
                  className="admin-secondary-button"
                  onClick={() => onMove(index, 1)}
                  disabled={index === entries.length - 1}
                >
                  Move down
                </button>
                <button className="admin-danger-button" onClick={() => onDelete(entry)}>
                  Delete
                </button>
              </div>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

