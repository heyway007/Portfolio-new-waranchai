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

test("uses the approved Thai font and dark technical tokens", () => {
  assert.match(layout, /IBM_Plex_Sans_Thai_Looped/);
  assert.match(layout, /--font-ibm-plex-thai/);
  assert.match(styles, /--surface-page:\s*#0b0d10/i);
  assert.match(styles, /--accent:\s*#ff8a00/i);
  assert.match(styles, /\.portfolio-site/);
  assert.match(styles, /\.project-card:hover/);
  assert.match(styles, /scale\(1\.03\)/);
  assert.match(styles, /@media\s*\(max-width:\s*1199px\)/);
  assert.match(styles, /@media\s*\(max-width:\s*760px\)/);
  assert.match(styles, /transition-delay:\s*calc/);
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
    ".portfolio-site .skill-card:hover .skill-index",
    ".portfolio-site .skill-card:focus-within .skill-index",
    ".portfolio-site .contact-details a:hover::after",
    ".portfolio-site .contact-details a:focus-visible::after",
    ".portfolio-site .footer-bottom a:hover::after",
    ".portfolio-site .footer-bottom a:focus-visible::after",
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

test("staggers all ten current dynamic project cards", () => {
  assertCssRule(
    styles,
    ".reveal-ready .portfolio-site [data-reveal]:nth-child(10)",
    "transition-delay",
    "calc(9 * 65ms)",
  );
});
