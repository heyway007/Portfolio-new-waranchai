# Dark Technical Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild Waranchai's bilingual public portfolio as a readable dark technical interface with IBM Plex Sans Thai Looped, restrained interaction effects, and fully preserved CMS, D1, R2, authentication, preview, and deployment behavior.

**Architecture:** Keep the existing Vinext/React component and data flow, add one pure derived-statistics helper and one client-only progressive-enhancement reveal hook, then restyle only the public portfolio surface. The existing JSON content model, D1 schema, R2 media flow, API routes, and admin editing workflow remain unchanged; deployment reuses the existing Sites project and logical `DB`/`PORTFOLIO_ASSETS` bindings from `.openai/hosting.json`.

**Tech Stack:** TypeScript 5.9, React 19, Vinext/Next 16 compatibility APIs, CSS, Vitest, Node test runner, Cloudflare Workers, D1, R2, Sites hosting.

## Global Constraints

- Work on the existing `main` branch and preserve unrelated user changes.
- Reuse `.openai/hosting.json` project `appgprj_6a6c59322d148191bc93325e1b338cba`; do not call `create_site`.
- Preserve D1 binding `DB`, R2 binding `PORTFOLIO_ASSETS`, the current schema, content APIs, authentication, preview flow, and media URLs.
- Do not add runtime dependencies or animation libraries.
- Do not fabricate projects, work history, statistics, diagrams, client claims, or a contact form.
- Keep every public text value CMS-driven or derived from CMS-managed arrays.
- Use `IBM Plex Sans Thai Looped` weights 400, 500, 600, and 700 for Thai and English; retain Geist Mono only for short technical metadata.
- Use near-black charcoal (`#0b0d10` range), raised charcoal (`#11151a` range), warm off-white (`#f4f1ea` range), and amber orange (`#ff8a00` range).
- Keep interactive hit targets at least 44px and text at least 15px.
- Use one `IntersectionObserver` reveal behavior, one-time 16–24px upward movement, and 50–80ms group staggering.
- Disable transforms, delays, scaling, and smooth scrolling under `prefers-reduced-motion: reduce`.
- Keep content visible when JavaScript or `IntersectionObserver` is unavailable.
- Preserve admin styling except for inheriting the readable base font.
- Verify Thai and English wrapping at desktop, tablet, and mobile widths without horizontal overflow.

## File Structure

- `lib/content/portfolio-stats.ts`: pure calculation of experience span, project count, and listed-skill count.
- `tests/portfolio-stats.test.ts`: deterministic unit coverage for populated and empty CMS collections.
- `app/components/portfolio/useSectionReveal.ts`: progressive-enhancement observer lifecycle only; no business data.
- `app/layout.tsx`: IBM Plex Sans Thai Looped and Geist Mono font variables plus site-specific metadata.
- `app/components/portfolio/PortfolioClient.tsx`: language/navigation state, derived statistics, public page shell, About metrics, and reveal-hook activation.
- `app/components/portfolio/Hero.tsx`: two-column developer introduction and technical portrait frame.
- `app/components/portfolio/ProjectGrid.tsx`: compact real-project cards and valid/unavailable link states.
- `app/components/portfolio/Timeline.tsx`: experience timeline, education, and derived summary cells.
- `app/components/portfolio/SkillGroups.tsx`: compact technical skill cards.
- `app/components/portfolio/Contact.tsx`: split contact invitation, real links, footer, and back-to-top control.
- `app/globals.css`: public design tokens, responsive layout, hover/focus/reveal motion, reduced-motion rules, and unchanged admin block.
- `tests/design-contract.test.mjs`: source-level contracts for the selected font, theme tokens, progressive reveal, and motion fallback.
- `tests/rendered-html.test.mjs`: server-rendered semantic/content contracts.
- `public/og.png`: one validated, site-specific social preview image if its generated text is correct.

---

### Task 1: Derive honest portfolio statistics from CMS data

**Files:**

- Create: `lib/content/portfolio-stats.ts`
- Create: `tests/portfolio-stats.test.ts`

**Interfaces:**

- Consumes: `Pick<PortfolioData, "experience" | "projects" | "skillGroups">`
- Produces: `PortfolioStats` and `getPortfolioStats(data, currentYear?)`
- `PortfolioStats` fields: `experienceYears`, `projectCount`, and `skillCount`, all numbers.

- [ ] **Step 1: Write deterministic failing tests**

```ts
import { describe, expect, it } from "vitest";
import { defaultPortfolio } from "../lib/content/default-portfolio";
import { getPortfolioStats } from "../lib/content/portfolio-stats";

describe("getPortfolioStats", () => {
  it("derives all values from CMS-managed entries", () => {
    expect(getPortfolioStats(defaultPortfolio, 2026)).toEqual({
      experienceYears: 10,
      projectCount: defaultPortfolio.projects.length,
      skillCount: defaultPortfolio.skillGroups.reduce(
        (total, group) => total + group.skills.length,
        0,
      ),
    });
  });

  it("returns zero experience for empty content", () => {
    expect(
      getPortfolioStats(
        { experience: [], projects: [], skillGroups: [] },
        2026,
      ),
    ).toEqual({
      experienceYears: 0,
      projectCount: 0,
      skillCount: 0,
    });
  });

  it("never returns a negative experience span", () => {
    expect(
      getPortfolioStats(
        {
          experience: [{ ...defaultPortfolio.experience[0], startYear: 2030 }],
          projects: [],
          skillGroups: [],
        },
        2026,
      ).experienceYears,
    ).toBe(0);
  });

  it("does not count draft entries in public statistics", () => {
    expect(
      getPortfolioStats(
        {
          experience: [
            { ...defaultPortfolio.experience[0], status: "draft" },
          ],
          projects: [{ ...defaultPortfolio.projects[0], status: "draft" }],
          skillGroups: [
            { ...defaultPortfolio.skillGroups[0], status: "draft" },
          ],
        },
        2026,
      ),
    ).toEqual({
      experienceYears: 0,
      projectCount: 0,
      skillCount: 0,
    });
  });
});
```

- [ ] **Step 2: Run the focused test and verify the red state**

Run:

```powershell
npx vitest run --config vitest.config.ts tests/portfolio-stats.test.ts
```

Expected: FAIL because `lib/content/portfolio-stats.ts` does not exist.

- [ ] **Step 3: Implement the pure statistics helper**

```ts
import type { PortfolioData } from "./types";

type PortfolioCollections = Pick<
  PortfolioData,
  "experience" | "projects" | "skillGroups"
>;

export interface PortfolioStats {
  experienceYears: number;
  projectCount: number;
  skillCount: number;
}

export function getPortfolioStats(
  data: PortfolioCollections,
  currentYear = new Date().getFullYear(),
): PortfolioStats {
  const publishedExperience = data.experience.filter(
    (entry) => entry.status === "published",
  );
  const publishedProjects = data.projects.filter(
    (entry) => entry.status === "published",
  );
  const publishedSkillGroups = data.skillGroups.filter(
    (entry) => entry.status === "published",
  );
  const earliestStartYear = publishedExperience.reduce<number | null>(
    (earliest, entry) =>
      earliest === null ? entry.startYear : Math.min(earliest, entry.startYear),
    null,
  );

  return {
    experienceYears:
      earliestStartYear === null
        ? 0
        : Math.max(0, currentYear - earliestStartYear),
    projectCount: publishedProjects.length,
    skillCount: publishedSkillGroups.reduce(
      (total, group) => total + group.skills.length,
      0,
    ),
  };
}
```

- [ ] **Step 4: Run the focused test and the full unit suite**

Run:

```powershell
npx vitest run --config vitest.config.ts tests/portfolio-stats.test.ts
npm run test:unit
```

Expected: both commands PASS.

- [ ] **Step 5: Commit the statistics deliverable**

```powershell
git add -- lib/content/portfolio-stats.ts tests/portfolio-stats.test.ts
git commit -m "Add CMS-derived portfolio statistics"
```

---

### Task 2: Install the typography contract and progressive reveal foundation

**Files:**

- Create: `tests/design-contract.test.mjs`
- Create: `app/components/portfolio/useSectionReveal.ts`
- Modify: `package.json`
- Modify: `app/layout.tsx`
- Modify: `app/components/portfolio/PortfolioClient.tsx`
- Modify: `app/globals.css`

**Interfaces:**

- Consumes: browser `IntersectionObserver`, `matchMedia`, and elements carrying `[data-reveal]`.
- Produces: `useSectionReveal(): void`, root class `reveal-ready`, and revealed class `is-revealed`.
- Produces font variables `--font-ibm-plex-thai` and `--font-geist-mono`.

- [ ] **Step 1: Write the design-contract test and add it to the build-backed test script**

```js
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

test("uses the approved Thai font and dark technical tokens", () => {
  assert.match(layout, /IBM_Plex_Sans_Thai_Looped/);
  assert.match(layout, /--font-ibm-plex-thai/);
  assert.match(styles, /--surface-page:\s*#0b0d10/i);
  assert.match(styles, /--accent:\s*#ff8a00/i);
});

test("reveals content progressively and respects reduced motion", () => {
  assert.match(revealHook, /IntersectionObserver/);
  assert.match(revealHook, /reveal-ready/);
  assert.match(revealHook, /is-revealed/);
  assert.match(styles, /prefers-reduced-motion:\s*reduce/);
});
```

Change `package.json` to:

```json
"test": "npm run build && node --test tests/rendered-html.test.mjs tests/cloudflare-config.test.mjs tests/design-contract.test.mjs"
```

- [ ] **Step 2: Run the contract test and verify the red state**

Run:

```powershell
node --test tests/design-contract.test.mjs
```

Expected: FAIL because the IBM Plex import, approved tokens, and reveal hook are absent.

- [ ] **Step 3: Replace Geist Sans with IBM Plex Sans Thai Looped**

Use this font setup in `app/layout.tsx`:

```tsx
import {
  Geist_Mono,
  IBM_Plex_Sans_Thai_Looped,
} from "next/font/google";

const ibmPlexSansThai = IBM_Plex_Sans_Thai_Looped({
  variable: "--font-ibm-plex-thai",
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
```

Apply both variables to `<body>`:

```tsx
<body className={`${ibmPlexSansThai.variable} ${geistMono.variable}`}>
  {children}
</body>
```

- [ ] **Step 4: Implement the one-time progressive reveal hook**

Create `app/components/portfolio/useSectionReveal.ts`:

```ts
import { useEffect } from "react";

export function useSectionReveal() {
  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    if (elements.length === 0) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-revealed"));
      return;
    }

    const root = document.documentElement;
    root.classList.add("reveal-ready");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    elements.forEach((element) => observer.observe(element));
    return () => {
      observer.disconnect();
      root.classList.remove("reveal-ready");
    };
  }, []);
}
```

Import and call `useSectionReveal()` once near the start of `PortfolioClient`.

- [ ] **Step 5: Add the minimum tokens and fail-safe reveal rules**

Add these public tokens and fail-safe rules before the existing component rules:

```css
:root {
  --surface-page: #0b0d10;
  --surface-raised: #11151a;
  --text-primary: #f4f1ea;
  --text-secondary: #9ca3ad;
  --accent: #ff8a00;
}

body {
  font-family: var(--font-ibm-plex-thai), system-ui, sans-serif;
}

[data-reveal] {
  opacity: 1;
  transform: none;
}

.reveal-ready [data-reveal]:not(.is-revealed) {
  opacity: 0;
  transform: translateY(20px);
}

.reveal-ready [data-reveal].is-revealed {
  opacity: 1;
  transform: translateY(0);
  transition:
    opacity 520ms ease,
    transform 520ms cubic-bezier(0.2, 0.75, 0.2, 1);
}
```

- [ ] **Step 6: Run the focused contract and full unit suite**

Run:

```powershell
node --test tests/design-contract.test.mjs
npm run test:unit
```

Expected: PASS.

- [ ] **Step 7: Commit the typography and reveal foundation**

```powershell
git add -- package.json app/layout.tsx app/globals.css app/components/portfolio/PortfolioClient.tsx app/components/portfolio/useSectionReveal.ts tests/design-contract.test.mjs
git commit -m "Add portfolio typography and reveal foundation"
```

---

### Task 3: Rebuild the header, hero, and About summary

**Files:**

- Modify: `tests/rendered-html.test.mjs`
- Modify: `app/components/portfolio/PortfolioClient.tsx`
- Modify: `app/components/portfolio/Hero.tsx`

**Interfaces:**

- Consumes: `getPortfolioStats(portfolio)` from Task 1.
- Produces: `<main className="portfolio-site">`, technical portrait markup, `about-metrics`, and real metric values.
- Metric labels use CMS-managed `yearsLabel`, `projectsLabel`, and `navSkills`.

- [ ] **Step 1: Add failing server-rendered structure assertions**

Extend the first test in `tests/rendered-html.test.mjs`:

```js
assert.match(html, /class="portfolio-site"/i);
assert.match(html, /class="hero-technical-frame"/i);
assert.match(html, /class="about-metrics"/i);
assert.match(html, />10<.*Years of experience/is);
assert.match(html, />22<.*Skills/is);
assert.match(html, /data-reveal/i);
```

- [ ] **Step 2: Build and run the focused server-render test to verify failure**

Run:

```powershell
npm run build
node --test --test-name-pattern="portfolio identity" tests/rendered-html.test.mjs
```

Expected: FAIL because the new shell, frame, metrics, and reveal markers do not exist.

- [ ] **Step 3: Rebuild the public shell and About metrics**

In `PortfolioClient.tsx`:

```tsx
const stats = getPortfolioStats(portfolio);

return (
  <main className="portfolio-site">
    {/* existing skip link and preview banner */}
    <header className="site-header">
      {/* preserve brand, navigation, language state, and mobile menu behavior */}
    </header>
    <div id="main-content">
      <Hero settings={portfolio.settings} language={language} />
      <section className="section about-section" id="about" data-reveal>
        {/* CMS-managed eyebrow, heading, and About copy */}
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
      </section>
      {/* remaining sections */}
    </div>
  </main>
);
```

Keep the sticky header semantic structure, `aria-pressed`, `aria-expanded`, menu close-on-navigation, local language preference, and server-first English rendering.

- [ ] **Step 4: Rebuild the two-column hero without invented data**

Use the existing CMS values and portrait:

```tsx
<section className="hero" id="top" data-reveal>
  <div className="hero-copy">
    <p className="hero-eyebrow">{localize(settings.eyebrow, language)}</p>
    <h1>{settings.fullName}</h1>
    <p className="hero-role">{localize(settings.role, language)}</p>
    <p className="hero-intro">{localize(settings.introduction, language)}</p>
    <div className="hero-actions">{/* existing real actions */}</div>
  </div>
  <div className="hero-visual">
    <div className="hero-technical-frame" aria-hidden="true">
      <span>{localize(settings.role, language)}</span>
      <span>{localize(settings.eyebrow, language)}</span>
    </div>
    <div className="portrait-frame">
      {/* existing validated portrait and localized alt text */}
    </div>
    <p className="hero-index">Portfolio / {new Date().getFullYear()}</p>
  </div>
</section>
```

Keep the availability status visible, preserve both CTA destinations, and use no dashboard metrics or system diagrams.

- [ ] **Step 5: Rebuild and rerun the focused server-render test**

Run:

```powershell
npm run build
node --test --test-name-pattern="portfolio identity" tests/rendered-html.test.mjs
```

Expected: PASS with the new semantic structure and derived values.

- [ ] **Step 6: Commit the first-viewport deliverable**

```powershell
git add -- app/components/portfolio/PortfolioClient.tsx app/components/portfolio/Hero.tsx tests/rendered-html.test.mjs
git commit -m "Rebuild portfolio hero and summary"
```

---

### Task 4: Rebuild projects, journey, skills, and contact sections

**Files:**

- Modify: `tests/rendered-html.test.mjs`
- Modify: `app/components/portfolio/PortfolioClient.tsx`
- Modify: `app/components/portfolio/ProjectGrid.tsx`
- Modify: `app/components/portfolio/Timeline.tsx`
- Modify: `app/components/portfolio/SkillGroups.tsx`
- Modify: `app/components/portfolio/Contact.tsx`

**Interfaces:**

- Consumes: `PortfolioStats` from Task 1 and all existing localized entry arrays.
- Produces: `projects-grid`, `timeline-track`, `journey-summary`, `skills-grid`, and `contact-layout`.
- `Timeline` gains `stats: PortfolioStats`, `yearsLabel: string`, `projectsLabel: string`, and `skillsLabel: string`.

- [ ] **Step 1: Add failing semantic section assertions**

Add a new server-rendered test:

```js
test("renders the dark technical section structure without fake controls", async () => {
  const response = await render("/");
  const html = await response.text();

  assert.match(html, /class="projects-grid"/i);
  assert.match(html, /class="timeline-track"/i);
  assert.match(html, /class="journey-summary"/i);
  assert.match(html, /class="skills-grid"/i);
  assert.match(html, /class="contact-layout"/i);
  assert.doesNotMatch(html, /<form[^>]*class="contact/i);
});
```

- [ ] **Step 2: Build and run the new test to verify failure**

Run:

```powershell
npm run build
node --test --test-name-pattern="dark technical section" tests/rendered-html.test.mjs
```

Expected: FAIL because the new class contracts are absent.

- [ ] **Step 3: Convert projects into compact cards**

In `ProjectGrid.tsx`:

- Rename the list wrapper to `projects-grid`.
- Add `data-reveal` to every project article.
- Keep `project.featured`, real images, localized content, technologies, and case-study `<details>`.
- Render an `<a target="_blank" rel="noreferrer">` only when `project.liveUrl.trim()` is non-empty.
- Keep no-URL projects as non-clickable labels using existing localized `caseStudy` copy.
- Keep `priority={index < 2}` and localized image alt text.

The card shell remains:

```tsx
<article
  className={project.featured ? "project-card is-featured" : "project-card"}
  id={`project-${project.slug}`}
  key={project.id}
  data-reveal
>
  <div className="project-media">{/* existing image behavior */}</div>
  <div className="project-copy">{/* existing CMS content */}</div>
</article>
```

- [ ] **Step 4: Add the timeline track and one-source summary panel**

Update `Timeline` props:

```ts
stats: PortfolioStats;
yearsLabel: string;
projectsLabel: string;
skillsLabel: string;
```

Render:

```tsx
<div className="timeline-layout">
  <div className="timeline-track">
    {experience.map((entry) => (
      <article className="timeline-item" key={entry.id} data-reveal>
        {/* existing localized date, company, role, and summary */}
      </article>
    ))}
  </div>
  <aside className="journey-panel" data-reveal>
    <div className="education-panel">{/* existing CMS education */}</div>
    <div className="journey-summary">
      <div><strong>{stats.experienceYears}</strong><span>{yearsLabel}</span></div>
      <div><strong>{stats.projectCount}</strong><span>{projectsLabel}</span></div>
      <div><strong>{stats.skillCount}</strong><span>{skillsLabel}</span></div>
    </div>
  </aside>
</div>
```

Pass the same `stats` object used by About from `PortfolioClient` so repeated figures cannot diverge.

- [ ] **Step 5: Convert skills into stagger-ready technical cards**

Keep the existing data map and add only presentation hooks:

```tsx
<div className="skills-grid">
  {groups.map((group, index) => (
    <article className="skill-card" key={group.id} data-reveal>
      <p className="skill-index">{String(index + 1).padStart(2, "0")}</p>
      <h3>{localize(group.name, language)}</h3>
      <ul>{/* existing skills */}</ul>
    </article>
  ))}
</div>
```

Do not add brand logos because the CMS stores skill names rather than verified icon metadata.

- [ ] **Step 6: Convert contact into a split invitation and real-link panel**

Render `Contact` as:

```tsx
<footer className="contact-section" id="contact" data-reveal>
  <div className="contact-layout">
    <div className="contact-message">
      <p className="eyebrow">{localize(settings.copy.contactEyebrow, language)}</p>
      <h2>{localize(settings.contactClosing, language)}</h2>
    </div>
    <div className="contact-details">
      <p>{localize(settings.location, language)}</p>
      <a href={`mailto:${settings.email}`}>{settings.email}</a>
      <a href={`tel:${settings.phone.replaceAll("-", "")}`}>{settings.phone}</a>
    </div>
  </div>
  <div className="footer-bottom">{/* existing copyright and back-to-top */}</div>
</footer>
```

Do not add a message form or submission endpoint.

- [ ] **Step 7: Build and run server-rendered tests**

Run:

```powershell
npm run build
node --test tests/rendered-html.test.mjs
```

Expected: PASS, including draft filtering, admin redirects, and the new public structure.

- [ ] **Step 8: Commit the remaining semantic redesign**

```powershell
git add -- app/components/portfolio/PortfolioClient.tsx app/components/portfolio/ProjectGrid.tsx app/components/portfolio/Timeline.tsx app/components/portfolio/SkillGroups.tsx app/components/portfolio/Contact.tsx tests/rendered-html.test.mjs
git commit -m "Rebuild portfolio content sections"
```

---

### Task 5: Apply the complete dark technical responsive visual system

**Files:**

- Modify: `app/globals.css`
- Modify: `tests/design-contract.test.mjs`

**Interfaces:**

- Consumes: class names and `[data-reveal]` hooks from Tasks 2–4.
- Produces: public-only dark layout, orange interaction states, responsive breakpoints at 1199/760px, and reduced-motion behavior.
- Admin selectors from `.admin-login` onward remain structurally intact.

- [ ] **Step 1: Strengthen the failing CSS contract**

Add assertions:

```js
assert.match(styles, /\.portfolio-site/);
assert.match(styles, /\.project-card:hover/);
assert.match(styles, /scale\(1\.03\)/);
assert.match(styles, /@media\s*\(max-width:\s*1199px\)/);
assert.match(styles, /@media\s*\(max-width:\s*760px\)/);
assert.match(styles, /transition-delay:\s*calc/);
```

- [ ] **Step 2: Run the design-contract test and verify failure**

Run:

```powershell
node --test tests/design-contract.test.mjs
```

Expected: FAIL until all public visual contracts are implemented.

- [ ] **Step 3: Replace the public CSS block with scoped dark tokens and layout**

Keep shared reset/form typography safe for admin, then scope the dark surface:

```css
.portfolio-site {
  min-height: 100vh;
  overflow: clip;
  background:
    radial-gradient(circle at 78% 10%, rgb(255 138 0 / 10%), transparent 28rem),
    var(--surface-page);
  color: var(--text-primary);
}

.portfolio-site::before {
  position: fixed;
  inset: 0;
  z-index: 0;
  background-image:
    linear-gradient(rgb(255 255 255 / 2.8%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 2.8%) 1px, transparent 1px);
  background-size: 48px 48px;
  content: "";
  mask-image: linear-gradient(to bottom, black, transparent 72%);
  pointer-events: none;
}
```

Implement:

- 1200–1320px centered content rail.
- Sticky glass header with circular mark, centered navigation, and compact segmented TH/EN control.
- Two-column hero with large readable name, orange role, bordered technical portrait frame, subtle grid, and real status.
- Concise About copy plus three bordered metric cells.
- Two-column project cards with bordered media frames.
- Vertical orange experience rail and compact education/summary panel.
- Compact skill cards with typographic indexes and pill-like skill names.
- Split contact area with orange radial glow and compact footer.
- Warm off-white primary text and WCAG AA secondary text.

- [ ] **Step 4: Implement restrained hover, focus, and reveal effects**

Use:

```css
.button-primary::before {
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, #ff8a00, #ffad33);
  content: "";
  transform: translateX(-105%);
  transition: transform 220ms ease;
}

.button-primary:hover {
  transform: translateY(-2px);
}

.button-primary:hover::before {
  transform: translateX(0);
}

.project-card {
  transition:
    transform 240ms ease,
    border-color 240ms ease,
    box-shadow 240ms ease;
}

.project-card:hover {
  border-color: rgb(255 138 0 / 58%);
  box-shadow: 0 18px 48px rgb(0 0 0 / 32%), 0 0 0 1px rgb(255 138 0 / 12%);
  transform: translateY(-5px);
}

.project-card:hover .project-media img {
  transform: scale(1.03);
}

.reveal-ready [data-reveal]:nth-child(2) {
  transition-delay: calc(1 * 65ms);
}
```

Cover navigation underline growth, secondary-button border color, skill-card surface/index movement, timeline-node halo, contact-link underline reveal, and arrow movement. Mirror hover affordances with `:focus-visible` or `:focus-within` and keep touch content fully visible.

- [ ] **Step 5: Implement tablet, mobile, and reduced-motion rules**

Use exact breakpoints:

```css
@media (max-width: 1199px) {
  /* reduce rail width, hero gap, and secondary-panel density */
}

@media (max-width: 760px) {
  /* single-column hero/projects/journey/contact and accessible mobile nav */
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-delay: 0ms !important;
    transition-duration: 0.01ms !important;
  }

  .reveal-ready [data-reveal],
  .project-card:hover,
  .project-card:hover .project-media img {
    opacity: 1;
    transform: none;
  }
}
```

Ensure 390px layouts have no negative-width grids, clipped Thai text, off-screen project details, or hover-only information.

- [ ] **Step 6: Run design, unit, and lint checks**

Run:

```powershell
node --test tests/design-contract.test.mjs
npm run test:unit
npm run lint
```

Expected: PASS with no CSS/TypeScript lint errors.

- [ ] **Step 7: Commit the complete visual system**

```powershell
git add -- app/globals.css tests/design-contract.test.mjs
git commit -m "Apply dark technical portfolio design"
```

---

### Task 6: Create and wire a site-specific social preview

**Files:**

- Create when validated: `public/og.png`
- Modify when validated: `app/layout.tsx`
- Modify when validated: `tests/rendered-html.test.mjs`

**Interfaces:**

- Consumes: the final name, role, charcoal/orange palette, grid motif, and typography direction from Tasks 3–5.
- Produces when usable: a 1200×630 PNG and absolute per-request Open Graph/X image URL.
- If the single generated image contains incorrect or invented text, omit `og:image` and keep the existing title/description metadata.

- [ ] **Step 1: Launch exactly one image generation request**

Use this prompt:

```text
Create one complete 1200x630 landscape social preview card for the finished portfolio of Waranchai Pungwattananukul. Use a near-black charcoal background, thin technical grid lines, restrained amber-orange accents, warm off-white typography, and a precise modern full-stack developer aesthetic matching an IBM Plex Sans Thai Looped interface. Include only this exact visible text: "Waranchai Pungwattananukul" and "Full-Stack Web Developer". Keep the text large and legible for link previews, with generous safe margins. Do not add logos, dashboards, metrics, extra words, fake UI, contact information, or invented claims.
```

- [ ] **Step 2: Inspect the single result before using it**

Confirm:

- Exact spelling of `Waranchai Pungwattananukul`.
- Exact role `Full-Stack Web Developer`.
- No extra or invented text.
- Strong contrast and safe margins at 1200×630.
- Visual match with the implemented charcoal/orange site.

If it passes, save it as `public/og.png`. If it fails, do not retry and do not add an Open Graph image.

- [ ] **Step 3: Add a failing metadata assertion only when the image passed**

Add:

```js
assert.match(html, /property="og:image"/i);
assert.match(html, /\/og\.png/i);
assert.match(html, /name="twitter:card" content="summary_large_image"/i);
```

Run:

```powershell
npm run build
node --test --test-name-pattern="portfolio identity" tests/rendered-html.test.mjs
```

Expected: FAIL until metadata is wired.

- [ ] **Step 4: Wire absolute host-aware metadata only when the image passed**

Use `headers()` from `next/headers` in an async `generateMetadata()` function:

```tsx
import { headers } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "waranchai-portfolio.newforico-9ea.workers.dev";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.includes("localhost") ? "http" : "https");
  const imageUrl = `${protocol}://${host}/og.png`;

  return {
    title: "Waranchai Pungwattananukul — Full-Stack Web Developer",
    description:
      "Portfolio of Waranchai Pungwattananukul, a Full-Stack Web Developer in Bangkok building reliable digital products.",
    openGraph: {
      type: "website",
      title: "Waranchai Pungwattananukul — Full-Stack Web Developer",
      description:
        "Portfolio of Waranchai Pungwattananukul, a Full-Stack Web Developer in Bangkok building reliable digital products.",
      images: [{ url: imageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      images: [imageUrl],
    },
    icons: {
      icon: "/favicon.png",
      shortcut: "/favicon.png",
    },
  };
}
```

Keep static metadata unchanged instead when the generated image is rejected.

- [ ] **Step 5: Rebuild and verify metadata when applicable**

Run:

```powershell
npm run build
node --test --test-name-pattern="portfolio identity" tests/rendered-html.test.mjs
```

Expected: PASS; if `og.png` was rejected, the existing title/description still build and the image assertions were not added.

- [ ] **Step 6: Commit the social preview result**

If usable:

```powershell
git add -- public/og.png app/layout.tsx tests/rendered-html.test.mjs
git commit -m "Add portfolio social preview"
```

If rejected, record no source change and proceed without a commit for this task.

---

### Task 7: Verify, review, push, package, and publish the exact source

**Files:**

- Verify: all changed files
- Preserve: `.openai/hosting.json`
- Package: existing Vinext `dist/` output plus hosting metadata

**Interfaces:**

- Consumes: the exact committed source from Tasks 1–6.
- Produces: passing checks, a clean `main`, a pushed GitHub branch, one saved Sites version, and a successful production deployment.

- [ ] **Step 1: Run the complete local verification gate**

Run:

```powershell
npm run test:unit
npm test
npm run lint
git diff --check
git status --short
```

Expected:

- Unit suite PASS.
- Production build and Node test suite PASS.
- D1 binding remains exactly `DB`.
- R2 binding remains exactly `PORTFOLIO_ASSETS`.
- `assets.run_worker_first` remains `false`.
- Lint PASS.
- No whitespace errors.
- Only intended redesign files are modified.

- [ ] **Step 2: Inspect the production output contracts**

Run:

```powershell
Get-ChildItem -LiteralPath dist/server/index.js
Get-ChildItem -LiteralPath dist/server/wrangler.json
Get-ChildItem -LiteralPath dist/client/assets | Select-Object -First 10
Select-String -LiteralPath dist/server/wrangler.json -Pattern '"run_worker_first": false'
```

Expected: Worker entry, Wrangler config, and static CSS/JS assets exist; static assets bypass the Worker.

- [ ] **Step 3: Review the final diff against the approved design**

Check:

- No D1 migrations, auth, route, or R2 changes.
- No fake form, metrics, projects, or URLs.
- All sections use localized CMS content.
- IBM Plex Sans Thai Looped is the body font.
- Admin selectors remain present.
- Reduced-motion content is visible.
- Project links render only from non-empty `liveUrl`.

- [ ] **Step 4: Run the approved bilingual responsive browser QA**

Start the existing development flow in a retained process:

```powershell
npm run dev
```

Open the exact local URL printed by the healthy server once. Using the browser
control skill, verify at 1440px, 768px, and 390px:

- English and Thai language switching updates the visible copy and document
  language.
- Navigation, mobile menu, both hero actions, project details, valid external
  links, email, phone, and back-to-top are keyboard/touch operable.
- Thai headings wrap without clipping.
- Projects, timeline, skills, and contact collapse to the intended columns.
- The page has no horizontal overflow.
- Hover/focus feedback appears without hiding information.
- With reduced motion enabled, all content is visible and movement is removed.
- `/admin/login` remains readable and the anonymous `/admin` and `/preview`
  redirects remain intact.

Correct any observed defect with `apply_patch`, rerun the complete verification
gate from Step 1, and commit that bounded correction with `git add -u` and
`git commit -m "Polish responsive portfolio behavior"`.

- [ ] **Step 5: Commit any verification-only correction and push `main`**

If browser QA or the final verification gate required a correction:

```powershell
git add -u
git commit -m "Polish responsive portfolio behavior"
```

Then:

```powershell
git push origin main
git status --short
```

Expected: GitHub `main` points to the verified commit and the worktree is clean.

- [ ] **Step 6: Publish through the existing Sites project**

- Read `.openai/hosting.json` and reuse its exact opaque `project_id`.
- Discover the current Sites connector schemas.
- Obtain a source-repository write credential for the existing project only if the current one is unavailable or expired.
- Push the exact verified branch-head source state using per-command authorization without storing credentials in remotes or Git config.
- Build the hosting archive with the bundled `scripts/package-site.sh` helper from the exact pushed commit.
- Save one site version using the exact pushed `commit_sha` and archive.
- Deploy that saved version using the available private deployment method; if only public/shared deployment is available, request the required access approval before deployment.
- Poll deployment status until `succeeded` or terminal failure.

- [ ] **Step 7: Open the successful production deployment and verify reachability**

After Sites reports `succeeded`, open the exact returned production URL in Codex. Perform only a reachability check unless the user separately requests browser UI testing.

Also request the existing public Worker URL:

```powershell
Invoke-WebRequest -Uri 'https://waranchai-portfolio.newforico-9ea.workers.dev/' -Method Get | Select-Object StatusCode
Invoke-WebRequest -Uri 'https://waranchai-portfolio.newforico-9ea.workers.dev/favicon.png' -Method Get | Select-Object StatusCode,Headers
```

Expected: HTML and static assets return HTTP 200.

- [ ] **Step 8: Report the user-visible result**

Return:

- The deployed production URL.
- A short summary: dark technical redesign, IBM Plex Sans Thai Looped, bilingual switch, restrained hover/reveal motion, real CMS-derived statistics, responsive layout, and preserved backend/admin.
- Any rejected social-preview image outcome, only if it was omitted.
