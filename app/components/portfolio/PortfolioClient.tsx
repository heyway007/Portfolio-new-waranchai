"use client";

import { useEffect, useState } from "react";
import type {
  Language,
  PortfolioData,
  SiteCopy,
} from "../../../lib/content/types";
import { localize } from "../../../lib/content/i18n";
import { getPortfolioStats } from "../../../lib/content/portfolio-stats";
import { Hero } from "./Hero";
import { ProjectGrid } from "./ProjectGrid";
import { Timeline } from "./Timeline";
import { SkillGroups } from "./SkillGroups";
import { Contact } from "./Contact";
import { BackToTop } from "./BackToTop";
import { useSectionReveal } from "./useSectionReveal";

const anchors: { id: string; label: keyof SiteCopy }[] = [
  { id: "about", label: "navAbout" },
  { id: "work", label: "navWork" },
  { id: "experience", label: "navExperience" },
  { id: "skills", label: "navSkills" },
  { id: "contact", label: "navContact" },
];

export function PortfolioClient({
  data,
  preview = false,
  liveData = false,
}: {
  data: PortfolioData;
  preview?: boolean;
  liveData?: boolean;
}) {
  useSectionReveal();
  const [language, setLanguage] = useState<Language>("en");
  const [menuOpen, setMenuOpen] = useState(false);
  const [portfolio, setPortfolio] = useState(data);
  const stats = getPortfolioStats(portfolio);
  const label = (key: keyof SiteCopy) =>
    localize(portfolio.settings.copy[key], language);

  useEffect(() => {
    const saved = window.localStorage.getItem("portfolio-language");
    const nextLanguage =
      saved === "th" || saved === "en"
        ? saved
        : window.navigator.language.toLowerCase().startsWith("th")
          ? "th"
          : "en";
    const timer = window.setTimeout(() => setLanguage(nextLanguage), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (!liveData) return;
    const controller = new AbortController();
    fetch("/api/portfolio", { signal: controller.signal })
      .then((response) =>
        response.ok
          ? (response.json() as Promise<{
              ok?: boolean;
              data?: PortfolioData;
            }>)
          : null,
      )
      .then((result) => {
        if (result?.ok && result.data) setPortfolio(result.data);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [liveData]);

  function changeLanguage(nextLanguage: Language) {
    setLanguage(nextLanguage);
    window.localStorage.setItem("portfolio-language", nextLanguage);
  }

  return (
    <main className="portfolio-site">
      <a className="skip-link" href="#main-content">
        {label("skip")}
      </a>
      {preview ? <div className="preview-banner">Draft preview</div> : null}
      <header className="site-header">
        <a
          className="brand"
          href="#top"
          aria-label={`${portfolio.settings.fullName} — home`}
        >
          <span className="brand-mark">W</span>
          <span className="brand-name">
            {portfolio.settings.fullName.split(" ")[0]}
          </span>
        </a>
        <nav
          id="primary-nav"
          className={menuOpen ? "site-nav is-open" : "site-nav"}
          aria-label="Primary navigation"
        >
          {anchors.map(({ id, label: key }) => (
            <a href={`#${id}`} key={id} onClick={() => setMenuOpen(false)}>
              {label(key)}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <div className="language-switch" aria-label="Language">
            {(["th", "en"] as Language[]).map((item) => (
              <button
                type="button"
                key={item}
                className={language === item ? "is-active" : ""}
                aria-pressed={language === item}
                onClick={() => changeLanguage(item)}
              >
                {item.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            className="menu-button"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="primary-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? label("close") : label("menu")}
          </button>
        </div>
      </header>

      <div id="main-content">
        <Hero settings={portfolio.settings} language={language} />

        <section className="section about-section" id="about" data-reveal>
          <div className="section-heading">
            <h2>{label("aboutTitle")}</h2>
          </div>
          <div className="about-grid">
            <p className="about-copy">
              {localize(portfolio.settings.about, language)}
            </p>
            <div className="about-metrics" aria-label={label("aboutTitle")}>
              <div>
                <strong>{stats.experienceYears}</strong>
                <span>{label("yearsLabel")}</span>
              </div>
              <div>
                <strong>{stats.projectCount}</strong>
                <span>{label("projectsLabel")}</span>
              </div>
              <div>
                <strong>{stats.skillCount}</strong>
                <span>{label("navSkills")}</span>
              </div>
            </div>
          </div>
        </section>

        <ProjectGrid
          projects={portfolio.projects}
          language={language}
          copy={portfolio.settings.copy}
        />

        <Timeline
          experience={portfolio.experience}
          education={portfolio.education}
          language={language}
          title={label("experienceTitle")}
          presentLabel={label("present")}
          stats={stats}
          yearsLabel={label("yearsLabel")}
          projectsLabel={label("projectsLabel")}
          skillsLabel={label("navSkills")}
        />

        <SkillGroups
          groups={portfolio.skillGroups}
          language={language}
          title={label("skillsTitle")}
        />

        <Contact settings={portfolio.settings} language={language} />
      </div>
      <BackToTop label={label("backToTop")} />
    </main>
  );
}
