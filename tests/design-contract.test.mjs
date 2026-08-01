import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const layout = await readFile(
  new URL("../app/layout.tsx", import.meta.url),
  "utf8",
);
const styles = await readFile(
  new URL("../app/globals.css", import.meta.url),
  "utf8",
);
const revealHook = await readFile(
  new URL(
    "../app/components/portfolio/useSectionReveal.ts",
    import.meta.url,
  ),
  "utf8",
);
const backToTopSource = await readFile(
  new URL(
    "../app/components/portfolio/BackToTop.tsx",
    import.meta.url,
  ),
  "utf8",
);
const portfolioClientSource = await readFile(
  new URL(
    "../app/components/portfolio/PortfolioClient.tsx",
    import.meta.url,
  ),
  "utf8",
);
const contactSource = await readFile(
  new URL("../app/components/portfolio/Contact.tsx", import.meta.url),
  "utf8",
);
const heroSource = await readFile(
  new URL("../app/components/portfolio/Hero.tsx", import.meta.url),
  "utf8",
);
const settingsEditorSource = await readFile(
  new URL(
    "../app/admin/components/SettingsEditor.tsx",
    import.meta.url,
  ),
  "utf8",
);

function assertCssRule(css, selector, property, value) {
  const propertyPattern = new RegExp(
    `${property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*:\\s*${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
  );
  const matchesRule = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].some(
    ([, selectors, declarations]) =>
      selectors
        .split(",")
        .map((item) => item.trim())
        .includes(selector) && propertyPattern.test(declarations),
  );

  assert.ok(matchesRule, `${selector} must set ${property}: ${value}`);
}

test("uses the approved dark technical tokens", () => {
  assert.match(styles, /--surface-page:\s*#0b0d10/i);
  assert.match(styles, /--accent:\s*#ff8a00/i);
  assert.match(styles, /\.portfolio-site/);
  assert.match(styles, /\.project-card:hover/);
  assert.match(styles, /scale\(1\.03\)/);
  assert.match(styles, /@media\s*\(max-width:\s*1199px\)/);
  assert.match(styles, /@media\s*\(max-width:\s*760px\)/);
  assert.match(styles, /transition-delay:\s*calc/);
});

test("uses a full-width header and responsive code hero", () => {
  const reducedMotionStyles = styles.slice(
    styles.indexOf("@media (prefers-reduced-motion: reduce)"),
    styles.indexOf("/* Admin */"),
  );

  assertCssRule(styles, ".portfolio-site .site-header", "width", "100%");
  assert.match(styles, /\.hero-copy-panel/);
  assert.match(styles, /\.hero-portrait-background/);
  assert.match(styles, /\.hero-code-editor/);
  assert.match(styles, /\.code-caret/);
  assert.match(styles, /grid-template-columns:\s*minmax\(0,\s*1fr\)/);
  assert.match(reducedMotionStyles, /\.portfolio-site \.code-caret/);
  assert.match(reducedMotionStyles, /animation:\s*none/);
});

test("links the Hero contact action to the Warm Graphite Contact flow", () => {
  assert.match(
    heroSource,
    /className="button button-quiet"[\s\S]*?href="#contact"/,
  );
  assert.doesNotMatch(heroSource, /mailto:/);
  assert.match(
    styles,
    /\.portfolio-site\s*{[^}]*background:\s*radial-gradient\(circle at 16% 18%,\s*rgb\(255 138 0 \/ 18%\),\s*transparent 36%\),\s*radial-gradient\(circle at 86% 72%,\s*rgb\(98 124 154 \/ 22%\),\s*transparent 43%\),\s*linear-gradient\(135deg,\s*#1c2229 0%,\s*#11161c 55%,\s*#202832 100%\)/,
  );
});

test("edits every LINE contact field through the Admin profile", () => {
  assert.match(
    settingsEditorSource,
    /type="url"[\s\S]*?value={value\.lineUrl}/,
  );
  assert.match(
    settingsEditorSource,
    /label="LINE link label"[\s\S]*?value={value\.lineLabel}/,
  );
  assert.match(settingsEditorSource, /value={value\.lineQrImage}/);
  assert.match(settingsEditorSource, /alt={value\.lineQrAlt}/);
  assert.match(
    settingsEditorSource,
    /label="LINE QR alternative text"[\s\S]*?value={value\.lineQrAlt}/,
  );
});

test("mounts one localized floating Back to Top control", () => {
  assert.match(
    backToTopSource,
    /addEventListener\("scroll",\s*syncVisibility,\s*{\s*passive:\s*true\s*}\)/,
  );
  assert.match(backToTopSource, /className="back-to-top"/);
  assert.match(
    portfolioClientSource,
    /<BackToTop\s+label={label\("backToTop"\)}\s*\/>/,
  );
  assert.doesNotMatch(contactSource, /href="#top"/);
});

test("styles the smaller Contact heading and floating control", () => {
  assertCssRule(
    styles,
    ".portfolio-site .contact-message h2",
    "font-size",
    "clamp(2.25rem, 5vw, 4.75rem)",
  );
  assertCssRule(styles, ".portfolio-site .back-to-top", "position", "fixed");
  assertCssRule(styles, ".portfolio-site .back-to-top", "min-width", "48px");
  assertCssRule(styles, ".portfolio-site .back-to-top", "min-height", "48px");
  assert.match(
    styles,
    /@media\s*\(max-width:\s*760px\)[\s\S]*?\.portfolio-site \.contact-message h2\s*{[^}]*font-size:\s*clamp\(2rem,\s*10vw,\s*3.25rem\)/,
  );
  assert.match(
    styles,
    /@media\s*\(max-width:\s*760px\)[\s\S]*?\.portfolio-site \.back-to-top/,
  );
});

test("uses a responsive three-card project carousel", () => {
  const reducedMotionStyles = styles.slice(
    styles.indexOf("@media (prefers-reduced-motion: reduce)"),
    styles.indexOf("/* Admin */"),
  );

  assertCssRule(
    styles,
    ".portfolio-site .project-slide-grid",
    "grid-template-columns",
    "repeat(3, minmax(0, 1fr))",
  );
  assertCssRule(
    styles,
    ".portfolio-site .project-carousel-button",
    "min-width",
    "44px",
  );
  assertCssRule(
    styles,
    ".portfolio-site .project-carousel-button",
    "min-height",
    "44px",
  );
  assert.match(styles, /@keyframes\s+project-slide-forward/);
  assert.match(styles, /@keyframes\s+project-slide-backward/);
  assert.match(
    styles,
    /@media\s*\(max-width:\s*1199px\)[\s\S]*?\.portfolio-site \.project-slide-grid\s*{[^}]*repeat\(2,/,
  );
  assert.match(
    styles,
    /@media\s*\(max-width:\s*760px\)[\s\S]*?\.portfolio-site \.project-slide-grid\s*{[^}]*minmax\(0,\s*1fr\)/,
  );
  assert.match(reducedMotionStyles, /\.portfolio-site \.project-slide-grid/);
  assert.match(reducedMotionStyles, /animation:\s*none/);
});

test("uses one-column public headings without eyebrow styling", () => {
  assertCssRule(styles, ".portfolio-site .section-heading", "width", "100%");
  assertCssRule(
    styles,
    ".portfolio-site .section-heading-wide",
    "width",
    "100%",
  );
  assertCssRule(
    styles,
    ".portfolio-site .section-heading",
    "grid-template-columns",
    "minmax(0, 1fr)",
  );
  assertCssRule(
    styles,
    ".portfolio-site .section-heading-wide",
    "grid-template-columns",
    "minmax(0, 1fr)",
  );
  assertCssRule(
    styles,
    ".portfolio-site .section-heading h2",
    "width",
    "100%",
  );
  assertCssRule(
    styles,
    ".portfolio-site .section-heading h2",
    "max-width",
    "none",
  );
  assert.doesNotMatch(styles, /\.portfolio-site \.hero-eyebrow/);
});

test("uses compact uniform public section spacing", () => {
  assertCssRule(styles, ".portfolio-site", "--section-space", "5rem");
  assert.match(
    styles,
    /@media\s*\(max-width:\s*1199px\)[\s\S]*?\.portfolio-site\s*{[^}]*--section-space:\s*4rem/,
  );
  assert.match(
    styles,
    /@media\s*\(max-width:\s*760px\)[\s\S]*?\.portfolio-site\s*{[^}]*--section-space:\s*3rem/,
  );
  assertCssRule(
    styles,
    ".portfolio-site .contact-section",
    "padding-block",
    "var(--section-space)",
  );
});

test("uses only the Inter and Prompt stack across the application", () => {
  const source = `${layout}\n${styles}`;

  assert.doesNotMatch(
    source,
    /IBM_Plex_Sans_Thai_Looped|Geist_Mono|--font-ibm-plex-thai|--font-geist-mono/,
  );

  assert.match(
    styles,
    /font-family:\s*["']Inter["'],\s*["']Prompt["'],\s*sans-serif;/,
  );

  const explicitFontRules = styles.match(/font:\s*[^;]+;/g) ?? [];
  const monospaceRules = explicitFontRules.filter((rule) =>
    rule.includes("ui-monospace"),
  );
  assert.deepEqual(monospaceRules, [
    "font: 500 0.72rem/1.65 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;",
  ]);

  for (const rule of explicitFontRules) {
    if (rule === "font: inherit;" || rule.includes("ui-monospace")) continue;
    assert.match(
      rule,
      /["']Inter["'],\s*["']Prompt["'],\s*sans-serif/,
      `Unexpected font shorthand: ${rule}`,
    );
  }
});

test("reveals content progressively and respects reduced motion", () => {
  assert.match(revealHook, /IntersectionObserver/);
  assert.match(revealHook, /reveal-ready/);
  assert.match(revealHook, /is-revealed/);
  assert.match(styles, /prefers-reduced-motion:\s*reduce/);
});

test("removes every public interaction transform for reduced motion", () => {
  const reducedMotionStyles = styles.slice(
    styles.indexOf("@media (prefers-reduced-motion: reduce)"),
    styles.indexOf("/* Admin */"),
  );
  const transformedInteractions = [
    ".portfolio-site .site-nav a:hover::after",
    ".portfolio-site .site-nav a:focus-visible::after",
    ".portfolio-site .button-primary:hover",
    ".portfolio-site .button-primary:focus-visible",
    ".portfolio-site .button-primary:hover::before",
    ".portfolio-site .button-primary:focus-visible::before",
    ".portfolio-site .button:hover span",
    ".portfolio-site .button:focus-visible span",
    ".portfolio-site .project-link:hover span",
    ".portfolio-site .project-link:focus-visible span",
    ".portfolio-site .button-quiet:hover",
    ".portfolio-site .button-quiet:focus-visible",
    ".portfolio-site .project-card:hover",
    ".portfolio-site .project-card:focus-within",
    ".portfolio-site .project-card:hover .project-media img",
    ".portfolio-site .project-card:focus-within .project-media img",
    ".portfolio-site .project-link:hover::after",
    ".portfolio-site .project-link:focus-visible::after",
    ".portfolio-site .contact-details a:hover::after",
    ".portfolio-site .contact-details a:focus-visible::after",
  ];

  for (const selector of transformedInteractions) {
    assertCssRule(reducedMotionStyles, selector, "transform", "none");
  }
});

test("keeps language controls at least 44px in both dimensions", () => {
  const selector = ".portfolio-site .language-switch button";
  assertCssRule(styles, selector, "min-width", "44px");
  assertCssRule(styles, selector, "min-height", "44px");
});

test("keeps public prose at least 15px", () => {
  assertCssRule(
    styles,
    ".portfolio-site .timeline-item p:last-child",
    "font-size",
    "0.9375rem",
  );
  assertCssRule(
    styles,
    ".portfolio-site .education-panel article p:last-child",
    "font-size",
    "0.9375rem",
  );
  assertCssRule(
    styles,
    ".portfolio-site .contact-details p",
    "font-size",
    "0.9375rem",
  );
});

test("covers every bare admin brand mark and eyebrow context", () => {
  const adminContexts = [
    {
      selector: ".admin-login .brand-mark",
      declarations: [
        ["display", "grid"],
        ["width", "2.1rem"],
        ["height", "2.1rem"],
        ["border-radius", "50%"],
        ["background", "var(--ink)"],
        ["color", "white"],
      ],
    },
    {
      selector: ".admin-loading .brand-mark",
      declarations: [
        ["display", "grid"],
        ["width", "2.1rem"],
        ["height", "2.1rem"],
        ["border-radius", "50%"],
        ["background", "var(--ink)"],
        ["color", "white"],
      ],
    },
    {
      selector: ".admin-shell .brand-mark",
      declarations: [
        ["display", "grid"],
        ["width", "2.1rem"],
        ["height", "2.1rem"],
        ["border-radius", "50%"],
        ["background", "var(--ink)"],
        ["color", "white"],
      ],
    },
    {
      selector: ".admin-login .eyebrow",
      declarations: [
        ["margin", "0 0 1.25rem"],
        ["color", "var(--blue)"],
        ["letter-spacing", "0.12em"],
        ["text-transform", "uppercase"],
      ],
    },
    {
      selector: ".admin-shell .eyebrow",
      declarations: [
        ["margin", "0 0 1.25rem"],
        ["color", "var(--blue)"],
        ["letter-spacing", "0.12em"],
        ["text-transform", "uppercase"],
      ],
    },
  ];

  for (const { selector, declarations } of adminContexts) {
    for (const [property, value] of declarations) {
      assertCssRule(styles, selector, property, value);
    }
  }
});

test("staggers all ten current dynamic project cards", () => {
  assertCssRule(
    styles,
    ".reveal-ready .portfolio-site [data-reveal]:nth-child(10)",
    "transition-delay",
    "calc(9 * 65ms)",
  );
});

test("lays out grouped skill logos responsively without motion transforms", () => {
  assert.match(
    styles,
    /\.portfolio-site \.skill-card\s*{[^}]*grid-template-columns:[^;}]+/s,
  );
  assert.match(
    styles,
    /\.portfolio-site \.skill-items\s*{[^}]*display:\s*grid[^}]*repeat\(auto-fit,/s,
  );
  assert.match(
    styles,
    /\.portfolio-site \.skill-item\s*{[^}]*flex-direction:\s*column/s,
  );
  assert.doesNotMatch(
    styles,
    /\.portfolio-site \.skill-item:(?:hover|focus-visible)[^{]*{[^}]*transform:/s,
  );
});
