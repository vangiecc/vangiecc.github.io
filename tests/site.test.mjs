import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

test("home exposes the shared semantic shell and four real routes", async () => {
  const html = await read("index.html");

  assert.match(html, /<header class="site-header">/);
  assert.match(html, /<nav[^>]+aria-label="Primary"/);
  assert.match(html, /<main[^>]+class="site-main/);
  assert.match(html, /<footer class="site-footer">/);
  assert.match(html, /href="\/"/);
  assert.match(html, /href="\/blog\/"/);
  assert.match(html, /href="\/notes\/"/);
  assert.match(html, /href="\/research\/"/);
  assert.match(
    html,
    /class="theme-toggle"[^>]+aria-label="Switch to light theme"[^>]+title="Switch to light theme"/,
  );
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
});

test("home applies the theme before loading the stylesheet", async () => {
  const html = await read("index.html");
  const bootstrap = html.indexOf("localStorage.getItem('vangie-theme')");
  const stylesheet = html.indexOf('href="/assets/css/site.css"');

  assert.ok(bootstrap > -1);
  assert.ok(stylesheet > bootstrap);
  assert.match(html, /type="module" src="\/assets\/js\/theme\.js"/);
});

test("critical CSS tokens and accessibility rules exist", async () => {
  const css = await read("assets/css/site.css");

  for (const value of [
    "#080a10",
    "#0d1017",
    "#12161f",
    "#eef1f8",
    "#aab3c7",
    "#6f7a92",
    "#46e0b0",
    "#5a97e0",
    "#d98a2b",
    "#efece3",
  ]) {
    assert.ok(css.includes(value), `missing ${value}`);
  }
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /34px/);
});

test("home contains the approved hero, readout, and collection copy", async () => {
  const html = await read("index.html");

  assert.match(html, /Field notes \/ ideas \/ ongoing work/i);
  assert.match(
    html,
    /Writing down what I think, what I learn, and what I(?:'|&(?:apos|#39);)m trying to understand\./,
  );
  assert.match(html, /href="#archive"[^>]*>\s*Explore the archive/);
  assert.match(html, />CURRENTLY</);
  for (const label of ["Writing", "Learning", "Researching"]) {
    assert.match(html, new RegExp(`>${label}<`));
  }
  for (const copy of [
    "Essays, opinions, and observations.",
    "Learning notes, references, and working knowledge.",
    "Questions, experiments, and research progress.",
  ]) {
    assert.ok(html.includes(copy));
  }
  assert.equal((html.match(/No entries yet\./g) ?? []).length, 3);
});

test("home collection rows are native full-row links with text identities", async () => {
  const html = await read("index.html");

  for (const [name, route] of [
    ["Blog", "/blog/"],
    ["Notes", "/notes/"],
    ["Research", "/research/"],
  ]) {
    assert.match(
      html,
      new RegExp(
        `<a[^>]+class="collection-entry collection-entry--${name.toLowerCase()}"[^>]+href="${route}"`,
      ),
    );
    assert.match(html, new RegExp(`>${name}<`));
  }
  assert.match(html, /id="archive"/);
});

test("home layout defines stable responsive rows", async () => {
  const css = await read("assets/css/site.css");

  assert.match(css, /\.hero\s*\{[^}]*grid-template-columns:/s);
  assert.match(css, /\.collection-entry\s*\{[^}]*min-height:/s);
  assert.match(css, /@media\s*\(max-width:\s*960px\)/);
  assert.match(css, /@media\s*\(max-width:\s*640px\)/);
});

const collections = [
  {
    file: "blog/index.html",
    route: "/blog/",
    index: "01 / BLOG",
    title: "Ideas and observations.",
    description: "Essays about technology, work, and things worth thinking through.",
  },
  {
    file: "notes/index.html",
    route: "/notes/",
    index: "02 / NOTES",
    title: "Things I'm learning.",
    description: "Concise notes, references, and incomplete understanding.",
  },
  {
    file: "research/index.html",
    route: "/research/",
    index: "03 / RESEARCH",
    title: "Questions under investigation.",
    description: "Experiments, findings, and records of work in progress.",
  },
];

for (const collection of collections) {
  test(`${collection.route} has shared navigation, exact copy, and an empty state`, async () => {
    const html = await read(collection.file);

    assert.match(html, /<html lang="en" data-theme="dark">/);
    assert.match(
      html,
      new RegExp(`<a[^>]+href="${collection.route}"[^>]+aria-current="page"`),
    );
    assert.ok(html.includes(collection.index));
    assert.ok(html.includes(collection.title));
    assert.ok(html.includes(collection.description));
    if (collection.route !== "/notes/") assert.ok(html.includes("No entries yet."));
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
    assert.match(html, /href="\/assets\/css\/site\.css"/);
    assert.match(html, /type="module" src="\/assets\/js\/theme\.js"/);
  });
}

test("research exposes all supported statuses as a text legend", async () => {
  const html = await read("research/index.html");
  for (const status of ["ACTIVE", "EXPLORING", "ARCHIVED"]) {
    assert.match(html, new RegExp(`>${status}<`));
  }
});

test("required self-hosted font files are non-empty", async () => {
  const fonts = [
    "assets/fonts/instrument-serif-regular.woff2",
    "assets/fonts/instrument-serif-italic.woff2",
    "assets/fonts/instrument-sans-variable.woff2",
    "assets/fonts/jetbrains-mono-variable.woff2",
  ];

  for (const font of fonts) {
    const info = await stat(path.join(root, font));
    assert.ok(info.size > 1000, `${font} is unexpectedly small`);
  }
});

test("documents contain no dead links or fabricated entries", async () => {
  for (const file of ["index.html", ...collections.map(({ file }) => file)]) {
    const html = await read(file);
    assert.doesNotMatch(html, /href="#"/);
    assert.doesNotMatch(html, /example (article|post|note|project)/i);
  }
});

test("notes build emits the operating systems archive", async () => {
  const { execFile } = await import("node:child_process");
  const { promisify } = await import("node:util");
  const run = promisify(execFile);

  await run("npm", ["run", "build:notes"], { cwd: root });

  const archive = await read("notes/operating-systems/index.html");
  assert.match(archive, /OPERATING SYSTEMS/);
  assert.match(archive, /<b>7<\/b> chapters/);
  assert.match(archive, /href="\/notes\/operating-systems\/introduction\/"/);

  const chapter = await read("notes/operating-systems/synchronization-and-deadlocks/index.html");
  assert.match(chapter, /Synchronization &amp; Deadlocks|同步通信及死锁管理/);
  assert.match(chapter, /On this page/);
  assert.match(chapter, /临界区/);

  const fileChapter = await read("notes/operating-systems/file-management/index.html");
  assert.match(fileChapter, /为使链接父目录D5/);
  assert.match(fileChapter, /<strong>优点：<\/strong>/);
  assert.match(fileChapter, /<ul>\s*<li><p>当其他用户去读共享文件/);
  assert.match(fileChapter, /<blockquote>\s*<p>建立硬链接时/);
  assert.doesNotMatch(fileChapter, /<pre><code>\s*为使链接父目录D5/);

  const chapterRoutes = [
    "introduction",
    "process-management",
    "synchronization-and-deadlocks",
    "memory-management",
    "device-management",
    "file-management",
    "evolution",
  ];
  for (const slug of chapterRoutes) {
    const page = await read(`notes/operating-systems/${slug}/index.html`);
    assert.match(page, /class="markdown-body"/);
  }

  const assetRoot = path.join(root, "notes", "operating-systems", "assets");
  const assetFiles = await (async function walk(directory) {
    const { readdir } = await import("node:fs/promises");
    const files = [];
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) files.push(...await walk(full));
      else files.push(full);
    }
    return files;
  })(assetRoot);
  assert.equal(assetFiles.filter((file) => file.endsWith(".png")).length, 85);
  assert.equal(assetFiles.filter((file) => file.endsWith(".csv")).length, 6);
  assert.equal(assetFiles.filter((file) => file.endsWith(".pdf")).length, 2);
});
