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
    <footer className="contact-section" id="contact">
      <div className="contact-topline">
        <p className="eyebrow">
          {localize(settings.copy.contactEyebrow, language)}
        </p>
        <p>{localize(settings.location, language)}</p>
      </div>
      <h2>{localize(settings.contactClosing, language)}</h2>
      <div className="contact-actions">
        <a href={`mailto:${settings.email}`}>{settings.email}</a>
        <a href={`tel:${settings.phone.replaceAll("-", "")}`}>{settings.phone}</a>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} {settings.fullName}</p>
        <a href="#top">{localize(settings.copy.backToTop, language)}</a>
      </div>
    </footer>
  );
}
