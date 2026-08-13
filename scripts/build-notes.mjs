import { copyFile, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import katex from "katex";
import { copyKatexAssets as copySharedKatexAssets, renderMarkdown } from "./notes/render-markdown.mjs";
import { notesShell } from "./notes/site-shell.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceBook = path.join(root, "notes", "OS+7dcefccb-df9f-49d", "OS+7dcefccb-df9f-49d7-970b-0c30f28a9df2");
const outputRoot = path.join(root, "notes", "operating-systems");
const katexSource = path.join(root, "node_modules", "katex", "dist");
const katexDestination = path.join(root, "assets", "vendor", "katex");

const chapters = [
  ["introduction", "第一章", "Introduction", "引论"],
  ["process-management", "第二章", "Process Management", "处理机管理"],
  ["synchronization-and-deadlocks", "第三章", "Synchronization & Deadlocks", "同步通信及死锁管理"],
  ["memory-management", "第四章", "Memory Management", "存储管理"],
  ["device-management", "第五章", "Device Management", "设备管理"],
  ["file-management", "第六章", "File Management", "文件管理"],
  ["evolution", "第七章", "Evolution of Operating Systems", "操作系统发展与演化"],
].map(([slug, marker, title, chineseTitle], index) => ({ index: index + 1, slug, marker, title, chineseTitle }));

const escapeHtml = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function chapterEntry(chapter, wantDirectory = false) {
  const entries = await readdir(sourceBook, { withFileTypes: true });
  const entry = entries.find(({ name }) => name.startsWith(`${chapter.marker}+`) && (wantDirectory ? !name.endsWith(".md") : name.endsWith(".md")));
  if (!entry) throw new Error(`Missing source ${wantDirectory ? "directory" : "file"} for ${chapter.title}`);
  return path.join(sourceBook, entry.name);
}

async function collectFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(full));
    else files.push(full);
  }
  return files;
}

function shell({ title, content }) {
  return notesShell({ title, description: "Operating systems notes by Vangie.", content });
}

function renderMath(markdown) {
  const tokens = [];
  const stash = (tex, displayMode) => {
    const token = `MATHTOKEN${tokens.length}END`;
    const normalizedTex = tex.trim().replace(/\b(DIV|MOD|INT)\b/g, "\\operatorname{$1}");
    tokens.push({ token, html: katex.renderToString(normalizedTex, { displayMode, throwOnError: false, trust: false, strict: false }) });
    return token;
  };
  const lines = markdown.split("\n");
  let fenced = false;
  const transformed = lines.map((line) => {
    if (/^\s*(```|~~~)/.test(line)) { fenced = !fenced; return line; }
    if (fenced) return line;
    const display = line.match(/^\s*\$\$?(.+?)\$\$?\s*$/);
    if (display) return stash(display[1], true);
    return line.replace(/(?<!\\)\$(?!\$)([^$\n]+?)(?<!\\)\$(?!\$)/g, (_, tex) => stash(tex, false));
  }).join("\n");
  return { markdown: transformed, tokens };
}

function restoreMath(html, tokens) {
  return tokens.reduce((result, { token, html: rendered }) => result.replaceAll(token, `<span class="math-${rendered.includes("katex-display") ? "display" : "inline"}">${rendered}</span>`), html);
}

async function copyKatexAssets() {
  await mkdir(path.join(katexDestination, "fonts"), { recursive: true });
  await copyFile(path.join(katexSource, "katex.min.css"), path.join(katexDestination, "katex.min.css"));
  for (const file of await readdir(path.join(katexSource, "fonts"))) {
    if (file.endsWith(".woff2")) await copyFile(path.join(katexSource, "fonts", file), path.join(katexDestination, "fonts", file));
  }
}

function headings(markdown) {
  const used = new Set();
  return [...markdown.matchAll(/^#{2,4}\s+(.+)$/gm)].map((match, index) => {
    const text = match[1].replace(/[*_`]/g, "").trim();
    const base = slugify(text) || `section-${index + 1}`;
    let id = base;
    let suffix = 2;
    while (used.has(id)) id = `${base}-${suffix++}`;
    used.add(id);
    return { text, id };
  });
}

function toc(items) {
  return items.length ? `<nav class="notes-toc" aria-label="On this page"><p>ON THIS PAGE</p><ol>${items.map(({ text, id }) => `<li><a href="#${id}">${escapeHtml(text)}</a></li>`).join("")}</ol></nav>` : "";
}

async function copyAssets(sourceDir, chapter) {
  const destination = path.join(outputRoot, "assets", chapter.slug);
  await mkdir(destination, { recursive: true });
  const mappings = new Map();
  const attachments = [];
  let serial = 0;
  for (const source of await collectFiles(sourceDir)) {
    const extension = path.extname(source).toLowerCase();
    if (![".png", ".jpg", ".jpeg", ".webp", ".csv", ".pdf"].includes(extension)) continue;
    const name = `${String(++serial).padStart(2, "0")}-${slugify(path.basename(source, extension)) || "attachment"}${extension}`;
    await copyFile(source, path.join(destination, name));
    mappings.set(path.resolve(source), `/notes/operating-systems/assets/${chapter.slug}/${name}`);
    if ([".csv", ".pdf"].includes(extension)) attachments.push({ name: path.basename(source), href: mappings.get(path.resolve(source)), type: extension.slice(1).toUpperCase() });
  }
  return { mappings, attachments };
}

function rewriteImages(markdown, mappings) {
  return markdown.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (full, alt, relative) => {
    const resolved = path.resolve(sourceBook, relative.split(/[?#]/, 1)[0].replaceAll("%20", " "));
    return mappings.has(resolved) ? `![${alt}](${mappings.get(resolved)})` : full;
  });
}

function normalizeExportIndentation(markdown) {
  return markdown.split("\n").map((line) => {
    const match = line.match(/^( +)(.*)$/);
    if (!match) return line;
    const [, indentation, content] = match;
    if (!content) return "";

    // Notion exports every block with four-space indentation. Keep one
    // indentation level for nested lists, but don't let prose become code.
    if (/^(?:[-*+]\s+|\d+[.)]\s+)/.test(content)) {
      // Exported indentation describes the source tree rather than Markdown
      // list nesting. Flatten it here so list items are parsed as lists.
      return content;
    }
    return content;
  }).join("\n");
}

function addHeadingIds(html, items) {
  let index = 0;
  return html.replace(/<h([2-4])>(.*?)<\/h\1>/g, (full, level, text) => `<h${level} id="${items[index++]?.id ?? slugify(text) ?? "section"}">${text}</h${level}>`);
}

async function buildChapter(chapter) {
  const sourceFile = await chapterEntry(chapter);
  const sourceDir = await chapterEntry(chapter, true);
  const markdown = normalizeExportIndentation(await readFile(sourceFile, "utf8"));
  const { mappings, attachments } = await copyAssets(sourceDir, chapter);
  const rewritten = rewriteImages(markdown, mappings);
  const items = headings(rewritten);
  const body = addHeadingIds(renderMarkdown(rewritten), items);
  const materials = attachments.length ? `<section class="notes-materials"><p class="notes-kicker">MATERIALS</p><div>${attachments.map(({ name, href, type }) => `<a href="${href}" target="_blank" rel="noreferrer"><span>${type}</span>${escapeHtml(name)}</a>`).join("")}</div></section>` : "";
  const content = `<header class="notes-hero"><p class="collection-page-index">${String(chapter.index).padStart(2, "0")} / OPERATING SYSTEMS</p><h1>${escapeHtml(chapter.title)}</h1><p>${escapeHtml(chapter.chineseTitle)} · structured course notes, definitions, algorithms, and review questions.</p></header><div class="notes-layout">${toc(items)}<article class="markdown-body">${body}</article></div>${materials}`;
  await mkdir(path.join(outputRoot, chapter.slug), { recursive: true });
  await writeFile(path.join(outputRoot, chapter.slug, "index.html"), shell({ title: chapter.title, content }), "utf8");
  return { ...chapter, sections: items.length };
}

async function buildIndex(results) {
  const rows = results.map((chapter) => `<a class="notes-chapter" href="/notes/operating-systems/${chapter.slug}/"><span class="notes-number">${String(chapter.index).padStart(2, "0")}</span><span><b>${escapeHtml(chapter.title)}</b><small>${escapeHtml(chapter.chineseTitle)} · ${chapter.sections} sections</small></span><span class="notes-arrow" aria-hidden="true">→</span></a>`).join("");
  const content = `<header class="notes-hero"><p class="collection-page-index">02 / NOTES / OPERATING SYSTEMS</p><h1>Operating Systems</h1><p>A structured set of notes on processes, memory, devices, files, and the systems that hold them together.</p><div class="notes-stats"><span><b>${results.length}</b> chapters</span><span><b>${results.reduce((sum, chapter) => sum + chapter.sections, 0)}</b> sections</span><span><b>Markdown</b> source</span></div></header><section class="notes-chapters" aria-label="Operating systems chapters"><p class="notes-kicker">CHAPTERS</p>${rows}</section>`;
  await writeFile(path.join(outputRoot, "index.html"), shell({ title: "Operating Systems", content }), "utf8");
}

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });
await copySharedKatexAssets(root);
const results = [];
for (const chapter of chapters) results.push(await buildChapter(chapter));
await buildIndex(results);
console.log(`Built ${results.length} operating systems chapters at notes/operating-systems/`);
