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
