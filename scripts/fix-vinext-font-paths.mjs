import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const outputRoot = path.resolve("dist", "server");
const projectRoot = process.cwd().replaceAll("\\", "/");
const localFontPrefix = `${projectRoot}/.vinext/fonts/`;
const servedFontPrefix = "/assets/_vinext_fonts/";
const textExtensions = new Set([".cjs", ".css", ".html", ".js", ".mjs"]);

async function collectTextFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectTextFiles(entryPath)));
    } else if (textExtensions.has(path.extname(entry.name))) {
      files.push(entryPath);
    }
  }

  return files;
}

const files = await collectTextFiles(outputRoot);
let rewrittenFiles = 0;
let servedReferenceFound = false;

for (const file of files) {
  const source = await readFile(file, "utf8");
  const rewritten = source.replaceAll(localFontPrefix, servedFontPrefix);

  if (rewritten.includes(".vinext/fonts/")) {
    throw new Error(`Local Vinext font path remains in ${file}`);
  }

  if (rewritten.includes(servedFontPrefix)) {
    servedReferenceFound = true;
  }

  if (rewritten !== source) {
    await writeFile(file, rewritten, "utf8");
    rewrittenFiles += 1;
  }
}

if (!servedReferenceFound) {
  throw new Error("No deployable Vinext font references were found in dist/server");
}

console.log(`Verified deployable font URLs (${rewrittenFiles} file(s) rewritten).`);
