import type { PortfolioStats } from "../../../lib/content/portfolio-stats";
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
  stats,
  yearsLabel,
  projectsLabel,
  skillsLabel,
}: {
  experience: ExperienceEntry[];
  education: EducationEntry[];
  language: Language;
  eyebrow: string;
  title: string;
  educationLabel: string;
  presentLabel: string;
  stats: PortfolioStats;
  yearsLabel: string;
  projectsLabel: string;
  skillsLabel: string;
}) {
  return (
    <section className="section timeline-section" id="experience">
      <div className="section-heading">
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      <div className="timeline-layout">
        <div className="timeline-track">
          {experience.map((entry) => (
            <article className="timeline-item" key={entry.id} data-reveal>
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
        <aside className="journey-panel" data-reveal>
          <div className="education-panel">
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
          </div>
          <div className="journey-summary">
            <div>
              <strong>{stats.experienceYears}</strong>
              <span>{yearsLabel}</span>
            </div>
            <div>
              <strong>{stats.projectCount}</strong>
              <span>{projectsLabel}</span>
            </div>
            <div>
              <strong>{stats.skillCount}</strong>
              <span>{skillsLabel}</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
