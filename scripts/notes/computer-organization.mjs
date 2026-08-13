import { copyFile, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderMarkdown, rewriteMarkdownImages, escapeHtml } from "./render-markdown.mjs";
import { notesShell } from "./site-shell.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const sourceRoot = path.join(projectRoot, "notes", "CS+755cf848-063d-44c", "CS+755cf848-063d-44cd-8126-c4ead1ceeebf");
const outputRoot = path.join(projectRoot, "notes", "computer-organization");

export const computerOrganizationChapters = [
  { number: 2, slug: "data-representation-and-operations", title: "Data Representation and Operations", chineseTitle: "数据的表示和运算", sourcePrefix: "第二章+", sections: [["2.1", "数制与编码"], ["2.2", "运算方法和运算电路"], ["2.3", "浮点数的表示和运算"]] },
  { number: 3, slug: "memory-systems", title: "Memory Systems", chineseTitle: "存储系统", sourcePrefix: "第三章+", sections: [["3.1", "存储系统概述"], ["3.2", "主存储器"], ["3.4", "外部存储器"], ["3.5", "高速缓冲存储器"]] },
  { number: 4, slug: "instruction-set", title: "Instruction Set", chineseTitle: "指令系统", sourcePrefix: "第四章+", sections: [["4.1", "指令系统"], ["4.2", "指令的寻址方式"], ["4.3", "程序的机器级代码表示"], ["4.4", "CISC和RISC"]] },
  { number: 5, slug: "central-processing-unit", title: "Central Processing Unit", chineseTitle: "中央处理器", sourcePrefix: "第五章+", sections: [["5.1", "CPU的功能和基本结构"], ["5.2", "指令执行过程"], ["5.3", "数据通路的功能和基本功能"], ["5.4", "控制器的功能和工作原理"], ["5.5", "异常和中断机制"], ["5.6", "指令流水线"]] },
  { number: 6, slug: "buses", title: "Buses", chineseTitle: "总线", sourcePrefix: "第六章+", sections: [["6.1", "总线概述"], ["6.2", "总线事务和定时"]] },
  { number: 7, slug: "input-output-systems", title: "Input / Output Systems", chineseTitle: "输入／输出系统", sourcePrefix: "第七章+", sections: [["7.2", "I/O接口"], ["7.3", "I/O方式"]] },
];

export async function chapterSourcePath(chapter) {
  const matches = (await readdir(sourceRoot, { withFileTypes: true })).filter((entry) => entry.isFile() && entry.name.startsWith(chapter.sourcePrefix) && entry.name.endsWith(".md"));
  if (matches.length !== 1) throw new Error(`${chapter.slug}: expected one source Markdown file, found ${matches.length}`);
  return path.join(sourceRoot, matches[0].name);
}

const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const sectionPattern = /^\s*(\d+\.\d+)\s+(.+?)\s*$/;

function prepareMarkdown(source, chapter) {
  const declared = new Map(chapter.sections);
  return source.split("\n").map((line) => {
    const match = line.match(sectionPattern);
    if (!match || !declared.has(match[1])) return line;
    return `### ${match[1]} ${declared.get(match[1])}`;
  }).join("\n");
}

async function copyChapterAssets(chapter, sourceFile) {
  const sourceDirectory = sourceFile.slice(0, -3);
  const destination = path.join(outputRoot, "assets", chapter.slug);
  await mkdir(destination, { recursive: true });
  const mappings = new Map();
  const entries = await readdir(sourceDirectory, { withFileTypes: true });
  const images = entries.filter((entry) => entry.isFile() && /\.png$/i.test(entry.name)).sort((a, b) => a.name.localeCompare(b.name, "en", { numeric: true }));
  for (const [index, entry] of images.entries()) {
    const name = `${String(index + 1).padStart(2, "0")}-${slugify(path.basename(entry.name, ".png")) || "image"}.png`;
    const source = path.join(sourceDirectory, entry.name);
    await copyFile(source, path.join(destination, name));
    mappings.set(path.resolve(source), `/notes/computer-organization/assets/${chapter.slug}/${name}`);
  }
  return mappings;
}

function headings(markdown) {
  const used = new Set();
  return [...markdown.matchAll(/^#{2,4}\s+(.+)$/gm)].map((match, index) => {
    const text = match[1].replace(/[*_`]/g, "").trim();
    const base = slugify(text) || `section-${index + 1}`;
    let id = base; let suffix = 2;
    while (used.has(id)) id = `${base}-${suffix++}`;
    used.add(id); return { text, id };
  });
}

function addHeadingIds(html, items) {
  let index = 0;
  return html.replace(/<h([2-4])>(.*?)<\/h\1>/g, (full, level, text) => `<h${level} id="${items[index++]?.id ?? slugify(text)}">${text}</h${level}>`);
}

function toc(items) {
  return `<nav class="notes-toc" aria-label="On this page"><p>ON THIS PAGE</p><ol>${items.map(({ text, id }) => `<li><a href="#${id}">${escapeHtml(text)}</a></li>`).join("")}</ol></nav>`;
}

function chapterPage(chapter, body, items) {
  const content = `<header class="notes-hero"><p class="collection-page-index">${String(chapter.number).padStart(2, "0")} / COMPUTER ORGANIZATION</p><h1>${escapeHtml(chapter.title)}</h1><p>${escapeHtml(chapter.chineseTitle)} · structured course notes.</p></header><div class="notes-layout">${toc(items)}<article class="markdown-body">${body}</article></div>`;
  return notesShell({ title: `${chapter.title} — Computer Organization`, description: `${chapter.title} notes by Vangie.`, content });
}

export async function buildComputerOrganization() {
  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(outputRoot, { recursive: true });
  const built = [];
  for (const chapter of computerOrganizationChapters) {
    const sourceFile = await chapterSourcePath(chapter);
    const mappings = await copyChapterAssets(chapter, sourceFile);
    const markdown = prepareMarkdown(await readFile(sourceFile, "utf8"), chapter);
    const rewritten = rewriteMarkdownImages(markdown, mappings, sourceRoot);
    const items = headings(rewritten);
    const body = addHeadingIds(renderMarkdown(rewritten), items);
    const destination = path.join(outputRoot, chapter.slug);
    await mkdir(destination, { recursive: true });
    await writeFile(path.join(destination, "index.html"), chapterPage(chapter, body, items), "utf8");
    built.push({ ...chapter, sections: items.length });
  }
  const rows = built.map((chapter) => `<a class="notes-chapter" href="/notes/computer-organization/${chapter.slug}/"><span class="notes-number">${String(chapter.number).padStart(2, "0")}</span><span><b>${escapeHtml(chapter.title)}</b><small>${escapeHtml(chapter.chineseTitle)} · ${chapter.sections} sections</small></span><span class="notes-arrow" aria-hidden="true">→</span></a>`).join("");
  const content = `<header class="notes-hero"><p class="collection-page-index">02 / NOTES / COMPUTER ORGANIZATION</p><h1>Computer Organization</h1><p>A structured set of notes on data, memory, instructions, processors, buses, and I/O.</p><div class="notes-stats"><span><b>${built.length}</b> chapters</span><span><b>${built.reduce((sum, chapter) => sum + chapter.sections, 0)}</b> sections</span><span><b>Markdown</b> source</span></div></header><section class="notes-chapters" aria-label="Computer Organization chapters"><p class="notes-kicker">CHAPTERS</p>${rows}</section>`;
  await writeFile(path.join(outputRoot, "index.html"), notesShell({ title: "Computer Organization", description: "Computer Organization notes by Vangie.", content }), "utf8");
  console.log(`Built ${built.length} Computer Organization articles at notes/computer-organization/`);
}
