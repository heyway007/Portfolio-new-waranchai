import type { Language, ProjectEntry } from "../../../lib/content/types";
import { localize } from "../../../lib/content/i18n";
import Image from "next/image";

export function ProjectGrid({
  projects,
  language,
  eyebrow,
  title,
}: {
  projects: ProjectEntry[];
  language: Language;
  eyebrow: string;
  title: string;
}) {
  return (
    <section className="section work-section" id="work">
      <div className="section-heading section-heading-wide">
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      <div className="projects-list">
        {projects.map((project, index) => (
          <article
            className={project.featured ? "project-card is-featured" : "project-card"}
            key={project.id}
          >
            <div className="project-media">
              <Image
                src={project.coverImage}
                alt={localize(project.imageAlt, language)}
                width={1600}
                height={1000}
                priority={index < 2}
                unoptimized
              />
              <span className="project-number">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <div className="project-copy">
              <div className="project-meta">
                <span>{localize(project.role, language)}</span>
                <span>{project.featured ? "Featured" : "Archive"}</span>
              </div>
              <h3>{localize(project.title, language)}</h3>
              <p>{localize(project.summary, language)}</p>
              <ul className="tag-list" aria-label="Technologies">
                {project.technologies.map((technology) => (
                  <li key={technology}>{technology}</li>
                ))}
              </ul>
              {project.liveUrl ? (
                <a
                  className="project-link"
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {language === "th" ? "เยี่ยมชมเว็บไซต์" : "Visit website"}
                  <span aria-hidden="true">↗</span>
                </a>
              ) : (
                <span className="case-study-label">
                  {language === "th" ? "กรณีศึกษา" : "Case study"}
                </span>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
