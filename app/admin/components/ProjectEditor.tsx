import type { ProjectEntry } from "../../../lib/content/types";
import { BilingualField } from "./BilingualField";
import { ImageUploader } from "./ImageUploader";

export function ProjectEditor({
  projects,
  savingId,
  onChange,
  onSave,
  onCreate,
  onDelete,
  onMove,
}: {
  projects: ProjectEntry[];
  savingId: string;
  onChange(project: ProjectEntry): void;
  onSave(project: ProjectEntry): void;
  onCreate(): void;
  onDelete(project: ProjectEntry): void;
  onMove(index: number, direction: -1 | 1): void;
}) {
  return (
    <section className="admin-editor">
      <div className="admin-editor-heading">
        <div>
          <p className="eyebrow">Selected work</p>
          <h2>Projects</h2>
        </div>
        <button className="admin-primary-button" onClick={onCreate}>
          Add project
        </button>
      </div>
      <div className="admin-entry-list">
        {projects.map((project, index) => (
          <details className="admin-entry-card" key={project.id} open={index === 0}>
            <summary>
              <span>{project.title.en || project.title.th || "Untitled project"}</span>
              <span className={`status-pill ${project.status}`}>{project.status}</span>
            </summary>
            <div className="admin-entry-body">
              <BilingualField
                label="Project title"
                value={project.title}
                onChange={(title) => onChange({ ...project, title })}
              />
              <BilingualField
                label="Short summary"
                value={project.summary}
                multiline
                onChange={(summary) => onChange({ ...project, summary })}
              />
              <BilingualField
                label="Case-study details"
                value={project.body}
                multiline
                onChange={(body) => onChange({ ...project, body })}
              />
              <BilingualField
                label="Role"
                value={project.role}
                onChange={(role) => onChange({ ...project, role })}
              />
              <div className="admin-inline-fields">
                <label>
                  Slug
                  <input
                    value={project.slug}
                    onChange={(event) => onChange({ ...project, slug: event.target.value })}
                  />
                </label>
                <label>
                  Live website URL — optional
                  <input
                    type="url"
                    placeholder="https://"
                    value={project.liveUrl}
                    onChange={(event) =>
                      onChange({ ...project, liveUrl: event.target.value })
                    }
                  />
                </label>
              </div>
              <label>
                Technologies — comma separated
                <textarea
                  rows={3}
                  value={project.technologies.join(", ")}
                  onChange={(event) =>
                    onChange({
                      ...project,
                      technologies: event.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </label>
              <div>
                <p className="admin-field-title">Cover image</p>
                <ImageUploader
                  value={project.coverImage}
                  onChange={(coverImage) => onChange({ ...project, coverImage })}
                />
              </div>
              <BilingualField
                label="Image alternative text"
                value={project.imageAlt}
                onChange={(imageAlt) => onChange({ ...project, imageAlt })}
              />
              <div className="admin-inline-fields">
                <label>
                  Publishing status
                  <select
                    value={project.status}
                    onChange={(event) =>
                      onChange({
                        ...project,
                        status: event.target.value as "draft" | "published",
                      })
                    }
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </label>
                <label className="checkbox-field">
                  <input
                    type="checkbox"
                    checked={project.featured}
                    onChange={(event) =>
                      onChange({ ...project, featured: event.target.checked })
                    }
                  />
                  Featured project
                </label>
              </div>
              <div className="admin-card-actions">
                <button
                  className="admin-primary-button"
                  onClick={() => onSave(project)}
                  disabled={savingId === project.id}
                >
                  {savingId === project.id ? "Saving…" : "Save project"}
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
                  disabled={index === projects.length - 1}
                >
                  Move down
                </button>
                <button
                  className="admin-danger-button"
                  onClick={() => onDelete(project)}
                >
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

