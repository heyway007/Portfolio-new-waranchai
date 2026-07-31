import Image from "next/image";
import type {
  Language,
  ProjectEntry,
  SiteCopy,
} from "../../../lib/content/types";
import { localize } from "../../../lib/content/i18n";

export function ProjectGrid({
  projects,
  language,
  copy,
}: {
  projects: ProjectEntry[];
  language: Language;
  copy: SiteCopy;
}) {
  const label = (key: keyof SiteCopy) => localize(copy[key], language);

  return (
    <section className="section work-section" id="work">
      <div className="section-heading section-heading-wide">
        <p className="eyebrow">{label("workEyebrow")}</p>
        <h2>{label("workTitle")}</h2>
      </div>
      <div className="projects-list">
        {projects.map((project, index) => {
          const liveUrl = project.liveUrl.trim();
          const body = localize(project.body, language);
          const supportingImages = project.supportingImages ?? [];
          return (
            <article
              className={
                project.featured ? "project-card is-featured" : "project-card"
              }
              id={`project-${project.slug}`}
              key={project.id}
            >
              <div className="project-media">
                {project.coverImage ? (
                  <Image
                    src={project.coverImage}
                    alt={localize(project.imageAlt, language)}
                    width={1600}
                    height={1000}
                    priority={index < 2}
                    unoptimized
                  />
                ) : (
                  <div className="project-image-placeholder" aria-hidden="true" />
                )}
                <span className="project-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="project-copy">
                <div className="project-meta">
                  <span>{localize(project.role, language)}</span>
                  <span>
                    {project.featured ? label("featured") : label("archive")}
                  </span>
                </div>
                <h3>{localize(project.title, language)}</h3>
                <p>{localize(project.summary, language)}</p>
                <ul className="tag-list" aria-label="Technologies">
                  {project.technologies.map((technology) => (
                    <li key={technology}>{technology}</li>
                  ))}
                </ul>
                {liveUrl ? (
                  <a
                    className="project-link"
                    href={liveUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {label("visitWebsite")}
                    <span aria-hidden="true">↗</span>
                  </a>
                ) : (
                  <span className="case-study-label">{label("caseStudy")}</span>
                )}
                {body || supportingImages.length > 0 ? (
                  <details className="project-case-study">
                    <summary>{label("caseStudyDetails")}</summary>
                    {body ? <p>{body}</p> : null}
                    {supportingImages.length > 0 ? (
                      <div className="project-supporting-images">
                        {supportingImages.map((image, imageIndex) => (
                          <Image
                            key={`${image.url}-${imageIndex}`}
                            src={image.url}
                            alt={localize(image.alt, language)}
                            width={1200}
                            height={800}
                            unoptimized
                          />
                        ))}
                      </div>
                    ) : null}
                  </details>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
