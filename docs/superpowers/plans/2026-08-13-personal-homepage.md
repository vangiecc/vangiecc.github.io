# Vangie Personal Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a deployable, responsive personal publishing homepage with working Home, Blog, Notes, and Research routes in the approved NameRank-inspired editorial research style.

**Architecture:** Use four progressively enhanced static HTML documents that share one stylesheet and one small theme script. Navigation and collection links remain native HTML so all routes work without JavaScript; JavaScript is limited to applying, toggling, and persisting the color theme. Node's built-in test runner validates document structure, routing, copy, theme hooks, and critical CSS without adding application dependencies.

**Tech Stack:** HTML5, CSS custom properties and responsive layout, vanilla ES modules, Node.js 26 built-in `node:test`, GitHub Pages static hosting.

## Global Constraints

- Routes are exactly `/`, `/blog/`, `/notes/`, and `/research/`; there are no detail routes in the first release.
- Interface copy is English and the first-viewport identity is `Vangie`.
- Dark tokens include `#080a10`, `#0d1017`, `#12161f`, `#eef1f8`, `#aab3c7`, and `#6f7a92`.
- Semantic collection colors are Blog `#46e0b0`, Notes `#5a97e0`, and Research `#d98a2b`; labels must accompany color.
- Light mode uses a warm paper-like `#efece3` background with independently defined accessible colors.
- Typography roles are Instrument Serif for display, Instrument Sans for prose and interface text, and JetBrains Mono for metadata and controls.
- General text uses zero letter spacing; only uppercase monospace metadata may use positive tracking.
- Borders are one pixel and radii are 2-3 px; page sections are not floating cards.
- The background uses a faint 34 px grid and subtle noise, without gradients as decorative focal elements, orbs, or illustrations.
- The theme is applied before first paint, persists in `localStorage`, and works with system preference when no saved value exists.
- Native links provide all navigation without JavaScript; icon-only controls have accessible names and tooltips.
- The layout must have no horizontal overflow or text overlap at 375x812, 768x1024, 1440x900, and 1920x1080 viewports.
- `prefers-reduced-motion` disables smooth scrolling and removes meaningful transition or animation duration.
- Do not add a framework, package dependency, CMS, database, remote content API, search, filter, pagination, comments, analytics, subscription form, fabricated entries, or dead placeholder links.

## File Map

- `index.html`: home identity, hero readout, three collection rows, recent empty state, and shared shell markup.
- `blog/index.html`: Blog collection introduction and empty state.
- `notes/index.html`: Notes collection introduction and empty state.
- `research/index.html`: Research collection introduction, status legend, and empty state.
- `assets/css/site.css`: all tokens, locally loaded font roles, shared shell, home, collection, state, responsive, focus, and reduced-motion styling.
- `assets/js/theme.js`: exported theme helpers plus browser initialization and theme-toggle behavior.
- `package.json`: dependency-free ES module declaration and one test command.
- `tests/site.test.mjs`: Node tests for required files, route-specific markup, copy, navigation, semantics, and CSS contracts.
- `tests/theme.test.mjs`: Node tests for the pure theme resolution helpers.
- `README.md`: local preview, tests, route structure, deployment behavior, and content-editing locations.

---

### Task 1: Static Shell, Theme Contract, and Route Tests

**Files:**
- Create: `tests/site.test.mjs`
- Create: `tests/theme.test.mjs`
- Create: `assets/js/theme.js`
- Create: `assets/css/site.css`
- Create: `package.json`
- Modify: `index.html`

**Interfaces:**
- Produces: `resolveTheme(savedTheme: string | null, prefersLight: boolean): "dark" | "light"` from `assets/js/theme.js`.
- Produces: `setTheme(root: Element, storage: Storage | null, theme: "dark" | "light"): void` from `assets/js/theme.js`.
- Produces: shared HTML hooks `.site-header`, `.site-nav`, `.theme-toggle`, `.site-main`, and `.site-footer` for all later pages.
- Produces: CSS tokens `--bg`, `--surface`, `--surface-2`, `--ink`, `--ink-2`, `--ink-3`, `--blog`, `--notes`, and `--research`.
- Produces: `npm test`, mapped to `node --test tests/*.test.mjs`, with `"type": "module"` so Node and browsers interpret `theme.js` consistently.

- [ ] **Step 1: Write failing theme unit tests**

Create `tests/theme.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { resolveTheme, setTheme } from "../assets/js/theme.js";

test("resolveTheme prefers a valid saved value", () => {
  assert.equal(resolveTheme("dark", true), "dark");
  assert.equal(resolveTheme("light", false), "light");
});

test("resolveTheme falls back to the system preference", () => {
  assert.equal(resolveTheme(null, true), "light");
  assert.equal(resolveTheme(null, false), "dark");
  assert.equal(resolveTheme("invalid", false), "dark");
});

test("setTheme updates the root and persists the value", () => {
  const root = { dataset: {} };
  const writes = [];
  const storage = { setItem: (key, value) => writes.push([key, value]) };

  setTheme(root, storage, "light");

  assert.equal(root.dataset.theme, "light");
  assert.deepEqual(writes, [["vangie-theme", "light"]]);
});
```

- [ ] **Step 2: Write failing shell contract tests**

Create `tests/site.test.mjs` with reusable file helpers and the initial home assertions:

```js
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
  assert.match(html, /class="theme-toggle"[^>]+aria-label="Switch to light theme"[^>]+title="Switch to light theme"/);
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

  for (const value of ["#080a10", "#0d1017", "#12161f", "#eef1f8", "#aab3c7", "#6f7a92", "#46e0b0", "#5a97e0", "#d98a2b", "#efece3"]) {
    assert.ok(css.includes(value), `missing ${value}`);
  }
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /34px/);
});
```

- [ ] **Step 3: Run the tests and verify they fail for missing implementation**

Run:

```bash
node --test tests/theme.test.mjs tests/site.test.mjs
```

Expected: FAIL because `assets/js/theme.js`, `assets/css/site.css`, and `index.html` do not yet satisfy the contracts.

- [ ] **Step 4: Implement pure theme helpers and browser initialization**

Create `package.json` before importing `theme.js` in Node:

```json
{
  "name": "vangie-personal-site",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test tests/*.test.mjs"
  }
}
```

Create `assets/js/theme.js` with these exact exports and behavior:

```js
export function resolveTheme(savedTheme, prefersLight) {
  if (savedTheme === "dark" || savedTheme === "light") return savedTheme;
  return prefersLight ? "light" : "dark";
}

export function setTheme(root, storage, theme) {
  root.dataset.theme = theme;
  storage?.setItem("vangie-theme", theme);
}

function labelFor(theme) {
  return theme === "dark" ? "Switch to light theme" : "Switch to dark theme";
}

if (typeof document !== "undefined") {
  const root = document.documentElement;
  const button = document.querySelector(".theme-toggle");

  const syncButton = () => {
    const label = labelFor(root.dataset.theme);
    button?.setAttribute("aria-label", label);
    button?.setAttribute("title", label);
  };

  syncButton();
  button?.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    setTheme(root, window.localStorage, nextTheme);
    syncButton();
  });
}
```

- [ ] **Step 5: Create the accessible home shell and pre-paint bootstrap**

Replace `index.html` with a valid document containing:

- `<html lang="en" data-theme="dark">`.
- Title `Vangie — Field Notes, Ideas, and Research`.
- A head script before the stylesheet that reads `localStorage.getItem('vangie-theme')`, checks `matchMedia('(prefers-color-scheme: light)')`, and assigns `document.documentElement.dataset.theme` inside `try/catch`.
- `/assets/css/site.css` and module `/assets/js/theme.js` references.
- Shared semantic header, primary navigation, main, and footer.
- One home `h1` with the text `Vangie`.
- A theme button with the class and initial accessible label required by the test. Use familiar sun and moon glyph spans marked `aria-hidden="true"`; the button label and title describe the command.
- No GitHub, Email, or RSS links yet because final destinations are unknown.
- Footer copyright generated in markup as `© 2026 Vangie` for this release.

Keep Task 1 main content minimal: an `intro-shell` containing the approved kicker, `Vangie`, and editorial statement. Task 2 will complete the home content.

- [ ] **Step 6: Establish the complete shared visual foundation**

Create `assets/css/site.css` with:

- Local `@font-face` declarations pointing to `/assets/fonts/instrument-serif-regular.woff2`, `/assets/fonts/instrument-serif-italic.woff2`, `/assets/fonts/instrument-sans-variable.woff2`, and `/assets/fonts/jetbrains-mono-variable.woff2`, with named fallbacks. Task 4 will add the binary font files.
- Exact dark and light custom-property palettes from the spec.
- Reset, semantic typography roles, 17 px body text, focus rings, shared wrapper, sticky header, stable 40 px theme button, navigation active state, footer, 34 px masked background grid, and subtle inline SVG noise texture.
- `.page-enter` rise/fade animation capped at `translateY(14px)` and 700 ms.
- A `prefers-reduced-motion` block that sets smooth scrolling to `auto` and animation/transition duration to `0.01ms !important`.
- Responsive header behavior that hides `.nav-index` at 720 px while retaining Blog, Notes, and Research labels.

- [ ] **Step 7: Run shell and theme tests**

Run:

```bash
node --test tests/theme.test.mjs tests/site.test.mjs
```

Expected: PASS.

- [ ] **Step 8: Commit the independently working shell**

```bash
git add package.json index.html assets/css/site.css assets/js/theme.js tests/site.test.mjs tests/theme.test.mjs
git commit -m "feat: establish personal site shell"
```

---

### Task 2: Complete Home Page Content and Responsive Entry Rows

**Files:**
- Modify: `tests/site.test.mjs`
- Modify: `index.html`
- Modify: `assets/css/site.css`

**Interfaces:**
- Consumes: shared shell classes and palette tokens from Task 1.
- Produces: `#archive`, `.hero`, `.currently`, `.collection-list`, `.collection-entry`, `.collection-entry--blog`, `.collection-entry--notes`, `.collection-entry--research`, and `.recent-section` hooks.

- [ ] **Step 1: Add failing home-content tests**

Append to `tests/site.test.mjs`:

```js
test("home contains the approved hero, readout, and collection copy", async () => {
  const html = await read("index.html");

  assert.match(html, /FIELD NOTES \/ IDEAS \/ ONGOING WORK/);
  assert.match(html, /Writing down what I think, what I learn, and what I(?:'|&(?:apos|#39);)m trying to understand\./);
  assert.match(html, /href="#archive"[^>]*>\s*Explore the archive/);
  assert.match(html, />CURRENTLY</);
  for (const label of ["Writing", "Learning", "Researching"]) assert.match(html, new RegExp(`>${label}<`));
  for (const copy of [
    "Essays, opinions, and observations.",
    "Learning notes, references, and working knowledge.",
    "Questions, experiments, and research progress.",
  ]) assert.ok(html.includes(copy));
  assert.equal((html.match(/No entries yet\./g) ?? []).length, 4);
});

test("home collection rows are native full-row links with text identities", async () => {
  const html = await read("index.html");

  for (const [name, route] of [["Blog", "/blog/"], ["Notes", "/notes/"], ["Research", "/research/"]]) {
    assert.match(html, new RegExp(`<a[^>]+class="collection-entry collection-entry--${name.toLowerCase()}"[^>]+href="${route}"`));
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
```

- [ ] **Step 2: Run the new home tests and verify failure**

Run:

```bash
node --test tests/site.test.mjs
```

Expected: FAIL because the readout, archive rows, recent section, and responsive home hooks are absent.

- [ ] **Step 3: Implement the complete home document**

Expand `index.html` main content to include:

- `.hero.page-enter` with left editorial content and right `.currently.instrument-panel`.
- A `CURRENTLY` heading plus definition list containing `Writing`, `Learning`, and `Researching`, each with an em dash empty value.
- Three native anchor rows inside `<section id="archive" class="collection-list" aria-label="Collections">`.
- Each anchor row includes visible index, serif title, approved description, `No entries yet.`, uppercase destination label, and an `aria-hidden="true"` right arrow.
- A separate `.recent-section` with metadata heading `RECENTLY` and visible empty state `No entries yet.`.

Use the exact approved copy from the design spec. Do not add sample posts, social links, biography facts, or counts.

- [ ] **Step 4: Implement desktop and mobile home styling**

Add CSS for:

- Desktop `.hero` columns `minmax(0, 1.08fr) minmax(300px, 0.72fr)` and a 960 px single-column breakpoint.
- Display heading using `clamp(4rem, 9vw, 7.5rem)` with a stable `0.92` line height and no viewport-width-derived body typography.
- `.currently` as the only framed instrument panel in the hero.
- Full-width collection rows separated by rules, with a minimum height of 176 px desktop and stable padding.
- Category-specific left rule or index color using `--blog`, `--notes`, and `--research`, while always retaining visible category text.
- Hover and focus-within treatment that changes background and moves only the arrow using `transform: translateX(4px)`.
- A 640 px layout that stacks entry metadata and action without overlap, and preserves at least 40 px touch targets.
- A recent section as an unframed full-width band.

- [ ] **Step 5: Run home and theme tests**

Run:

```bash
node --test tests/site.test.mjs tests/theme.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Commit the home page**

```bash
git add index.html assets/css/site.css tests/site.test.mjs
git commit -m "feat: build personal homepage archive"
```

---

### Task 3: Blog, Notes, and Research Collection Routes

**Files:**
- Modify: `tests/site.test.mjs`
- Create: `blog/index.html`
- Create: `notes/index.html`
- Create: `research/index.html`
- Modify: `assets/css/site.css`

**Interfaces:**
- Consumes: `/assets/css/site.css`, `/assets/js/theme.js`, and shared shell hooks from Task 1.
- Produces: `.collection-page`, `.collection-hero`, `.collection-index`, `.empty-state`, `.status-key`, and `[aria-current="page"]` navigation states.

- [ ] **Step 1: Add failing collection-route tests**

Append to `tests/site.test.mjs`:

```js
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
    assert.match(html, new RegExp(`<a[^>]+href="${collection.route}"[^>]+aria-current="page"`));
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
  for (const status of ["ACTIVE", "EXPLORING", "ARCHIVED"]) assert.match(html, new RegExp(`>${status}<`));
});
```

- [ ] **Step 2: Run route tests and verify failure**

Run:

```bash
node --test tests/site.test.mjs
```

Expected: FAIL with missing `blog/index.html`, `notes/index.html`, and `research/index.html`.

- [ ] **Step 3: Create the Blog page**

Create `blog/index.html` by reusing the exact shared head bootstrap, header, theme control, and footer structure from Home. Mark `/blog/` with `aria-current="page"`.

Main content must contain:

- `01 / BLOG` metadata.
- One `h1`: `Ideas and observations.`
- The approved description.
- An unframed collection body with `No entries yet.` and a quiet sentence: `Essays will appear here in reverse chronological order.`

- [ ] **Step 4: Create the Notes page**

Create `notes/index.html` with the same shell, mark `/notes/` current, and include:

- `02 / NOTES` metadata.
- One `h1`: `Things I'm learning.`
- The approved description.
- An unframed empty state: `No entries yet.` followed by `Notes will be grouped by subject as the archive grows.`

- [ ] **Step 5: Create the Research page**

Create `research/index.html` with the same shell, mark `/research/` current, and include:

- `03 / RESEARCH` metadata.
- One `h1`: `Questions under investigation.`
- The approved description.
- A compact textual `.status-key` listing `ACTIVE`, `EXPLORING`, and `ARCHIVED` with short meanings.
- An unframed empty state: `No entries yet.` followed by `Research questions and progress records will appear here.`

- [ ] **Step 6: Style shared collection pages and status states**

Add CSS for:

- A collection hero with generous top and bottom spacing, large serif title sized below the home identity, and a maximum prose width of 62 characters.
- Category-specific `.collection-page--blog`, `--notes`, and `--research` accent variables.
- Unframed empty-state rows with one-pixel top and bottom rules and stable minimum height.
- Research status text with a small semantic dot plus explicit label; dots do not carry meaning alone.
- Mobile wrapping that keeps labels and descriptions inside the viewport.

- [ ] **Step 7: Run all structural tests**

Run:

```bash
node --test tests/site.test.mjs tests/theme.test.mjs
```

Expected: PASS.

- [ ] **Step 8: Serve locally and verify native routes**

Run:

```bash
python3 -m http.server 8000
```

In a second terminal, run:

```bash
curl --fail --silent http://127.0.0.1:8000/ >/dev/null
curl --fail --silent http://127.0.0.1:8000/blog/ >/dev/null
curl --fail --silent http://127.0.0.1:8000/notes/ >/dev/null
curl --fail --silent http://127.0.0.1:8000/research/ >/dev/null
```

Expected: all four commands exit 0.

- [ ] **Step 9: Commit all collection routes**

```bash
git add blog/index.html notes/index.html research/index.html assets/css/site.css tests/site.test.mjs
git commit -m "feat: add publishing collection pages"
```

---

### Task 4: Local Font Assets, Documentation, and Visual Verification

**Files:**
- Create: `assets/fonts/instrument-serif-regular.woff2`
- Create: `assets/fonts/instrument-serif-italic.woff2`
- Create: `assets/fonts/instrument-sans-variable.woff2`
- Create: `assets/fonts/jetbrains-mono-variable.woff2`
- Modify: `tests/site.test.mjs`
- Modify: `README.md`
- Modify: `assets/css/site.css` only if visual verification reveals an acceptance-criteria failure.
- Modify: any page HTML only if visual verification reveals an acceptance-criteria failure.

**Interfaces:**
- Consumes: font URLs already declared in Task 1.
- Produces: self-hosted WOFF2 assets with no runtime dependency on a font CDN.
- Produces: documented commands `node --test tests/*.test.mjs` and `python3 -m http.server 8000`.

- [ ] **Step 1: Extend tests for font files and banned placeholders**

Append to `tests/site.test.mjs`:

```js
import { stat } from "node:fs/promises";

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
```

- [ ] **Step 2: Run the test and verify the font assertion fails**

Run:

```bash
node --test tests/site.test.mjs
```

Expected: FAIL because the four WOFF2 files are missing.

- [ ] **Step 3: Add the four self-hosted font files from authoritative packages**

Use the terminal proxy already available in the environment. Resolve the published package version once with `npm view <package> version`, record the resolved versions in the commit message body or implementation report, then download the WOFF2 files from those immutable versions of `@fontsource/instrument-serif`, `@fontsource-variable/instrument-sans`, and `@fontsource-variable/jetbrains-mono`. Save only the required Latin files under the exact paths in the file list.

After download, verify file types and sizes:

```bash
file assets/fonts/*.woff2
wc -c assets/fonts/*.woff2
```

Expected: every file reports Web Open Font Format (Version 2) and exceeds 1,000 bytes. Do not copy font binaries from the reference site's deployment.

- [ ] **Step 4: Document local development and publishing**

Replace `README.md` with:

````markdown
# vangie.github.io

Vangie's personal publishing site for Blog, Notes, and Research.

## Local preview

```bash
python3 -m http.server 8000
```

Open `http://127.0.0.1:8000/`.

## Tests

```bash
node --test tests/*.test.mjs
```

## Routes

- `/` — home and archive index
- `/blog/` — essays and viewpoints
- `/notes/` — learning notes
- `/research/` — research progress

The repository is a dependency-free static site and can be published directly with GitHub Pages.
````

- [ ] **Step 5: Run complete automated verification**

Run:

```bash
node --test tests/*.test.mjs
git diff --check
```

Expected: all tests PASS and `git diff --check` prints no errors.

- [ ] **Step 6: Start the final local server**

Run:

```bash
python3 -m http.server 8000
```

Keep the server running for browser verification and final user handoff. If port 8000 is occupied, use 8001 and use that port for every following check.

- [ ] **Step 7: Verify desktop and mobile rendering in the Browser**

Use the Browser skill to inspect all four routes and capture screenshots at:

- Home: 1440x900, 1920x1080, 375x812, and 768x1024.
- Blog, Notes, Research: 1440x900 and 375x812.

For every screenshot, verify:

- The page is nonblank and local fonts visibly render.
- Vangie dominates the home first viewport.
- The next home section remains discoverable without an excessively tall hero.
- Header, hero copy, readout, collection rows, empty states, and footer do not overlap.
- There is no horizontal overflow.
- Full Blog, Notes, and Research names remain visible at mobile width.
- The grid and noise stay subtle enough for body copy to remain readable.

Use Browser DOM inspection to assert `document.documentElement.scrollWidth === document.documentElement.clientWidth` at each viewport.

- [ ] **Step 8: Verify interaction, accessibility, and both themes**

In Browser:

- Tab through the header and all home links; verify focus rings remain visible.
- Activate the theme button; verify `data-theme` changes and the button label changes to the inverse command.
- Reload and navigate to another route; verify the selected theme persists without a visible wrong-theme flash.
- Emulate `prefers-reduced-motion: reduce`; verify content does not visibly rise or animate.
- Navigate every collection row and header link; verify the expected route and current navigation state.

If a check fails, add a focused assertion to `tests/site.test.mjs` where practical, make the smallest HTML/CSS/JS correction, and rerun Steps 5-8.

- [ ] **Step 9: Commit fonts, documentation, and any verified polish fixes**

```bash
git add assets/fonts README.md tests/site.test.mjs assets/css/site.css index.html blog/index.html notes/index.html research/index.html
git commit -m "chore: finalize personal site assets"
```

- [ ] **Step 10: Record final evidence**

Run:

```bash
git status --short
git log -4 --oneline
```

Expected: clean status and four implementation commits after the design and plan commits. Report the test count, checked viewports, final local URL, and any non-blocking residual risk.
