import type {
  EducationEntry,
  ExperienceEntry,
  Language,
} from "../../../lib/content/types";
import { localize } from "../../../lib/content/i18n";

function yearRange(
  startYear: number,
  endYear: number | null,
  current: boolean,
  presentLabel: string,
) {
  return current
    ? `${startYear} — ${presentLabel}`
    : `${startYear} — ${endYear}`;
}

export function Timeline({
  experience,
  education,
  language,
  eyebrow,
  title,
  educationLabel,
  presentLabel,
}: {
  experience: ExperienceEntry[];
  education: EducationEntry[];
  language: Language;
  eyebrow: string;
  title: string;
  educationLabel: string;
  presentLabel: string;
}) {
  return (
    <section className="section timeline-section" id="experience">
      <div className="section-heading">
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      <div className="timeline-layout">
        <div className="timeline">
          {experience.map((entry) => (
            <article className="timeline-item" key={entry.id}>
              <p className="timeline-year">
                {yearRange(
                  entry.startYear,
                  entry.endYear,
                  entry.current,
                  presentLabel,
                )}
              </p>
              <div>
                <h3>{localize(entry.company, language)}</h3>
                <p className="timeline-role">{localize(entry.role, language)}</p>
                <p>{localize(entry.summary, language)}</p>
              </div>
            </article>
          ))}
        </div>
        <aside className="education-panel">
          <p className="eyebrow">{educationLabel}</p>
          {education.map((entry) => (
            <article key={entry.id}>
              <p className="education-year">
                {entry.startYear} — {entry.endYear}
              </p>
              <h3>{localize(entry.institution, language)}</h3>
              <p>{localize(entry.qualification, language)}</p>
            </article>
          ))}
        </aside>
      </div>
    </section>
  );
}
