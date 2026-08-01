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
