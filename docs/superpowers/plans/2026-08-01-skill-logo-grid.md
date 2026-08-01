# Skill Logo Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render all 22 CMS-managed skills as locally hosted, full-color SVG icons with their names below, while retaining the five existing bilingual skill groups.

**Architecture:** Add a pure string-to-local-path registry with a guaranteed fallback, vendor brand SVGs into `public/icons/skills/`, and generate custom local pictograms for non-brand concepts. Update only the public `SkillGroups` renderer and its scoped CSS; the CMS data shape and D1 content remain unchanged.

**Tech Stack:** React 19, TypeScript 5.9, Vinext/Next Image, CSS, Vitest, Node test runner, local SVG assets, Simple Icons 16.21.0 source assets

## Global Constraints

- Display all 22 current skills and preserve the Backend, Frontend, Platform & Delivery, Quality, and Growth & Analytics groups.
- Use local SVG files under `public/icons/skills/`; make no runtime CDN requests.
- Use recognizable brand shapes and full brand colors for named technologies.
- Use distinct colored pictograms for RESTful API, CMS, AJAX, DevOps, Web Hosting, Responsive Design, Web Security, Web Performance, and SEO.
- Keep `SkillGroupEntry.skills: string[]`, D1, R2, validation, APIs, admin forms, navigation, copy, authentication, and portfolio statistics unchanged.
- Render the visible CMS skill string below every decorative icon.
- Unknown skill strings must use `/icons/skills/tool.svg` without breaking layout.
- Do not add a runtime icon dependency.
- Preserve reduced-motion behavior and avoid hover/focus transforms on skill items.

---

### Task 1: Vendor SVG Assets and Add the Skill Icon Registry

**Files:**
- Create: `scripts/vendor-skill-icons.mjs`
- Create: `public/icons/skills/README.md`
- Create: `public/icons/skills/php.svg`
- Create: `public/icons/skills/laravel.svg`
- Create: `public/icons/skills/mysql.svg`
- Create: `public/icons/skills/rest-api.svg`
- Create: `public/icons/skills/cms.svg`
- Create: `public/icons/skills/javascript.svg`
- Create: `public/icons/skills/typescript.svg`
- Create: `public/icons/skills/html5.svg`
- Create: `public/icons/skills/css3.svg`
- Create: `public/icons/skills/jquery.svg`
- Create: `public/icons/skills/angularjs.svg`
- Create: `public/icons/skills/ajax.svg`
- Create: `public/icons/skills/github.svg`
- Create: `public/icons/skills/linux.svg`
- Create: `public/icons/skills/devops.svg`
- Create: `public/icons/skills/web-hosting.svg`
- Create: `public/icons/skills/responsive-design.svg`
- Create: `public/icons/skills/web-security.svg`
- Create: `public/icons/skills/web-performance.svg`
- Create: `public/icons/skills/seo.svg`
- Create: `public/icons/skills/ga4.svg`
- Create: `public/icons/skills/google-search-console.svg`
- Create: `public/icons/skills/tool.svg`
- Create: `lib/content/skill-icons.ts`
- Create: `tests/skill-icons.test.ts`

**Interfaces:**
- Consumes: `defaultPortfolio.skillGroups[].skills` strings.
- Produces: `FALLBACK_SKILL_ICON: string` and `getSkillIcon(skill: string): string` from `lib/content/skill-icons.ts`.
- Produces: 23 same-origin SVG files with fixed `viewBox` values and no remote references.

- [ ] **Step 1: Write the failing registry and asset test**

Create `tests/skill-icons.test.ts`:

```ts
import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { defaultPortfolio } from "../lib/content/default-portfolio";
import {
  FALLBACK_SKILL_ICON,
  getSkillIcon,
} from "../lib/content/skill-icons";

describe("skill icon registry", () => {
  it("maps every default skill to a local non-fallback SVG", async () => {
    const skills = defaultPortfolio.skillGroups.flatMap((group) => group.skills);

    expect(skills).toHaveLength(22);
    expect(new Set(skills).size).toBe(22);

    for (const skill of skills) {
      const iconPath = getSkillIcon(skill);
      expect(iconPath).toMatch(/^\/icons\/skills\/[a-z0-9-]+\.svg$/);
      expect(iconPath).not.toBe(FALLBACK_SKILL_ICON);

      const source = await readFile(
        path.join(process.cwd(), "public", iconPath.replace(/^\/+/, "")),
        "utf8",
      );
      expect(source).toMatch(/<svg\b[^>]*viewBox=/i);
      expect(source).not.toMatch(/(?:href|src)=["']https?:\/\//i);
      expect(source).not.toMatch(/<script\b/i);
    }
  });

  it("uses the local generic icon for an unknown CMS skill", () => {
    expect(getSkillIcon("New Tool")).toBe(FALLBACK_SKILL_ICON);
    expect(getSkillIcon("  new tool  ")).toBe(FALLBACK_SKILL_ICON);
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
npx vitest run tests/skill-icons.test.ts --config vitest.config.ts
```

Expected: FAIL because `lib/content/skill-icons.ts` does not exist yet.

- [ ] **Step 3: Add the deterministic asset-vendoring script**

Create `scripts/vendor-skill-icons.mjs` with this complete source:

```js
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const outputDirectory = path.resolve("public/icons/skills");
const simpleIconsVersion = "16.21.0";

const brandIcons = [
  ["php", "php", "777BB4"],
  ["laravel", "laravel", "FF2D20"],
  ["mysql", "mysql", "4479A1"],
  ["javascript", "javascript", "F7DF1E"],
  ["typescript", "typescript", "3178C6"],
  ["html5", "html5", "E34F26"],
  ["css3", "css", "663399"],
  ["jquery", "jquery", "0769AD"],
  ["angularjs", "angular", "DD0031"],
  ["github", "github", "FFFFFF"],
  ["linux", "linux", "FCC624"],
  ["ga4", "googleanalytics", "E37400"],
  ["google-search-console", "googlesearchconsole", "458CF5"],
];

const pictograms = {
  "rest-api": [
    "00BCD4",
    '<circle cx="5" cy="12" r="2.5"/><circle cx="19" cy="5" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M7.5 11l9-5M7.5 13l9 5"/>',
  ],
  cms: [
    "9C6ADE",
    '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 8h18M7 12h4M7 16h7"/>',
  ],
  ajax: [
    "35B779",
    '<path d="M4 8h13l-3-3M20 16H7l3 3M17 8l-3 3M7 16l3-3"/>',
  ],
  devops: [
    "FF8A00",
    '<path d="M12 8c-2-4-8-4-8 1 0 4 5 4 8 0 3-4 8-4 8 0 0 5-6 5-8 1-2-4-8-4-8 1"/>',
  ],
  "web-hosting": [
    "4A90E2",
    '<rect x="4" y="4" width="16" height="6" rx="1.5"/><rect x="4" y="14" width="16" height="6" rx="1.5"/><path d="M8 7h.01M8 17h.01M12 7h5M12 17h5"/>',
  ],
  "responsive-design": [
    "26C6DA",
    '<rect x="3" y="5" width="14" height="10" rx="1.5"/><path d="M7 19h6M10 15v4"/><rect x="17" y="9" width="4" height="10" rx="1"/>',
  ],
  "web-security": [
    "EF5350",
    '<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z"/><rect x="9" y="10" width="6" height="5" rx="1"/><path d="M10 10V8.5a2 2 0 014 0V10"/>',
  ],
  "web-performance": [
    "FFC107",
    '<path d="M4 18a8 8 0 1116 0"/><path d="M12 13l5-4M7 18h10"/><circle cx="12" cy="13" r="1.5"/>',
  ],
  seo: [
    "66BB6A",
    '<circle cx="10" cy="10" r="5"/><path d="M14 14l6 6M6 18l4-4 3 2 5-6"/>',
  ],
  tool: [
    "FF8A00",
    '<path d="M14 6a4 4 0 01-5 5L4 16l4 4 5-5a4 4 0 005-5l-3 1-2-2 1-3z"/>',
  ],
};

function pictogramSvg(color, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${body}</svg>\n`;
}

await mkdir(outputDirectory, { recursive: true });

for (const [filename, slug, color] of brandIcons) {
  const url = `https://cdn.jsdelivr.net/npm/simple-icons@${simpleIconsVersion}/icons/${slug}.svg`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Unable to download ${slug}: ${response.status}`);
  }
  const svg = (await response.text())
    .replace("<svg ", `<svg fill="#${color}" `)
    .replace(/<title>.*?<\/title>/s, "");
  await writeFile(path.join(outputDirectory, `${filename}.svg`), `${svg}\n`);
}

for (const [filename, [color, body]] of Object.entries(pictograms)) {
  await writeFile(
    path.join(outputDirectory, `${filename}.svg`),
    pictogramSvg(color, body),
  );
}
```

- [ ] **Step 4: Vendor all 23 SVG files and document provenance**

Run:

```powershell
node scripts/vendor-skill-icons.mjs
```

Expected: 13 pinned Simple Icons SVGs and 10 custom pictogram SVGs exist in `public/icons/skills/`.

Create `public/icons/skills/README.md`:

```markdown
# Skill icons

Brand SVGs are vendored from Simple Icons 16.21.0 by
`scripts/vendor-skill-icons.mjs` and colored using the brand palette recorded in
that script. Simple Icons is CC0-1.0; individual marks remain subject to their
owners' trademark and usage guidelines.

The REST API, CMS, AJAX, DevOps, hosting, responsive design, security,
performance, SEO, and fallback tool pictograms are project-owned SVGs generated
by the same script.

These files are runtime-local. Re-run the script only when intentionally
refreshing the vendored assets, then review every visual and diff before commit.
```

- [ ] **Step 5: Implement the complete registry**

Create `lib/content/skill-icons.ts`:

```ts
export const FALLBACK_SKILL_ICON = "/icons/skills/tool.svg";

const skillIconPaths: Readonly<Record<string, string>> = {
  php: "/icons/skills/php.svg",
  laravel: "/icons/skills/laravel.svg",
  mysql: "/icons/skills/mysql.svg",
  "restful api": "/icons/skills/rest-api.svg",
  cms: "/icons/skills/cms.svg",
  javascript: "/icons/skills/javascript.svg",
  typescript: "/icons/skills/typescript.svg",
  html: "/icons/skills/html5.svg",
  css3: "/icons/skills/css3.svg",
  jquery: "/icons/skills/jquery.svg",
  angularjs: "/icons/skills/angularjs.svg",
  ajax: "/icons/skills/ajax.svg",
  "git / github": "/icons/skills/github.svg",
  linux: "/icons/skills/linux.svg",
  devops: "/icons/skills/devops.svg",
  "web hosting": "/icons/skills/web-hosting.svg",
  "responsive design": "/icons/skills/responsive-design.svg",
  "web security": "/icons/skills/web-security.svg",
  "web performance": "/icons/skills/web-performance.svg",
  seo: "/icons/skills/seo.svg",
  ga4: "/icons/skills/ga4.svg",
  "search console": "/icons/skills/google-search-console.svg",
};

function normalizeSkillName(skill: string): string {
  return skill.trim().toLocaleLowerCase("en-US");
}

export function getSkillIcon(skill: string): string {
  return skillIconPaths[normalizeSkillName(skill)] ?? FALLBACK_SKILL_ICON;
}
```

- [ ] **Step 6: Run the focused test and verify GREEN**

Run:

```powershell
npx vitest run tests/skill-icons.test.ts --config vitest.config.ts
```

Expected: 2 tests pass, all 22 default skills resolve to present local SVGs, and the fallback behavior passes.

- [ ] **Step 7: Commit the registry and asset pipeline**

Run:

```powershell
git add -- scripts/vendor-skill-icons.mjs public/icons/skills lib/content/skill-icons.ts tests/skill-icons.test.ts
git commit -m "feat: add local skill icon registry"
```

---

### Task 2: Render and Style the Grouped Skill Logo Grid

**Files:**
- Modify: `app/components/portfolio/SkillGroups.tsx`
- Modify: `app/globals.css`
- Modify: `tests/rendered-html.test.mjs`
- Modify: `tests/design-contract.test.mjs`

**Interfaces:**
- Consumes: `getSkillIcon(skill: string): string` from Task 1 and unchanged `SkillGroupEntry[]` props.
- Produces: one `.skill-item` with a decorative image and visible `.skill-name` for each CMS skill.
- Produces: stacked `.skill-card` group rows containing responsive `.skill-items` grids.

- [ ] **Step 1: Write the failing rendered-output test**

In `tests/rendered-html.test.mjs`, add:

```js
test("renders every skill as a local icon with its name below", async () => {
  const response = await render("/");
  const html = await response.text();
  const skillItems = html.match(/class="skill-item"/g) ?? [];

  assert.equal(skillItems.length, 22);
  assert.match(html, /src="\/icons\/skills\/php\.svg"/i);
  assert.match(html, /src="\/icons\/skills\/google-search-console\.svg"/i);
  assert.match(html, /class="skill-name"[^>]*>PHP</i);
  assert.match(html, /class="skill-name"[^>]*>Search Console</i);
});
```

In `tests/design-contract.test.mjs`, add:

```js
test("lays out grouped skill logos responsively without motion transforms", () => {
  assert.match(
    css,
    /\.portfolio-site \.skill-card\s*{[^}]*grid-template-columns:[^;}]+/s,
  );
  assert.match(
    css,
    /\.portfolio-site \.skill-items\s*{[^}]*display:\s*grid[^}]*repeat\(auto-fit,/s,
  );
  assert.match(
    css,
    /\.portfolio-site \.skill-item\s*{[^}]*flex-direction:\s*column/s,
  );
  assert.doesNotMatch(
    css,
    /\.portfolio-site \.skill-item:(?:hover|focus-visible)[^{]*{[^}]*transform:/s,
  );
});
```

- [ ] **Step 2: Run the focused integration tests and verify RED**

Run:

```powershell
npm run build
node --test tests/rendered-html.test.mjs tests/design-contract.test.mjs
```

Expected: FAIL because the rendered HTML has no `.skill-item` icon elements and the CSS has no `.skill-items` grid.

- [ ] **Step 3: Render local icons with names below**

Replace `app/components/portfolio/SkillGroups.tsx` with:

```tsx
import Image from "next/image";
import type {
  Language,
  SkillGroupEntry,
} from "../../../lib/content/types";
import { localize } from "../../../lib/content/i18n";
import { getSkillIcon } from "../../../lib/content/skill-icons";

export function SkillGroups({
  groups,
  language,
  eyebrow,
  title,
}: {
  groups: SkillGroupEntry[];
  language: Language;
  eyebrow: string;
  title: string;
}) {
  return (
    <section className="section skills-section" id="skills">
      <div className="section-heading">
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      <div className="skills-grid">
        {groups.map((group, index) => (
          <article className="skill-card" key={group.id} data-reveal>
            <p className="skill-index">{String(index + 1).padStart(2, "0")}</p>
            <h3>{localize(group.name, language)}</h3>
            <ul className="skill-items">
              {group.skills.map((skill) => (
                <li className="skill-item" key={skill}>
                  <span className="skill-icon-frame" aria-hidden="true">
                    <Image
                      className="skill-icon"
                      src={getSkillIcon(skill)}
                      alt=""
                      width={48}
                      height={48}
                      unoptimized
                    />
                  </span>
                  <span className="skill-name">{skill}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Replace the skill card CSS with the grouped logo layout**

Replace the current `.skills-grid` through `.skill-card li` rules in `app/globals.css` with:

```css
.portfolio-site .skills-grid {
  margin-top: clamp(3.5rem, 6vw, 5.5rem);
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  border-top: 1px solid var(--public-line);
}

.portfolio-site .skill-card {
  min-width: 0;
  display: grid;
  grid-template-columns: 3rem minmax(10rem, 0.3fr) minmax(0, 1fr);
  gap: clamp(1rem, 2vw, 2rem);
  align-items: start;
  padding: clamp(1.25rem, 2.5vw, 2rem) 0;
  border-bottom: 1px solid var(--public-line);
}

.portfolio-site .skill-card:hover,
.portfolio-site .skill-card:focus-within {
  border-color: rgb(255 138 0 / 40%);
}

.portfolio-site .skill-index {
  margin: 0;
  padding-top: 0.35rem;
  color: var(--accent);
  font: 700 0.68rem/1 "Inter", "Prompt", sans-serif;
}

.portfolio-site .skill-card h3 {
  min-height: 0;
  margin: 0;
  padding-top: 0.15rem;
  overflow-wrap: anywhere;
  font-size: 1.12rem;
  font-weight: 650;
  letter-spacing: -0.025em;
}

.portfolio-site .skill-items {
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(5.75rem, 1fr));
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.portfolio-site .skill-item {
  min-width: 0;
  min-height: 7.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.72rem;
  padding: 0.9rem 0.55rem;
  border: 1px solid var(--public-line);
  border-radius: 0.75rem;
  background: rgb(255 255 255 / 1.5%);
  text-align: center;
  transition:
    border-color 180ms ease,
    background 180ms ease;
}

.portfolio-site .skill-item:hover,
.portfolio-site .skill-item:focus-within {
  border-color: rgb(255 138 0 / 48%);
  background: rgb(255 138 0 / 5%);
}

.portfolio-site .skill-icon-frame {
  width: 3rem;
  height: 3rem;
  display: grid;
  place-items: center;
}

.portfolio-site .skill-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.portfolio-site .skill-name {
  max-width: 100%;
  color: var(--text-secondary);
  font: 600 0.7rem/1.35 "Inter", "Prompt", sans-serif;
  overflow-wrap: anywhere;
}
```

In the existing tablet media query, replace the old three-column `.skills-grid` rule with:

```css
.portfolio-site .skill-card {
  grid-template-columns: 2.5rem minmax(8rem, 0.28fr) minmax(0, 1fr);
  gap: 1rem;
}

.portfolio-site .skill-items {
  grid-template-columns: repeat(auto-fit, minmax(5.4rem, 1fr));
}
```

In the existing phone media query, replace the old single-column skill rules with:

```css
.portfolio-site .skill-card {
  grid-template-columns: 2rem minmax(0, 1fr);
  gap: 0.75rem;
  padding: 1.25rem 0;
}

.portfolio-site .skill-card h3 {
  padding-top: 0;
}

.portfolio-site .skill-items {
  grid-column: 1 / -1;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
}

.portfolio-site .skill-item {
  min-height: 6.8rem;
  padding: 0.8rem 0.45rem;
}

.portfolio-site .skill-icon-frame {
  width: 2.625rem;
  height: 2.625rem;
}
```

Delete the obsolete reduced-motion selectors for `.skill-card:hover .skill-index` and `.skill-card:focus-within .skill-index`, because the new design does not transform the group number.

- [ ] **Step 5: Run focused integration tests and verify GREEN**

Run:

```powershell
npm run build
node --test tests/rendered-html.test.mjs tests/design-contract.test.mjs
```

Expected: all focused tests pass, including 22 icon items and the responsive grid contract.

- [ ] **Step 6: Run complete automated verification**

Run:

```powershell
npm run test:unit
npm test
npm run lint
npx tsc --noEmit
```

Expected: every command exits with code 0.

- [ ] **Step 7: Perform desktop and mobile visual QA**

Start the site:

```powershell
npm run dev
```

Use the in-app browser to inspect `http://localhost:3000/#skills` at a desktop viewport near 1440 by 900 and a mobile viewport near 390 by 844. Confirm:

- all five group headings remain visible;
- all 22 full-color icons load from `/icons/skills/`;
- every name is centered below its icon;
- long names wrap without overlap;
- the phone layout uses two columns and has no horizontal scrolling;
- keyboard focus and reduced-motion mode introduce no transforms.

Stop the development server after inspection.

- [ ] **Step 8: Review the final diff and commit**

Run:

```powershell
git diff --check
git status --short
git diff -- app/components/portfolio/SkillGroups.tsx app/globals.css tests/rendered-html.test.mjs tests/design-contract.test.mjs
```

Expected: only the four Task 2 files are uncommitted, with no whitespace errors.

Commit:

```powershell
git add -- app/components/portfolio/SkillGroups.tsx app/globals.css tests/rendered-html.test.mjs tests/design-contract.test.mjs
git commit -m "feat: render skills as grouped logo grid"
```
