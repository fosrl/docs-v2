#!/usr/bin/env node
/**
 * One-off script: add PangolinCloudTocCta import and usage to every MDX file.
 * Run from repo root: node scripts/add-toc-cta-snippet.js
 */

const fs = require("fs");
const path = require("path");

const BLOCK = `import PangolinCloudTocCta from "/snippets/pangolin-cloud-toc-cta.mdx";

<PangolinCloudTocCta />

`;

function findMdxFiles(dir, list = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) findMdxFiles(full, list);
    else if (e.name.endsWith(".mdx")) list.push(full);
  }
  return list;
}

function addSnippet(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  if (content.includes("pangolin-cloud-toc-cta.mdx")) return false; // already added
  const close = content.indexOf("\n---", 3);
  if (close === -1) return false;
  const insertAt = close + 4; // after "\n---"
  content = content.slice(0, insertAt) + BLOCK + content.slice(insertAt);
  fs.writeFileSync(filePath, content);
  return true;
}

const root = path.resolve(__dirname, "..");
const files = findMdxFiles(root).filter(
  (f) => !f.includes("snippets" + path.sep)
);
let added = 0;
for (const f of files) {
  if (addSnippet(f)) added++;
}
console.log(`Added snippet to ${added} of ${files.length} MDX files.`);
