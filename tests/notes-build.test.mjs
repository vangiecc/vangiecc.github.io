import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeExportIndentation, renderMarkdown } from "../scripts/notes/render-markdown.mjs";
import { chapterSourcePath, computerOrganizationChapters } from "../scripts/notes/computer-organization.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFile(path.join(root, file), "utf8");
async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full)); else files.push(full);
  }
  return files;
}

test("Operating Systems output retains routes, formatting, formulas, and assets", async () => {
  const archive = await read("notes/operating-systems/index.html");
  assert.match(archive, /<b>7<\/b> chapters/);
  for (const slug of ["introduction", "process-management", "synchronization-and-deadlocks", "memory-management", "device-management", "file-management", "evolution"]) assert.match(await read(`notes/operating-systems/${slug}/index.html`), /class="markdown-body"/);
  const fileChapter = await read("notes/operating-systems/file-management/index.html");
  assert.match(fileChapter, /为使链接父目录D5/);
  assert.match(fileChapter, /<strong>优点：<\/strong>/);
  assert.match(fileChapter, /class="math-display"/);
  assert.match(fileChapter, /operatorname\{DIV\}/);
  assert.doesNotMatch(fileChapter, /<pre><code>\s*为使链接父目录D5/);
  const assets = await walk(path.join(root, "notes", "operating-systems", "assets"));
  assert.equal(assets.filter((file) => file.endsWith(".png")).length, 85);
  assert.equal(assets.filter((file) => file.endsWith(".csv")).length, 6);
  assert.equal(assets.filter((file) => file.endsWith(".pdf")).length, 2);
  assert.ok((await stat(path.join(root, "assets/vendor/katex/katex.min.css"))).size > 1000);
});

test("shared renderer normalizes Notion indentation and renders display math", () => {
  const html = renderMarkdown("    prose\n\n    $x_1\\times 2$");
  assert.equal(normalizeExportIndentation("    prose\n\n    $x$").startsWith("prose"), true);
  assert.match(html, /<p>prose<\/p>/);
  assert.match(html, /class="math-display"/);
});

test("six Computer Organization sources are available", async () => {
  assert.deepEqual(computerOrganizationChapters.map(({ number }) => number), [2, 3, 4, 5, 6, 7]);
  for (const chapter of computerOrganizationChapters) assert.ok((await stat(await chapterSourcePath(chapter))).size > 0);
});

test("Computer Organization builds six article chapters", async () => {
  const index = await read("notes/computer-organization/index.html");
  assert.match(index, /Computer Organization/);
  assert.equal((index.match(/class="notes-chapter"/g) ?? []).length, 6);
  assert.doesNotMatch(index, /计组大题细节注意/);
  const chapter = await read("notes/computer-organization/central-processing-unit/index.html");
  assert.match(chapter, /class="notes-layout"/);
  assert.match(chapter, /class="notes-toc"/);
  assert.match(chapter, /class="markdown-body"/);
  assert.match(chapter, /<h3 id="5-1-cpu">5\.1 CPU/);
  assert.match(chapter, /href="#5-1-cpu"/);
  assert.match(chapter, /指令流水线/);
  assert.doesNotMatch(chapter, /mind-map|Interactive expansion requires JavaScript/);
  const generated = await walk(path.join(root, "notes", "computer-organization"));
  assert.equal(generated.filter((file) => file.endsWith("index.html")).length, 7);
  assert.equal(generated.filter((file) => file.endsWith(".png")).length, 91);
  assert.equal(generated.filter((file) => /计组大题|\.csv$/i.test(file)).length, 0);
});
