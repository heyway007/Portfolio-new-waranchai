"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type FocusEvent as ReactFocusEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type {
  Language,
  ProjectEntry,
  SiteCopy,
} from "../../../lib/content/types";
import { localize } from "../../../lib/content/i18n";
import {
  getProjectsPerSlide,
  getProjectSlideCount,
  getVisibleProjectSlice,
  PROJECT_AUTOPLAY_INTERVAL_MS,
  PROJECTS_PER_SLIDE_DESKTOP,
  wrapProjectSlideIndex,
} from "./project-carousel";

type SlideDirection = -1 | 1;

export function ProjectGrid({
  projects,
  language,
  copy,
}: {
  projects: ProjectEntry[];
  language: Language;
  copy: SiteCopy;
}) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [projectsPerSlide, setProjectsPerSlide] = useState(
    PROJECTS_PER_SLIDE_DESKTOP,
  );
  const [direction, setDirection] = useState<SlideDirection>(1);
  const [pointerPaused, setPointerPaused] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const pointerStartX = useRef<number | null>(null);
  const label = (key: keyof SiteCopy) => localize(copy[key], language);
  const slideCount = getProjectSlideCount(projects.length, projectsPerSlide);
  const currentSlideIndex = wrapProjectSlideIndex(slideIndex, slideCount);
  const visibleProjects = getVisibleProjectSlice(
    projects,
    currentSlideIndex,
    projectsPerSlide,
  );
  const isPaused = pointerPaused || focusPaused;
  const carouselText =
    language === "th"
      ? {
          label: "ผลงานแบบสไลด์",
          previous: "ดูสไลด์ก่อนหน้า",
          next: "ดูสไลด์ถัดไป",
          goTo: (index: number) => `ไปยังสไลด์ ${index}`,
          status: (current: number, total: number) =>
            `สไลด์ ${current} จาก ${total}`,
        }
      : {
          label: "Project carousel",
          previous: "View previous slide",
          next: "View next slide",
          goTo: (index: number) => `Go to slide ${index}`,
          status: (current: number, total: number) =>
            `Slide ${current} of ${total}`,
        };

  useEffect(() => {
    const syncPageSize = () => {
      setProjectsPerSlide(getProjectsPerSlide(window.innerWidth));
      setSlideIndex(0);
    };

    syncPageSize();
    window.addEventListener("resize", syncPageSize);
    return () => window.removeEventListener("resize", syncPageSize);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotionPreference = () => setReducedMotion(mediaQuery.matches);

    syncMotionPreference();
    mediaQuery.addEventListener("change", syncMotionPreference);
    return () =>
      mediaQuery.removeEventListener("change", syncMotionPreference);
  }, []);

  useEffect(() => {
    if (isPaused || reducedMotion || slideCount <= 1) return;

    const timer = window.setInterval(() => {
      setDirection(1);
      setSlideIndex((current) =>
        wrapProjectSlideIndex(current + 1, slideCount),
      );
    }, PROJECT_AUTOPLAY_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [isPaused, reducedMotion, slideCount]);

  function navigate(directionToUse: SlideDirection) {
    setDirection(directionToUse);
    setSlideIndex((current) =>
      wrapProjectSlideIndex(current + directionToUse, slideCount),
    );
  }

  function goToSlide(nextSlideIndex: number) {
    setDirection(nextSlideIndex < currentSlideIndex ? -1 : 1);
    setSlideIndex(wrapProjectSlideIndex(nextSlideIndex, slideCount));
  }

  function handleBlur(event: ReactFocusEvent<HTMLDivElement>) {
    const nextFocus = event.relatedTarget as Node | null;
    if (!event.currentTarget.contains(nextFocus)) setFocusPaused(false);
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch" || event.pointerType === "pen") {
      pointerStartX.current = event.clientX;
    }
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (pointerStartX.current === null) return;

    const swipeDistance = event.clientX - pointerStartX.current;
    pointerStartX.current = null;
    if (Math.abs(swipeDistance) < 50) return;
    navigate(swipeDistance > 0 ? -1 : 1);
  }

  return (
    <section className="section work-section" id="work">
      <div className="section-heading section-heading-wide">
        <p className="eyebrow">{label("workEyebrow")}</p>
        <h2>{label("workTitle")}</h2>
      </div>
      <div
        className="project-carousel"
        role="region"
        aria-roledescription="carousel"
        aria-label={carouselText.label}
        onMouseEnter={() => setPointerPaused(true)}
        onMouseLeave={() => setPointerPaused(false)}
        onFocusCapture={() => setFocusPaused(true)}
        onBlurCapture={handleBlur}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          pointerStartX.current = null;
        }}
      >
        <div className="project-carousel-viewport">
          <div
            className="project-slide-grid"
            data-direction={direction === 1 ? "forward" : "backward"}
            key={`${projectsPerSlide}-${currentSlideIndex}`}
          >
            {visibleProjects.map((project, index) => {
              const projectIndex =
                currentSlideIndex * projectsPerSlide + index;
              const liveUrl = project.liveUrl.trim();
              const body = localize(project.body, language);
              const supportingImages = project.supportingImages ?? [];
              return (
                <article
                  className={
                    project.featured
                      ? "project-card is-featured"
                      : "project-card"
                  }
                  id={`project-${project.slug}`}
                  key={project.id}
                  data-reveal
                >
                  <div className="project-media">
                    {project.coverImage ? (
                      <Image
                        src={project.coverImage}
                        alt={localize(project.imageAlt, language)}
                        width={1600}
                        height={1000}
                        priority={projectIndex < 2}
                        unoptimized
                      />
                    ) : (
                      <div
                        className="project-image-placeholder"
                        aria-hidden="true"
                      />
                    )}
                    <span className="project-number">
                      {String(projectIndex + 1).padStart(2, "0")}
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
                      <span className="case-study-label">
                        {label("caseStudy")}
                      </span>
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
        </div>

        {slideCount > 1 ? (
          <div className="project-carousel-controls">
            <button
              className="project-carousel-button"
              type="button"
              onClick={() => navigate(-1)}
              aria-label={carouselText.previous}
            >
              <span aria-hidden="true">←</span>
            </button>
            <div className="project-carousel-dots" aria-label={carouselText.label}>
              {Array.from({ length: slideCount }, (_, index) => (
                <button
                  type="button"
                  onClick={() => goToSlide(index)}
                  aria-label={carouselText.goTo(index + 1)}
                  aria-current={index === currentSlideIndex ? "true" : undefined}
                  key={index}
                />
              ))}
            </div>
            <p
              className="project-carousel-status"
              aria-live={isPaused || reducedMotion ? "polite" : "off"}
            >
              {carouselText.status(currentSlideIndex + 1, slideCount)}
            </p>
            <button
              className="project-carousel-button"
              type="button"
              onClick={() => navigate(1)}
              aria-label={carouselText.next}
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
