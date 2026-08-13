import { copyFile, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceBook = path.join(root, "notes", "OS+7dcefccb-df9f-49d", "OS+7dcefccb-df9f-49d7-970b-0c30f28a9df2");
const outputRoot = path.join(root, "notes", "operating-systems");

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
  const nav = [["01", "Blog", "/blog/"], ["02", "Notes", "/notes/"], ["03", "Research", "/research/"]]
    .map(([number, label, href]) => `<a href="${href}"${label === "Notes" ? ' aria-current="page"' : ""}><span class="nav-index">${number}</span>${label}</a>`).join("");
  return `<!doctype html><html lang="en" data-theme="dark"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${escapeHtml(title)} — Vangie</title><meta name="description" content="Operating systems notes by Vangie."><script>try{const s=localStorage.getItem('vangie-theme');const l=matchMedia('(prefers-color-scheme: light)').matches;document.documentElement.dataset.theme=s==='dark'||s==='light'?s:l?'light':'dark'}catch(_){}</script><link rel="stylesheet" href="/assets/css/site.css"><script type="module" src="/assets/js/theme.js"></script></head><body class="collection-page collection-page--notes notes-site"><header class="site-header"><div class="header-inner wrap wrap--wide"><a class="brand" href="/" aria-label="Vangie home"><span class="brand-mark" aria-hidden="true"></span><span>Vangie</span></a><nav class="site-nav" aria-label="Primary">${nav}</nav><button class="theme-toggle" type="button" aria-label="Switch to light theme" title="Switch to light theme"><span class="theme-icon theme-icon--sun" aria-hidden="true">☼</span><span class="theme-icon theme-icon--moon" aria-hidden="true">◐</span></button></div></header><main class="site-main notes-main wrap page-enter">${content}</main><footer class="site-footer"><div class="footer-inner wrap"><p>© 2026 Vangie</p></div></footer></body></html>`;
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

function addHeadingIds(html, items) {
  let index = 0;
  return html.replace(/<h([2-4])>(.*?)<\/h\1>/g, (full, level, text) => `<h${level} id="${items[index++]?.id ?? slugify(text) ?? "section"}">${text}</h${level}>`);
}

async function buildChapter(chapter) {
  const sourceFile = await chapterEntry(chapter);
  const sourceDir = await chapterEntry(chapter, true);
  const markdown = (await readFile(sourceFile, "utf8")).replace(/^ {4}/gm, "");
  const { mappings, attachments } = await copyAssets(sourceDir, chapter);
  const rewritten = rewriteImages(markdown, mappings);
  const items = headings(rewritten);
  const body = addHeadingIds(marked.parse(rewritten), items);
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
const results = [];
for (const chapter of chapters) results.push(await buildChapter(chapter));
await buildIndex(results);
console.log(`Built ${results.length} operating systems chapters at notes/operating-systems/`);
