"use client";

import { useEffect, useState } from "react";
import type { Language, PortfolioData } from "../../../lib/content/types";
import { localize } from "../../../lib/content/i18n";
import { Hero } from "./Hero";
import { ProjectGrid } from "./ProjectGrid";
import { Timeline } from "./Timeline";
import { SkillGroups } from "./SkillGroups";
import { Contact } from "./Contact";

const copy = {
  en: {
    nav: ["About", "Work", "Experience", "Skills", "Contact"],
    menu: "Menu",
    close: "Close",
    skip: "Skip to content",
    aboutEyebrow: "Profile / 01",
    aboutTitle: "Building useful things, thoughtfully.",
    experienceEyebrow: "Journey / 03",
    experienceTitle: "Experience that spans products and industries.",
    education: "Education",
    workEyebrow: "Selected work / 02",
    workTitle: "Systems, platforms, and websites made to work.",
    skillsEyebrow: "Capabilities / 04",
    skillsTitle: "A practical, full-stack toolkit.",
  },
  th: {
    nav: ["เกี่ยวกับ", "ผลงาน", "ประสบการณ์", "ทักษะ", "ติดต่อ"],
    menu: "เมนู",
    close: "ปิด",
    skip: "ข้ามไปยังเนื้อหา",
    aboutEyebrow: "โปรไฟล์ / 01",
    aboutTitle: "สร้างสิ่งที่มีประโยชน์อย่างตั้งใจ",
    experienceEyebrow: "เส้นทาง / 03",
    experienceTitle: "ประสบการณ์จากหลากหลายผลิตภัณฑ์และอุตสาหกรรม",
    education: "การศึกษา",
    workEyebrow: "ผลงานเด่น / 02",
    workTitle: "ระบบ แพลตฟอร์ม และเว็บไซต์ที่สร้างมาเพื่อใช้งานจริง",
    skillsEyebrow: "ความสามารถ / 04",
    skillsTitle: "เครื่องมือ Full-Stack สำหรับโจทย์ในโลกจริง",
  },
} as const;

const anchors = ["about", "work", "experience", "skills", "contact"];

export function PortfolioClient({
  data,
  preview = false,
  liveData = false,
}: {
  data: PortfolioData;
  preview?: boolean;
  liveData?: boolean;
}) {
  const [language, setLanguage] = useState<Language>("en");
  const [menuOpen, setMenuOpen] = useState(false);
  const [portfolio, setPortfolio] = useState(data);
  const t = copy[language];

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
    <main>
      <a className="skip-link" href="#main-content">
        {t.skip}
      </a>
      {preview ? <div className="preview-banner">Draft preview</div> : null}
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Waranchai — home">
          <span className="brand-mark">W</span>
          <span className="brand-name">Waranchai</span>
        </a>
        <nav
          className={menuOpen ? "site-nav is-open" : "site-nav"}
          aria-label="Primary navigation"
        >
          {anchors.map((anchor, index) => (
            <a
              href={`#${anchor}`}
              key={anchor}
              onClick={() => setMenuOpen(false)}
            >
              {t.nav[index]}
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
            {menuOpen ? t.close : t.menu}
          </button>
        </div>
      </header>

      <div id="main-content">
        <Hero settings={portfolio.settings} language={language} />

        <section className="section about-section" id="about">
          <div className="section-heading">
            <p className="eyebrow">{t.aboutEyebrow}</p>
            <h2>{t.aboutTitle}</h2>
          </div>
          <div className="about-grid">
            <p className="about-copy">
              {localize(portfolio.settings.about, language)}
            </p>
            <div className="about-notes">
              <div>
                <strong>10+</strong>
                <span>{language === "th" ? "ปีของประสบการณ์" : "Years of experience"}</span>
              </div>
              <div>
                <strong>{portfolio.projects.length}</strong>
                <span>{language === "th" ? "ผลงานที่คัดสรร" : "Selected projects"}</span>
              </div>
              <div>
                <strong>TH / EN</strong>
                <span>{language === "th" ? "สื่อสารสองภาษา" : "Bilingual communication"}</span>
              </div>
            </div>
          </div>
        </section>

        <ProjectGrid
          projects={portfolio.projects}
          language={language}
          eyebrow={t.workEyebrow}
          title={t.workTitle}
        />

        <Timeline
          experience={portfolio.experience}
          education={portfolio.education}
          language={language}
          eyebrow={t.experienceEyebrow}
          title={t.experienceTitle}
          educationLabel={t.education}
        />

        <SkillGroups
          groups={portfolio.skillGroups}
          language={language}
          eyebrow={t.skillsEyebrow}
          title={t.skillsTitle}
        />

        <Contact settings={portfolio.settings} language={language} />
      </div>
    </main>
  );
}
