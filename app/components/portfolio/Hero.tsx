import Image from "next/image";
import type { Language, SiteSettings } from "../../../lib/content/types";
import { localize } from "../../../lib/content/i18n";
import { HeroCodeEditor } from "./HeroCodeEditor";

export function Hero({
  settings,
  language,
}: {
  settings: SiteSettings;
  language: Language;
}) {
  return (
    <section className="hero" id="top" data-reveal>
      <div className="hero-copy-panel">
        {settings.portrait ? (
          <Image
            className="hero-portrait-background"
            src={settings.portrait}
            alt=""
            fill
            sizes="(max-width: 760px) 100vw, 50vw"
            priority
            unoptimized
          />
        ) : null}
        <div className="hero-copy-content">
          <div className="status-row">
            <span className="status-dot" aria-hidden="true" />
            {localize(settings.availability, language)}
          </div>
          <p className="hero-eyebrow">
            {localize(settings.eyebrow, language)}
          </p>
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
            <a
              className="button button-quiet"
              href={`mailto:${settings.email}`}
            >
              {localize(settings.copy.heroContactAction, language)}
            </a>
          </div>
        </div>
      </div>
      <div className="hero-code-panel">
        <HeroCodeEditor />
      </div>
    </section>
  );
}
