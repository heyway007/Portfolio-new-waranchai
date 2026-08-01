import Image from "next/image";
import type { Language, SiteSettings } from "../../../lib/content/types";
import { localize } from "../../../lib/content/i18n";

export function Contact({
  settings,
  language,
}: {
  settings: SiteSettings;
  language: Language;
}) {
  return (
    <footer className="contact-section" id="contact" data-reveal>
      <div className="contact-layout">
        <div className="contact-message">
          <h2>{localize(settings.contactClosing, language)}</h2>
        </div>
        <div className="contact-details">
          <p>{localize(settings.location, language)}</p>
          <a className="contact-link" href={`mailto:${settings.email}`}>
            {settings.email}
          </a>
          <a
            className="contact-link"
            href={`tel:${settings.phone.replaceAll("-", "")}`}
          >
            {settings.phone}
          </a>
          <div className="line-contact">
            <a
              className="line-qr-link"
              href={settings.lineUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={localize(settings.lineLabel, language)}
            >
              <Image
                src={settings.lineQrImage}
                alt={localize(settings.lineQrAlt, language)}
                width={900}
                height={900}
                unoptimized
              />
            </a>
            <a
              className="contact-link line-text-link"
              href={settings.lineUrl}
              target="_blank"
              rel="noreferrer"
            >
              {localize(settings.lineLabel, language)}
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} {settings.fullName}</p>
      </div>
    </footer>
  );
}
