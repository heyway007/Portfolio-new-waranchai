import Image from "next/image";
import type { Language, SiteSettings } from "../../../lib/content/types";
import { localize } from "../../../lib/content/i18n";

export function Hero({
  settings,
  language,
}: {
  settings: SiteSettings;
  language: Language;
}) {
  const nameParts = settings.fullName.split(" ");
  return (
    <section className="hero" id="top">
      <div className="hero-copy">
        <div className="status-row">
          <span className="status-dot" aria-hidden="true" />
          {localize(settings.availability, language)}
        </div>
        <p className="hero-eyebrow">{localize(settings.eyebrow, language)}</p>
        <h1>
          <span>{nameParts[0]}</span>
          <span>{nameParts.slice(1).join(" ")}</span>
        </h1>
        <p className="hero-role">{localize(settings.role, language)}</p>
        <p className="hero-intro">
          {localize(settings.introduction, language)}
        </p>
        <div className="hero-actions">
          <a className="button button-primary" href="#work">
            {localize(settings.copy.heroWorkAction, language)}
            <span aria-hidden="true">↘</span>
          </a>
          <a className="button button-quiet" href={`mailto:${settings.email}`}>
            {localize(settings.copy.heroContactAction, language)}
          </a>
        </div>
      </div>
      <div className="hero-visual">
        <div className="portrait-frame">
          {settings.portrait ? (
            <Image
              src={settings.portrait}
              alt={localize(settings.portraitAlt, language)}
              width={900}
              height={1300}
              priority
              unoptimized
            />
          ) : null}
        </div>
        <div className="hero-stamp" aria-hidden="true">
          <span>FULL</span>
          <span>STACK</span>
          <span>WEB</span>
        </div>
        <p className="hero-index">
          Portfolio / {new Date().getFullYear()}
        </p>
      </div>
    </section>
  );
}
