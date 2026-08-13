import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeExportIndentation, renderMarkdown } from "../scripts/notes/render-markdown.mjs";
import { chapterSourcePath, validateManifest } from "../scripts/notes/computer-organization.mjs";
import { computerOrganizationChapters } from "../scripts/notes/computer-organization-manifests.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFile(path.join(root, file), "utf8");

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else files.push(full);
  }
  return files;
}

test("Operating Systems output retains routes, formatting, formulas, and assets", async () => {
  const archive = await read("notes/operating-systems/index.html");
  assert.match(archive, /<b>7<\/b> chapters/);
  for (const slug of ["introduction", "process-management", "synchronization-and-deadlocks", "memory-management", "device-management", "file-management", "evolution"]) {
    assert.match(await read(`notes/operating-systems/${slug}/index.html`), /class="markdown-body"/);
  }
  const fileChapter = await read("notes/operating-systems/file-management/index.html");
  assert.match(fileChapter, /为使链接父目录D5/);
  assert.match(fileChapter, /<strong>优点：<\/strong>/);
  assert.match(fileChapter, /<ul>\s*<li><p>当其他用户去读共享文件/);
  assert.match(fileChapter, /<blockquote>\s*<p>建立硬链接时/);
  assert.doesNotMatch(fileChapter, /<pre><code>\s*为使链接父目录D5/);
  assert.match(fileChapter, /class="math-display"/);
  assert.match(fileChapter, /operatorname\{DIV\}/);
  const assets = await walk(path.join(root, "notes", "operating-systems", "assets"));
  assert.equal(assets.filter((file) => file.endsWith(".png")).length, 85);
  assert.equal(assets.filter((file) => file.endsWith(".csv")).length, 6);
  assert.equal(assets.filter((file) => file.endsWith(".pdf")).length, 2);
  assert.ok((await stat(path.join(root, "assets/vendor/katex/katex.min.css"))).size > 1000);
});

test("shared renderer normalizes Notion indentation and renders display math", () => {
  const markdown = "    prose\n\n    $x_1\\times 2$";
  assert.equal(normalizeExportIndentation(markdown), "prose\n\n$x_1\\times 2$");
  const html = renderMarkdown(markdown);
  assert.match(html, /<p>prose<\/p>/);
  assert.match(html, /class="math-display"/);
  assert.match(html, /class="katex-display"/);
});

test("manifest validation rejects duplicate ids and overlapping ranges", () => {
  const source = "2.1 Root\n\nDefinition\n\nFormula $x_1$\n";
  assert.throws(() => validateManifest({ slug: "bad", nodes: [
    { id: "same", title: "A", startLine: 1, endLine: 3, children: [] },
    { id: "same", title: "B", startLine: 3, endLine: 5, children: [] },
  ] }, source), /duplicate node id|overlap/i);
});

test("six manifests cover every meaningful source line", async () => {
  assert.deepEqual(computerOrganizationChapters.map(({ number }) => number), [2, 3, 4, 5, 6, 7]);
  for (const chapter of computerOrganizationChapters) {
    const source = await readFile(await chapterSourcePath(chapter), "utf8");
    const { coveredLines, meaningfulLines } = validateManifest(chapter, source);
    assert.deepEqual([...coveredLines].sort((a, b) => a - b), [...meaningfulLines].sort((a, b) => a - b), chapter.slug);
  }
});
