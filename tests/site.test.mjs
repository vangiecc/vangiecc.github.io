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
  test(`${collection.route} has shared navigation and exact collection copy`, async () => {
    const html = await read(collection.file);

    assert.match(html, /<html lang="en" data-theme="dark">/);
    assert.match(
      html,
      new RegExp(`<a[^>]+href="${collection.route}"[^>]+aria-current="page"`),
    );
    assert.ok(html.includes(collection.index));
    assert.ok(html.includes(collection.title));
    assert.ok(html.includes(collection.description));
    if (collection.route === "/blog/") assert.ok(html.includes("No entries yet."));
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
    assert.match(html, /href="\/assets\/css\/site\.css"/);
    assert.match(html, /type="module" src="\/assets\/js\/theme\.js"/);
  });
}

test("research exposes all supported statuses as a text legend", async () => {
  const html = await read("research/index.html");
  for (const status of ["COMPLETED", "ACTIVE", "EXPLORING", "ARCHIVED"]) {
    assert.match(html, new RegExp(`>${status}<`));
  }
});

test("research lists the completed memory diagnosis project", async () => {
  const html = await read("research/index.html");
  assert.match(html, />COMPLETED</);
  assert.match(html, /When Do Memories Break\?/);
  assert.match(html, /Chain-of-Stage Diagnosis for LLM Memory Systems/);
  assert.match(html, /MemEval is a stage-wise framework/);
  assert.match(html, /href="\/research\/chain-of-stage-diagnosis\/"/);
  assert.doesNotMatch(html, /No entries yet\./);
  assert.doesNotMatch(html, /Chain_of_stage_diagnosis\.pdf|\.pdf["?#]/i);
});

test("completed memory research has an accessible English detail page", async () => {
  const html = await read("research/chain-of-stage-diagnosis/index.html");
  assert.match(html, /<html lang="en" data-theme="dark">/);
  assert.match(html, /class="collection-page collection-page--research research-detail memeval"/);
  assert.match(html, /href="\/research\/" aria-current="page"/);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  assert.match(html, />COMPLETED</);
  assert.match(html, /class="memeval-subnav"/);
  for (const anchor of ["#motivation", "#method", "#results", "#insights"]) {
    assert.match(html, new RegExp(`href="${anchor}"`));
  }
  assert.match(html, /class="markdown-body research-article memeval-article"/);
  for (const id of ["motivation", "method", "results", "insights", "error-taxonomy", "evaluation-scope", "datasets", "limitations", "conclusion"]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(html, /4 stages, 11 failure types/);
  assert.equal((html.match(/class="memeval-stat"/g) ?? []).length, 3);
  for (const result of ["1,540", "500", "50.39", "50.71", "57.40", "58.31", "73.70%"] ) {
    assert.ok(html.includes(result), `missing result ${result}`);
  }
  assert.equal((html.match(/<caption>/g) ?? []).length, 0);
  assert.match(html, /class="table-scroll table-scroll--center"/);
  assert.match(html, /aria-describedby="cap-taxonomy"/);
  assert.match(html, /class="table-scroll"/);
  assert.match(html, /aria-describedby="cap-scaling"/);
  for (const group of ["Closed-source models", "Open-weight models"]) assert.ok(html.includes(group));
  for (const cell of ["408", "228", "781", "642"]) assert.ok(html.includes(cell), `missing table cell ${cell}`);
  assert.doesNotMatch(html, /\.pdf["?#]|<embed|<iframe|<object/i);
});

test("completed memory research presents the paper's diagnosis figures for each memory system", async () => {
  const html = await read("research/chain-of-stage-diagnosis/index.html");
  const css = await read("assets/css/site.css");

  assert.equal((html.match(/<figure class="paper-figure/g) ?? []).length, 10);
  for (const src of [
    "paradigm-diagram", "diagnostic-examples",
    "mem0-stage-bar", "mem0-category-pies",
    "amem-stage-bar", "amem-category-pies",
    "memoryos-stage-bar", "memoryos-category-pies",
    "openclaw-stage-bar", "openclaw-category-pies",
  ]) {
    assert.match(html, new RegExp(`src="figures/${src}\\.png"`));
    const info = await stat(path.join(root, "research/chain-of-stage-diagnosis/figures", `${src}.png`));
    assert.ok(info.size > 1000, `${src}.png is unexpectedly small`);
  }
  for (const system of ["mem0 — primary testbed", "A-mem", "MemoryOS", "OpenClaw"]) {
    assert.ok(html.includes(system), `missing system ${system}`);
  }
  assert.doesNotMatch(html, /renderResearchCharts|research-chart/);
  assert.match(css, /\.paper-figure\s*\{/);
  assert.match(css, /@media\s*\(max-width:\s*720px\)/);
});

test("the private research PDF is excluded from the published tree", async () => {
  await assert.rejects(stat(path.join(root, "research/Chain_of_stage_diagnosis.pdf")), { code: "ENOENT" });
  const ignore = await read(".gitignore");
  assert.match(ignore, /^research\/Chain_of_stage_diagnosis\.pdf$/m);
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

test("notes pages embed the FlowUs share views", async () => {
  const os = await read("notes/operating-systems/index.html");
  assert.match(os, /OPERATING SYSTEMS/);
  assert.match(os, /<iframe src="https:\/\/flowus\.cn\/share\/7dcefccb-df9f-49d7-970b-0c30f28a9df2"/);
  assert.match(os, /open the share page directly/);

  const cs = await read("notes/computer-organization/index.html");
  assert.match(cs, /COMPUTER ORGANIZATION/);
  assert.match(cs, /<iframe src="https:\/\/flowus\.cn\/share\/755cf848-063d-44cd-8126-c4ead1ceeebf"/);
  assert.match(cs, /open the share page directly/);
});
