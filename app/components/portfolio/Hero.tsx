import type { Language, SiteSettings } from "../../../lib/content/types";
import { localize } from "../../../lib/content/i18n";
import Image from "next/image";

export function Hero({
  settings,
  language,
}: {
  settings: SiteSettings;
  language: Language;
}) {
  return (
    <section className="hero" id="top">
      <div className="hero-copy">
        <div className="status-row">
          <span className="status-dot" aria-hidden="true" />
          {localize(settings.availability, language)}
        </div>
        <p className="hero-eyebrow">{localize(settings.eyebrow, language)}</p>
        <h1>
          <span>{settings.fullName.split(" ")[0]}</span>
          <span>{settings.fullName.split(" ").slice(1).join(" ")}</span>
        </h1>
        <p className="hero-role">{localize(settings.role, language)}</p>
        <p className="hero-intro">
          {localize(settings.introduction, language)}
        </p>
        <div className="hero-actions">
          <a className="button button-primary" href="#work">
            {language === "th" ? "ดูผลงาน" : "View selected work"}
            <span aria-hidden="true">↘</span>
          </a>
          <a className="button button-quiet" href={`mailto:${settings.email}`}>
            {language === "th" ? "คุยเรื่องโปรเจกต์" : "Start a conversation"}
          </a>
        </div>
      </div>
      <div className="hero-visual">
        <div className="portrait-frame">
          <Image
            src={settings.portrait}
            alt={localize(settings.portraitAlt, language)}
            width={900}
            height={1300}
            priority
            unoptimized
          />
        </div>
        <div className="hero-stamp" aria-hidden="true">
          <span>FULL</span>
          <span>STACK</span>
          <span>WEB</span>
        </div>
        <p className="hero-index">Portfolio / 2026</p>
      </div>
    </section>
  );
}
