import { copyFile, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderMarkdown, rewriteMarkdownImages, escapeHtml } from "./render-markdown.mjs";
import { notesShell } from "./site-shell.mjs";
import { computerOrganizationChapters } from "./computer-organization-manifests.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const sourceRoot = path.join(projectRoot, "notes", "CS+755cf848-063d-44c", "CS+755cf848-063d-44cd-8126-c4ead1ceeebf");

export async function chapterSourcePath(chapter) {
  const matches = (await readdir(sourceRoot, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.startsWith(chapter.sourcePrefix) && entry.name.endsWith(".md"));
  if (matches.length !== 1) throw new Error(`${chapter.slug}: expected one source Markdown file, found ${matches.length}`);
  return path.join(sourceRoot, matches[0].name);
}

export function validateManifest(chapter, source) {
  const lines = source.split("\n");
  const meaningfulLines = new Set(lines.flatMap((line, index) => line.trim() ? [index + 1] : []));
  const coveredLines = new Set();
  const ids = new Set();
  const visit = (node) => {
    if (!node.id || ids.has(node.id)) throw new Error(`${chapter.slug}: duplicate node id ${node.id}`);
    ids.add(node.id);
    const hasStart = Number.isInteger(node.startLine);
    const hasEnd = Number.isInteger(node.endLine);
    if (hasStart !== hasEnd) throw new Error(`${chapter.slug}/${node.id}: both startLine and endLine are required`);
    if (hasStart) {
      if (node.startLine < 1 || node.endLine < node.startLine || node.endLine > lines.length) throw new Error(`${chapter.slug}/${node.id}: invalid range ${node.startLine}-${node.endLine}`);
      for (let line = node.startLine; line <= node.endLine; line += 1) {
        if (!meaningfulLines.has(line)) continue;
        if (coveredLines.has(line)) throw new Error(`${chapter.slug}/${node.id}: overlap at line ${line}`);
        coveredLines.add(line);
      }
    }
    for (const child of node.children ?? []) visit(child);
  };
  for (const node of chapter.nodes ?? []) visit(node);
  for (const line of meaningfulLines) if (!coveredLines.has(line)) throw new Error(`${chapter.slug}: uncovered content at line ${line}`);
  return { coveredLines, meaningfulLines };
}

export async function loadChapter(chapter) {
  const file = await chapterSourcePath(chapter);
  const source = await readFile(file, "utf8");
  validateManifest(chapter, source);
  return { file, source };
}

const outputRoot = path.join(projectRoot, "notes", "computer-organization");
const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function copyChapterAssets(chapter, sourceFile) {
  const sourceDirectory = sourceFile.slice(0, -3);
  const destination = path.join(outputRoot, "assets", chapter.slug);
  await mkdir(destination, { recursive: true });
  const mappings = new Map();
  const entries = await readdir(sourceDirectory, { withFileTypes: true });
  const images = entries.filter((entry) => entry.isFile() && /\.(png|jpe?g|webp)$/i.test(entry.name)).sort((a, b) => a.name.localeCompare(b.name, "en", { numeric: true }));
  for (const [index, entry] of images.entries()) {
    const extension = path.extname(entry.name).toLowerCase();
    const name = `${String(index + 1).padStart(2, "0")}-${slugify(path.basename(entry.name, extension)) || "image"}${extension}`;
    const source = path.join(sourceDirectory, entry.name);
    const href = `/notes/computer-organization/assets/${chapter.slug}/${name}`;
    await copyFile(source, path.join(destination, name));
    mappings.set(path.resolve(source), href);
  }
  return mappings;
}

function nodeData(node, lines, mappings) {
  const markdown = Number.isInteger(node.startLine) ? lines.slice(node.startLine - 1, node.endLine).join("\n") : "";
  const rewritten = rewriteMarkdownImages(markdown, mappings, sourceRoot);
  const tags = [];
  if (/\$[^$]+\$/.test(markdown)) tags.push("FORMULA");
  if (/!\[[^\]]*\]\([^)]+\)/.test(markdown)) tags.push("IMAGE");
  return {
    id: node.id,
    title: node.title,
    hasDetail: Boolean(markdown.trim()),
    detailHtml: markdown.trim() ? renderMarkdown(rewritten) : "",
    tags,
    children: (node.children ?? []).map((child) => nodeData(child, lines, mappings)),
  };
}

function chapterPage(chapter, tree) {
  const fallback = tree.children.map((node) => `<button class="mind-map-node mind-map-node--section" type="button" data-node-id="${node.id}" aria-expanded="false">${escapeHtml(node.title)}</button>`).join("");
  const data = JSON.stringify(tree).replaceAll("<", "\\u003c");
  const content = `<header class="notes-hero mind-map-hero"><p class="collection-page-index">${String(chapter.number).padStart(2, "0")} / COMPUTER ORGANIZATION</p><h1>${escapeHtml(chapter.title)}</h1><p>Explore the chapter as an expandable mind map.</p></header><section class="mind-map" aria-label="${escapeHtml(chapter.title)} mind map"><div class="mind-map-toolbar" aria-label="Mind map controls"><button type="button" aria-label="Zoom out">−</button><button type="button" aria-label="Zoom in">+</button><button type="button" aria-label="Reset mind map">Reset</button><button type="button" aria-label="Collapse all branches">Collapse all</button></div><div class="mind-map-viewport" tabindex="0"><svg class="mind-map-connectors" aria-hidden="true"></svg><div class="mind-map-world"><div class="mind-map-nodes"><button class="mind-map-node mind-map-node--root" type="button" data-node-id="root" aria-expanded="true">${escapeHtml(chapter.title)}</button>${fallback}</div></div><p class="mind-map-fallback">Interactive expansion requires JavaScript.</p></div><script type="application/json" id="mind-map-data">${data}</script></section>`;
  return notesShell({ title: `${chapter.title} — Computer Organization`, description: `${chapter.title} mind map by Vangie.`, content, bodyClass: "notes-site mind-map-page", scripts: ["/assets/js/mind-map.js"] });
}

export async function buildComputerOrganization() {
  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(outputRoot, { recursive: true });
  const built = [];
  for (const chapter of computerOrganizationChapters) {
    const { file, source } = await loadChapter(chapter);
    const mappings = await copyChapterAssets(chapter, file);
    const lines = source.split("\n");
    const tree = { id: "root", title: chapter.title, hasDetail: false, detailHtml: "", tags: [], children: chapter.nodes.map((node) => nodeData(node, lines, mappings)) };
    const destination = path.join(outputRoot, chapter.slug);
    await mkdir(destination, { recursive: true });
    await writeFile(path.join(destination, "index.html"), chapterPage(chapter, tree), "utf8");
    built.push(chapter);
  }
  const rows = built.map((chapter) => `<a class="notes-chapter" href="/notes/computer-organization/${chapter.slug}/"><span class="notes-number">${String(chapter.number).padStart(2, "0")}</span><span><b>${escapeHtml(chapter.title)}</b><small>Interactive mind map</small></span><span class="notes-arrow" aria-hidden="true">→</span></a>`).join("");
  const content = `<header class="notes-hero"><p class="collection-page-index">02 / NOTES / COMPUTER ORGANIZATION</p><h1>Computer Organization</h1><p>Six chapters presented as progressively expandable mind maps.</p></header><section class="notes-chapters" aria-label="Computer Organization chapters"><p class="notes-kicker">CHAPTERS</p>${rows}</section>`;
  await writeFile(path.join(outputRoot, "index.html"), notesShell({ title: "Computer Organization", description: "Computer Organization notes by Vangie.", content }), "utf8");
  console.log(`Built ${built.length} Computer Organization mind maps at notes/computer-organization/`);
}
