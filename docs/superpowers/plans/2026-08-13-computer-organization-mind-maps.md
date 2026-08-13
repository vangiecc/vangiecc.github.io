# Computer Organization Mind Maps Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish six Computer Organization chapters as static, self-hosted, progressively expandable mind maps whose detail cards preserve the original Markdown, formulas, and images.

**Architecture:** Extract the reusable Markdown/KaTeX/asset helpers from the existing Operating Systems builder, then add explicit per-chapter manifests that map source line ranges into a validated tree. Generate static HTML and embedded node data at build time; a dependency-free browser module owns expansion state, layout, connectors, panning, zoom, detail cards, and keyboard behavior.

**Tech Stack:** Node.js ES modules, `marked`, KaTeX, static HTML/CSS/SVG, native browser JavaScript, Node test runner.

## Global Constraints

- Use `Computer Organization` as the sole displayed course name; retain Chinese chapter titles and source prose.
- Publish only the six top-level chapter Markdown files for Chapters 2–7.
- Never publish or copy `计组大题细节注意`, its CSV, or its descendant Markdown pages.
- Do not modify the source export under `notes/CS+755cf848-063d-44c/`.
- Each chapter page contains one mind map and no conventional article body or separate reading panel.
- The root and major numbered sections are visible initially; deeper nodes are collapsed.
- Detail cards preserve assigned source wording without summarization.
- All assets are local and the generated output remains GitHub Pages compatible.
- Existing Operating Systems output and its 16-test baseline must remain green.
- Follow TDD for every behavior change and commit each task independently.

---

## File Structure

**Create**

- `scripts/notes/render-markdown.mjs` — shared indentation normalization, image rewriting, KaTeX rendering, and Markdown-to-HTML conversion.
- `scripts/notes/site-shell.mjs` — shared Notes document shell and course/chapter index markup.
- `scripts/notes/computer-organization.mjs` — course metadata, source discovery, manifest validation, asset copying, and page generation.
- `scripts/notes/computer-organization-manifests.mjs` — the six explicit trees and their source line ranges.
- `assets/js/mind-map-state.js` — pure expansion/detail/viewport state transitions.
- `assets/js/mind-map.js` — DOM rendering, tree layout, SVG connectors, input handling, and accessibility behavior.
- `tests/notes-build.test.mjs` — build helpers, shared renderer tests, course output tests, manifest validation, coverage, and exclusion checks.
- `tests/mind-map-state.test.mjs` — pure interaction-state tests.
- `notes/computer-organization/**` — generated course index, chapter pages, and referenced images.

**Modify**

- `scripts/build-notes.mjs` — retain Operating Systems orchestration while consuming shared renderer/shell functions and invoking the new course builder.
- `assets/css/site.css` — course index and complete mind-map visual/responsive/reduced-motion styling.
- `notes/index.html` — add the Computer Organization archive row.
- `tests/site.test.mjs` — keep site-shell assertions and delegate detailed publishing assertions to the focused build test.
- `package.json` — keep `npm run build:notes` as the single command that generates both courses.

---

### Task 1: Extract Shared Notes Rendering Without Changing Operating Systems Output

**Files:**

- Create: `scripts/notes/render-markdown.mjs`
- Create: `scripts/notes/site-shell.mjs`
- Modify: `scripts/build-notes.mjs`
- Create: `tests/notes-build.test.mjs`
- Modify: `tests/site.test.mjs`

**Interfaces:**

- Produces `normalizeExportIndentation(markdown: string): string`.
- Produces `renderMarkdown(markdown: string): string`, returning HTML with KaTeX wrappers.
- Produces `rewriteMarkdownImages(markdown: string, mappings: Map<string,string>, sourceRoot: string): string`.
- Produces `copyKatexAssets(root: string): Promise<void>`.
- Produces `notesShell({ title, description, content, bodyClass, scripts }): string`.
- Existing `scripts/build-notes.mjs` remains directly executable and generates Operating Systems at the same paths.

- [ ] **Step 1: Move the existing Operating Systems build assertions into a focused test and add renderer contract tests**

Create `tests/notes-build.test.mjs` with the following imports and contracts. Move the remaining existing indentation assertions (`<strong>优点`, list, blockquote, and absence of the erroneous code block) from `tests/site.test.mjs` into the first test without changing their regular expressions.

```js
import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeExportIndentation, renderMarkdown } from "../scripts/notes/render-markdown.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const run = promisify(execFile);
const read = (file) => readFile(path.join(root, file), "utf8");

test("Operating Systems output remains unchanged after renderer extraction", async () => {
  await run("npm", ["run", "build:notes"], { cwd: root });
  const fileChapter = await read("notes/operating-systems/file-management/index.html");
  assert.match(fileChapter, /为使链接父目录D5/);
  assert.match(fileChapter, /class="math-display"/);
  assert.match(fileChapter, /operatorname\{DIV\}/);
  const archive = await read("notes/operating-systems/index.html");
  assert.match(archive, /<b>7<\/b> chapters/);
  for (const slug of ["introduction", "process-management", "synchronization-and-deadlocks", "memory-management", "device-management", "file-management", "evolution"]) {
    assert.match(await read(`notes/operating-systems/${slug}/index.html`), /class="markdown-body"/);
  }
  const assets = await walk(path.join(root, "notes", "operating-systems", "assets"));
  assert.equal(assets.filter((file) => file.endsWith(".png")).length, 85);
  assert.equal(assets.filter((file) => file.endsWith(".csv")).length, 6);
  assert.equal(assets.filter((file) => file.endsWith(".pdf")).length, 2);
});

test("shared renderer normalizes Notion indentation and renders math", () => {
  const markdown = "    prose\n\n    $x_1\\times 2$";
  assert.equal(normalizeExportIndentation(markdown), "prose\n\n$x_1\\times 2$");
  const html = renderMarkdown(markdown);
  assert.match(html, /<p>prose<\/p>/);
  assert.match(html, /class="math-display"/);
  assert.match(html, /class="katex-display"/);
});
```

Define `walk(directory)` in this test file using the same recursive `readdir({ withFileTypes: true })` implementation currently present in `tests/site.test.mjs`.

- [ ] **Step 2: Run the focused test and verify the missing module failure**

Run: `node --test tests/notes-build.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `scripts/notes/render-markdown.mjs`.

- [ ] **Step 3: Extract the existing helpers and shell**

Move, without behavior changes, `normalizeExportIndentation`, `renderMath`, `restoreMath`, KaTeX asset copying, HTML escaping, and image rewriting into `render-markdown.mjs`. Export this stable wrapper:

```js
export function renderMarkdown(markdown) {
  const normalized = normalizeExportIndentation(markdown);
  const math = renderMath(normalized);
  return restoreMath(marked.parse(math.markdown), math.tokens);
}
```

Move the existing head, theme bootstrap, navigation, footer, and KaTeX stylesheet link into `notesShell`. The `scripts` array renders local `type="module"` script tags after `theme.js`. Update the Operating Systems builder to use these exports while keeping its generated markup and paths stable.

- [ ] **Step 4: Run the focused and complete test suites**

Run: `node --test tests/notes-build.test.mjs && npm test`

Expected: all tests PASS; Operating Systems asset counts remain 85 PNG, 6 CSV, and 2 PDF.

- [ ] **Step 5: Commit the shared rendering boundary**

```bash
git add scripts/build-notes.mjs scripts/notes/render-markdown.mjs scripts/notes/site-shell.mjs tests/notes-build.test.mjs tests/site.test.mjs
git commit -m "refactor: share notes rendering pipeline"
```

---

### Task 2: Define and Validate Explicit Chapter Manifests

**Files:**

- Create: `scripts/notes/computer-organization-manifests.mjs`
- Create: `scripts/notes/computer-organization.mjs`
- Modify: `tests/notes-build.test.mjs`

**Interfaces:**

- Produces `computerOrganizationChapters`, an ordered array of six `{ number, slug, title, sourcePrefix, nodes }` objects.
- A node is `{ id, title, startLine, endLine, children }`; lines are one-based, inclusive, and a branch may omit a detail range only when its children cover its source material.
- Produces `validateManifest(chapter, source): { coveredLines: Set<number>, meaningfulLines: Set<number> }`.
- Produces `chapterSourcePath(chapter): Promise<string>` resolving exactly one top-level Markdown file.

- [ ] **Step 1: Add manifest schema and failure-mode tests**

Append tests that use a synthetic chapter and source:

```js
import { validateManifest } from "../scripts/notes/computer-organization.mjs";

test("manifest validation rejects duplicate ids, missing parents, overlap, and uncovered content", () => {
  const source = "2.1 Root\n\nDefinition\n\nFormula $x_1$\n";
  assert.throws(
    () => validateManifest({ slug: "bad", nodes: [
      { id: "same", title: "A", startLine: 1, endLine: 3, children: [] },
      { id: "same", title: "B", startLine: 3, endLine: 5, children: [] },
    ] }, source),
    /duplicate node id.*same|overlap/i,
  );
});

test("six manifests cover all meaningful source lines", async () => {
  assert.deepEqual(computerOrganizationChapters.map(({ number }) => number), [2, 3, 4, 5, 6, 7]);
  for (const chapter of computerOrganizationChapters) {
    const source = await readFile(await chapterSourcePath(chapter), "utf8");
    const { coveredLines, meaningfulLines } = validateManifest(chapter, source);
    assert.deepEqual([...coveredLines].sort((a, b) => a - b), [...meaningfulLines].sort((a, b) => a - b), chapter.slug);
  }
});
```

Meaningful lines exclude only blank lines. Image lines and standalone formulas are meaningful and must be covered.

- [ ] **Step 2: Run the manifest tests and verify they fail**

Run: `node --test --test-name-pattern="manifest" tests/notes-build.test.mjs`

Expected: FAIL because the manifest module and validator do not exist.

- [ ] **Step 3: Implement strict source discovery and validation**

Implement `chapterSourcePath` using a non-recursive directory read of the CS export root and `sourcePrefix`. It must throw when zero or multiple Markdown files match. Implement recursive node walking that checks IDs, positive integer ranges, `startLine <= endLine`, bounds, sibling/ancestor overlap, and full nonblank-line coverage. Error messages include chapter slug, node ID, and line number.

- [ ] **Step 4: Author the six explicit trees against the original source**

Use these chapter boundaries as the required top-level branches:

```js
export const computerOrganizationChapters = [
  { number: 2, slug: "data-representation-and-operations", title: "数据的表示和运算", sourcePrefix: "第二章+", sections: [["2-1", "2.1 数制与编码", 1, 80], ["2-2", "2.2 运算方法和运算电路", 81, 304], ["2-3", "2.3 浮点数的表示和运算", 305, 378]] },
  { number: 3, slug: "memory-systems", title: "存储系统", sourcePrefix: "第三章+", sections: [["3-1", "3.1 存储系统概述", 1, 102], ["3-2", "3.2 主存储器", 103, 234], ["3-4", "3.4 外部存储器", 235, 384], ["3-5", "3.5 高速缓冲存储器", 385, 468]] },
  { number: 4, slug: "instruction-set", title: "指令系统", sourcePrefix: "第四章+", sections: [["4-1", "4.1 指令系统", 1, 132], ["4-2", "4.2 指令的寻址方式", 133, 244], ["4-3", "4.3 程序的机器级代码表示", 245, 314], ["4-4", "4.4 CISC和RISC", 315, 344]] },
  { number: 5, slug: "central-processing-unit", title: "中央处理器", sourcePrefix: "第五章+", sections: [["5-1", "5.1 CPU的功能和基本结构", 1, 46], ["5-2", "5.2 指令执行过程", 47, 122], ["5-3", "5.3 数据通路的功能和基本功能", 123, 164], ["5-4", "5.4 控制器的功能和工作原理", 165, 272], ["5-5", "5.5 异常和中断机制", 273, 348], ["5-6", "5.6 指令流水线", 349, 572]] },
  { number: 6, slug: "buses", title: "总线", sourcePrefix: "第六章+", sections: [["6-1", "6.1 总线概述", 1, 116], ["6-2", "6.2 总线事务和定时", 117, 152]] },
  { number: 7, slug: "input-output-systems", title: "输入/输出系统", sourcePrefix: "第七章+", sections: [["7-2", "7.2 I/O接口", 1, 82], ["7-3", "7.3 I/O方式", 83, 240]] },
];
```

Replace each `sections` field with a `nodes` tree. Within every section, inspect the source sequentially and create child ranges at concept boundaries already present in the prose (for example Chapter 2 `进位计数制`, `真值与机器数`, `定点数的表示`, `逻辑门电路`, and `加法器`). Do not invent English titles or summaries. Assign every nonblank line exactly once to the deepest appropriate node; a title line stays in its node range so detail cards reproduce the source verbatim.

- [ ] **Step 5: Run manifest validation and inspect coverage diagnostics**

Run: `node --test --test-name-pattern="manifest|six manifests" tests/notes-build.test.mjs`

Expected: PASS for all six sources, covering 378, 468, 344, 572, 152, and 240 physical source lines with blank lines excluded from equality.

- [ ] **Step 6: Commit manifests and validation**

```bash
git add scripts/notes/computer-organization.mjs scripts/notes/computer-organization-manifests.mjs tests/notes-build.test.mjs
git commit -m "feat: map computer organization note structure"
```

---

### Task 3: Build the Course Index, Chapter Data, and Local Assets

**Files:**

- Modify: `scripts/notes/computer-organization.mjs`
- Modify: `scripts/build-notes.mjs`
- Modify: `notes/index.html`
- Modify: `tests/notes-build.test.mjs`
- Generate: `notes/computer-organization/**`

**Interfaces:**

- Produces `buildComputerOrganization({ root }): Promise<void>`.
- Chapter HTML embeds JSON in `<script type="application/json" id="mind-map-data">` with `{ id, title, depth, hasDetail, detailHtml, tags, children }`.
- Public assets live at `/notes/computer-organization/assets/<chapter-slug>/NN-image.png`.

- [ ] **Step 1: Add course-output, preservation, formula, image, and exclusion tests**

```js
test("Computer Organization builds exactly six mind-map chapters", async () => {
  await run("npm", ["run", "build:notes"], { cwd: root });
  const index = await read("notes/computer-organization/index.html");
  assert.match(index, /Computer Organization/);
  assert.equal((index.match(/class="notes-chapter"/g) ?? []).length, 6);
  assert.doesNotMatch(index, /计组大题细节注意/);

  const chapter = await read("notes/computer-organization/data-representation-and-operations/index.html");
  assert.match(chapter, /id="mind-map-data"/);
  assert.match(chapter, /整数：除基取余，先取到的“余”是低位/);
  assert.match(chapter, /class=\\?"katex-display/);
  assert.match(chapter, /\/notes\/computer-organization\/assets\/data-representation-and-operations\//);
  assert.doesNotMatch(chapter, /<article class="markdown-body">/);

  const generated = await walk(path.join(root, "notes", "computer-organization"));
  assert.equal(generated.filter((file) => file.endsWith("index.html")).length, 7);
  assert.equal(generated.filter((file) => file.endsWith(".png")).length, 91);
  assert.equal(generated.filter((file) => /计组大题|\.csv$/i.test(file)).length, 0);
});
```

- [ ] **Step 2: Run the new build test and verify it fails**

Run: `node --test --test-name-pattern="Computer Organization builds" tests/notes-build.test.mjs`

Expected: FAIL because `notes/computer-organization/index.html` does not exist.

- [ ] **Step 3: Implement node-data and detail-card generation**

For each node range, slice source lines, rewrite only referenced chapter images, and pass the slice to `renderMarkdown`. Determine tags from rendered/source content: `FORMULA` when math delimiters occur and `IMAGE` when an image is present. Escape the JSON for safe embedding by replacing `<` with `\u003c`. Pre-render root and major-section buttons outside the JSON as the no-JavaScript fallback, plus:

```html
<p class="mind-map-fallback">Interactive expansion requires JavaScript.</p>
```

Only the six source Markdown files are scanned for assets. Missing referenced assets throw with source filename and line.

- [ ] **Step 4: Generate the course/index routes and add the Notes archive row**

Invoke `buildComputerOrganization({ root })` after the Operating Systems build. Add this second archive entry to `notes/index.html`:

```html
<a class="notes-chapter" href="/notes/computer-organization/">
  <span class="notes-number">02</span>
  <span><b>Computer Organization</b><small>6 chapters · interactive mind maps</small></span>
  <span class="notes-arrow" aria-hidden="true">→</span>
</a>
```

- [ ] **Step 5: Build twice and verify deterministic output**

Run:

```bash
npm run build:notes
git diff -- notes/computer-organization > /tmp/computer-organization-first.diff
npm run build:notes
git diff -- notes/computer-organization > /tmp/computer-organization-second.diff
cmp /tmp/computer-organization-first.diff /tmp/computer-organization-second.diff
node --test tests/notes-build.test.mjs
```

Expected: `cmp` exits 0 and all Notes build tests PASS.

- [ ] **Step 6: Commit static course generation and the selected source export**

The six source files and their 91 referenced PNGs must be committed because the build is reproducible from repository contents. Explicitly exclude the unwanted CSV and its descendant directory from staging.

```bash
git add scripts/build-notes.mjs scripts/notes/computer-organization.mjs notes/index.html tests/notes-build.test.mjs notes/computer-organization
git add 'notes/CS+755cf848-063d-44c/CS+755cf848-063d-44cd-8126-c4ead1ceeebf.md'
git add notes/CS+755cf848-063d-44c/CS+755cf848-063d-44cd-8126-c4ead1ceeebf/第{二,三,四,五,六,七}章*.md
git add notes/CS+755cf848-063d-44c/CS+755cf848-063d-44cd-8126-c4ead1ceeebf/第{二,三,四,五,六,七}章*/
git diff --cached --name-only | rg '计组大题|\.csv$' && exit 1 || true
git commit -m "feat: build computer organization mind maps"
```

---

### Task 4: Implement the Pure Mind-Map State Model

**Files:**

- Create: `assets/js/mind-map-state.js`
- Create: `tests/mind-map-state.test.mjs`

**Interfaces:**

- Produces `createMapState(tree): { expanded: Set<string>, activeDetailId: string|null, transform: { x, y, scale } }`.
- Produces `toggleNode(state, tree, id)`, `openDetail(state, id)`, `closeDetail(state)`, `collapseAll(state, tree)`, `resetMap(state, tree)`, `panBy(state, dx, dy)`, and `zoomAt(state, factor, point)`.
- Scale is bounded to `0.5 <= scale <= 1.8`; default transform is `{ x: 0, y: 0, scale: 1 }`.

- [ ] **Step 1: Write state-transition tests**

```js
test("default, expansion, detail, collapse, reset, pan, and zoom transitions are deterministic", () => {
  const tree = { id: "root", children: [
    { id: "2-1", children: [{ id: "number-systems", children: [] }] },
    { id: "2-2", children: [] },
  ] };
  let state = createMapState(tree);
  assert.deepEqual([...state.expanded], ["root"]);
  state = toggleNode(state, tree, "2-1");
  assert.ok(state.expanded.has("2-1"));
  state = openDetail(state, "number-systems");
  assert.equal(state.activeDetailId, "number-systems");
  state = collapseAll(state, tree);
  assert.deepEqual([...state.expanded], ["root"]);
  assert.equal(state.activeDetailId, null);
  state = zoomAt(panBy(state, 20, -10), 10, { x: 100, y: 100 });
  assert.equal(state.transform.scale, 1.8);
  state = resetMap(state, tree);
  assert.deepEqual(state.transform, { x: 0, y: 0, scale: 1 });
});
```

- [ ] **Step 2: Run the state test and verify it fails**

Run: `node --test tests/mind-map-state.test.mjs`

Expected: FAIL because `assets/js/mind-map-state.js` is missing.

- [ ] **Step 3: Implement immutable transitions and descendant collapse**

Every function returns a new state and new `Set`. Collapsing a node removes that node and every descendant ID from `expanded`; it closes the detail only when the active detail belongs to that subtree. `openDetail` replaces the previous ID. `zoomAt` adjusts `x/y` so the supplied canvas point remains stationary while scaling.

- [ ] **Step 4: Run the state tests**

Run: `node --test tests/mind-map-state.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit the state model**

```bash
git add assets/js/mind-map-state.js tests/mind-map-state.test.mjs
git commit -m "feat: add mind map interaction state"
```

---

### Task 5: Render the Accessible Interactive Map

**Files:**

- Create: `assets/js/mind-map.js`
- Modify: `scripts/notes/computer-organization.mjs`
- Modify: `tests/notes-build.test.mjs`
- Modify: `tests/mind-map-state.test.mjs`

**Interfaces:**

- Consumes the embedded `mind-map-data`, state functions, `.mind-map-viewport`, `.mind-map-world`, `.mind-map-connectors`, and `.mind-map-nodes`.
- Node buttons use `data-node-id`, `aria-expanded` when they have children, and `aria-controls="detail-<id>"` when they have detail.
- Detail cards use `role="dialog"`, `aria-modal="false"`, an accessible name, and a close button.

- [ ] **Step 1: Add generated semantic-contract assertions**

```js
assert.match(chapter, /class="mind-map-viewport"[^>]+tabindex="0"/);
assert.match(chapter, /aria-label="Zoom in"/);
assert.match(chapter, /aria-label="Zoom out"/);
assert.match(chapter, /aria-label="Reset mind map"/);
assert.match(chapter, /aria-label="Collapse all branches"/);
assert.match(chapter, /type="module" src="\/assets\/js\/mind-map\.js"/);
assert.match(chapter, /<svg[^>]+class="mind-map-connectors"[^>]+aria-hidden="true"/);
```

Add state tests for collapsing an ancestor with the active descendant detail and for zooming below the 0.5 lower bound.

- [ ] **Step 2: Run focused tests and verify semantic failures**

Run: `node --test tests/mind-map-state.test.mjs tests/notes-build.test.mjs`

Expected: state edge tests and/or generated semantic assertions FAIL.

- [ ] **Step 3: Implement deterministic layout and connectors**

Render only visible nodes. Measure each HTML node after insertion. Lay out depths in columns with 260 px horizontal gaps and at least 24 px vertical gaps; parent `y` is centered across its visible children. Draw cubic SVG paths from the right center of a parent to the left center of each child. Set world bounds from measured nodes plus 120 px padding and keep connectors behind nodes.

- [ ] **Step 4: Implement activation and detail-card behavior**

Node activation expands/collapses children when present and opens/replaces detail when detail exists. A small dedicated expand indicator prevents ambiguity on nodes with both behaviors. Blank-viewport pointer activation closes detail. Card close and `Escape` return focus to the originating node. After opening, adjust the transform only enough to keep node and card within the viewport.

- [ ] **Step 5: Implement pan, zoom, reset, collapse, and keyboard input**

Use Pointer Events with pointer capture for panning. Ignore drag starts inside buttons, links, and detail cards. Wheel zoom requires `ctrlKey` or `metaKey` so ordinary page scrolling is retained. Control buttons call state transitions. `Enter` and `Space` activate focused node buttons; `Escape` closes detail. Apply updated transform with `translate(x, y) scale(scale)`.

- [ ] **Step 6: Run interaction and build tests**

Run: `node --test tests/mind-map-state.test.mjs tests/notes-build.test.mjs`

Expected: PASS.

- [ ] **Step 7: Commit the interactive renderer**

```bash
git add assets/js/mind-map.js assets/js/mind-map-state.js scripts/notes/computer-organization.mjs tests/mind-map-state.test.mjs tests/notes-build.test.mjs notes/computer-organization
git commit -m "feat: add interactive mind map canvas"
```

---

### Task 6: Apply the Research-Editorial Visual System and Responsive Behavior

**Files:**

- Modify: `assets/css/site.css`
- Modify: `tests/site.test.mjs`
- Modify: `tests/notes-build.test.mjs`

**Interfaces:**

- Uses existing `--notes`, `--surface`, `--surface-2`, `--line`, `--ink`, serif, sans, and mono tokens.
- Canvas classes remain those established in Task 5.

- [ ] **Step 1: Add CSS contract tests**

```js
test("mind map CSS defines canvas, nodes, cards, mobile, and reduced motion", async () => {
  const css = await read("assets/css/site.css");
  assert.match(css, /\.mind-map-viewport\s*\{[^}]*overflow:\s*hidden/s);
  assert.match(css, /\.mind-map-node--root\s*\{/);
  assert.match(css, /\.mind-map-detail\s*\{[^}]*overflow-y:\s*auto/s);
  assert.match(css, /touch-action:\s*none/);
  assert.match(css, /@media\s*\(max-width:\s*640px\)[\s\S]*\.mind-map-detail/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.mind-map/);
});
```

- [ ] **Step 2: Run the CSS contract test and verify it fails**

Run: `node --test --test-name-pattern="mind map CSS" tests/site.test.mjs`

Expected: FAIL on missing `.mind-map-*` rules.

- [ ] **Step 3: Implement desktop and theme styles**

Give the canvas `min-height: max(620px, calc(100vh - 230px))`, a one-pixel border, clipped overflow, and subtle grid. Root uses Instrument Serif and the Notes accent; section and concept buttons use dark surfaces, small radii, visible focus, and text labels for detail/FORMULA/IMAGE metadata. Active path classes brighten connectors. Detail cards cap at `min(520px, 44vw)` width and `min(680px, calc(100vh - 180px))` height, with internal scrolling, existing Markdown typography, horizontally scrollable formula blocks, and responsive images.

- [ ] **Step 4: Implement mobile and reduced-motion styles**

Below 640 px, use a canvas minimum height of `calc(100svh - 190px)`, compact node padding, a detail width of `min(88vw, 420px)`, and 40 px controls. Set `touch-action: none` only on the viewport, not the page. Under reduced motion, set node/world/card transitions and smooth behavior to effectively zero duration.

- [ ] **Step 5: Run the complete automated suite**

Run: `npm run build:notes && npm test && git diff --check`

Expected: build succeeds, all tests PASS, and `git diff --check` emits no output.

- [ ] **Step 6: Commit visual and responsive styling**

```bash
git add assets/css/site.css tests/site.test.mjs tests/notes-build.test.mjs notes/computer-organization
git commit -m "style: finish computer organization mind maps"
```

---

### Task 7: Browser QA, Content Audit, and Final Verification

**Files:**

- Modify as defects require: `scripts/notes/computer-organization-manifests.mjs`
- Modify as defects require: `assets/js/mind-map.js`
- Modify as defects require: `assets/css/site.css`
- Modify as defects require: focused test files covering each defect
- Regenerate: `notes/computer-organization/**`

**Interfaces:**

- No new public interfaces; this task verifies all acceptance criteria and corrects observed defects with regression tests.

- [ ] **Step 1: Start the static server and open the dense Chapter 5 route**

Run: `python3 -m http.server 8000`

Open: `http://127.0.0.1:8000/notes/computer-organization/central-processing-unit/`

At a desktop viewport near 1440×900, verify root plus sections 5.1–5.6 are visible, nodes do not overlap, branch toggles work, connectors meet nodes, the detail card stays associated with its source node, formulas and images render, and all four controls work.

- [ ] **Step 2: Verify mobile interaction and recovery**

At a viewport near 390×844, verify the page scrolls outside the canvas, one-finger canvas drag works, controls remain at least 40 px, the detail card remains within the viewport and scrolls internally, `Reset` recovers an off-screen map, and no page-level horizontal scrollbar appears.

- [ ] **Step 3: Verify keyboard, light theme, reduced motion, and no-JavaScript fallback**

Tab through nodes and controls, use `Enter`/`Space`, close detail with `Escape`, and confirm focus return. Switch to light theme and inspect contrast. Emulate reduced motion and confirm transitions disappear. Disable JavaScript and confirm the root, major section labels, and the interactive-requirement message remain visible.

- [ ] **Step 4: Audit all six chapter outputs and excluded content**

Run:

```bash
rg -L 'id="mind-map-data"' notes/computer-organization/*/index.html
rg -n '计组大题细节注意|2010\+739f1cc5|46f70468' notes/computer-organization && exit 1 || true
find notes/computer-organization -type f -name '*.png' | wc -l
rg -n '\$[^$]+\$' notes/computer-organization --glob 'index.html'
```

Expected: the first command prints nothing; excluded-content search prints nothing; PNG count is 91; raw-dollar search prints nothing. Manually open one chapter from each of Chapters 2–7 and sample at least one deepest detail card against its exact source lines.

- [ ] **Step 5: Add a regression test before fixing every discovered defect**

For a content omission, extend manifest coverage/preservation assertions; for an interaction defect, extend `mind-map-state.test.mjs`; for semantic or styling defects, extend the appropriate generated-output/CSS contract. Run the focused test red, implement the smallest correction, then run it green.

- [ ] **Step 6: Run fresh final verification**

```bash
npm run build:notes
npm test
git diff --check
git status --short
```

Expected: both courses build; all tests pass with zero failures; `git diff --check` has no output; status contains only intended implementation/generated changes and no excluded `计组大题细节注意` paths.

- [ ] **Step 7: Commit QA corrections if any exist**

```bash
git add scripts/notes assets/js/mind-map.js assets/css/site.css tests notes/index.html notes/computer-organization
git diff --cached --name-only | rg '计组大题|\.csv$' && exit 1 || true
git commit -m "fix: polish computer organization mind maps"
```

Skip this commit only when Step 6 confirms there are no uncommitted QA corrections.
