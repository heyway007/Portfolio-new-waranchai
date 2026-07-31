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
  return (
    <section className="hero" id="top" data-reveal>
      <div className="hero-copy">
        <div className="status-row">
          <span className="status-dot" aria-hidden="true" />
          {localize(settings.availability, language)}
        </div>
        <p className="hero-eyebrow">{localize(settings.eyebrow, language)}</p>
        <h1>{settings.fullName}</h1>
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
        <div className="hero-technical-frame" aria-hidden="true">
          <span>{localize(settings.role, language)}</span>
          <span>{localize(settings.eyebrow, language)}</span>
        </div>
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
        <p className="hero-index">
          Portfolio / {new Date().getFullYear()}
        </p>
      </div>
    </section>
  );
}
