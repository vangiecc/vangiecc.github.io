import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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
  assert.equal((html.match(/No entries yet\./g) ?? []).length, 4);
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
    assert.ok(html.includes("No entries yet."));
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
