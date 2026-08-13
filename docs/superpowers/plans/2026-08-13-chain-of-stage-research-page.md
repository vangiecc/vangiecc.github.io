# Chain-of-Stage Research Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish an English presentation of Vangie's completed MemEval research project in the Research section without linking or embedding the source PDF.

**Architecture:** Keep the site's static HTML architecture. Replace the Research empty state with one semantic project row, add a standalone detail page that reuses the shared site shell and article classes, and add narrowly scoped Research accent styles. Extend the existing Node test suite to treat the new route and content as first-class site output.

**Tech Stack:** Static HTML5, existing CSS custom properties and responsive layout, Node.js built-in test runner.

## Global Constraints

- All visible project content is in English.
- The detail route is `/research/chain-of-stage-diagnosis/`.
- Do not link, embed, or expose `research/Chain_of_stage_diagnosis.pdf`.
- Use `COMPLETED` for this project's status while preserving the existing status vocabulary.
- Clearly distinguish 81.62% Stage Match from memory-system QA accuracy.
- Reuse existing typography, theme tokens, navigation, article layout, and accessibility conventions.
- Do not introduce dependencies, JavaScript interaction, decorative illustrations, gradients, or card-based layouts.

---

### Task 1: Research Route Contract

**Files:**
- Modify: `tests/site.test.mjs`
- Test: `tests/site.test.mjs`

**Interfaces:**
- Consumes: Static files at `research/index.html` and `research/chain-of-stage-diagnosis/index.html`.
- Produces: Regression coverage for the project route, required English content, results, semantics, and PDF exclusion.

- [ ] **Step 1: Replace the Research empty-state assumptions with project-index assertions**

Add a test that reads `research/index.html` and asserts:

```js
assert.match(html, />COMPLETED</);
assert.match(html, /When Do Memories Break\?/);
assert.match(html, /Chain-of-Stage Diagnosis for LLM Memory Systems/);
assert.match(html, /href="\/research\/chain-of-stage-diagnosis\/"/);
assert.doesNotMatch(html, /No entries yet\./);
assert.doesNotMatch(html, /Chain_of_stage_diagnosis\.pdf|\.pdf["?#]/i);
```

Update the collection-page loop so only Blog is still required to contain `No entries yet.`; Notes and Research now contain real entries.

- [ ] **Step 2: Add the detail-page contract**

Add a focused test that asserts the detail page has the shared navigation, Research page class, exactly one H1, a `COMPLETED` marker, `notes-layout`, `notes-toc`, and `markdown-body`. Assert the eight section IDs:

```js
for (const id of [
  "background",
  "diagnostic-framework",
  "evaluation-scope",
  "datasets",
  "experimental-results",
  "main-findings",
  "limitations",
  "conclusion",
]) assert.match(html, new RegExp(`id="${id}"`));
```

Assert the key numerical evidence `1,540`, `500`, `76.04%`, `81.62%`, `50.39%`, `50.71%`, `57.40%`, `58.31%`, `73.70%`, `86.67%`, and `87.50%`. Require explicit copy matching `not.*QA accuracy` and forbid `.pdf`, `<embed`, `<iframe`, and `<object` references.

- [ ] **Step 3: Run the tests and confirm the new contract fails**

Run:

```bash
npm test
```

Expected: FAIL because the Research index still has an empty state and the detail page does not exist.

- [ ] **Step 4: Commit the failing tests**

```bash
git add tests/site.test.mjs
git commit -m "test: define completed research page contract"
```

### Task 2: Completed Project Index

**Files:**
- Modify: `research/index.html`
- Modify: `assets/css/site.css`
- Test: `tests/site.test.mjs`

**Interfaces:**
- Consumes: Existing `.collection-page--research`, `.status-key`, and Research color token.
- Produces: A semantic full-row link to `/research/chain-of-stage-diagnosis/` and reusable `.research-project-*` presentation classes.

- [ ] **Step 1: Update the status legend**

Add this first legend item without removing the existing future-facing statuses:

```html
<span><i aria-hidden="true"></i><b>COMPLETED</b> Finished research</span>
```

- [ ] **Step 2: Replace the empty state with the completed project row**

Use a section labeled `PROJECTS` and a native full-row anchor. It contains the `COMPLETED` status, title `When Do Memories Break?`, subtitle `Chain-of-Stage Diagnosis for LLM Memory Systems`, and this summary:

```text
A stage-wise framework for locating failures across extraction, update, retrieval, and utilization in LLM memory systems.
```

- [ ] **Step 3: Add restrained index-row styles**

Add `.research-projects`, `.research-project`, `.research-project-status`, `.research-project-copy`, and `.research-project-arrow` rules. Use an unframed grid row with top and bottom borders, the existing Research accent, serif title, compact mono metadata, hover/focus background, and a 640px single-column adjustment. Do not add a border radius or card shadow.

- [ ] **Step 4: Run the index-focused tests**

Run:

```bash
node --test --test-name-pattern="research|documents contain" tests/site.test.mjs
```

Expected: Index assertions pass; detail-page assertions still fail because the new route has not been created.

- [ ] **Step 5: Commit the Research index**

```bash
git add research/index.html assets/css/site.css tests/site.test.mjs
git commit -m "feat: list completed memory research"
```

### Task 3: English Research Detail Page

**Files:**
- Create: `research/chain-of-stage-diagnosis/index.html`
- Modify: `assets/css/site.css`
- Test: `tests/site.test.mjs`

**Interfaces:**
- Consumes: Shared site header/footer markup; `.notes-layout`, `.notes-toc`, and `.markdown-body` CSS; Research index route.
- Produces: A complete, public English research presentation at `/research/chain-of-stage-diagnosis/`.

- [ ] **Step 1: Build the shared shell and project hero**

Create a static HTML document with `lang="en"`, theme bootstrap before CSS, shared navigation with Research current, theme toggle, footer, and body classes:

```html
<body class="collection-page collection-page--research research-detail">
```

Use one H1, `When Do Memories Break?`, with the subtitle and a metadata line showing `COMPLETED`, `LLM MEMORY SYSTEMS`, and `2026`.

- [ ] **Step 2: Add the table of contents and article structure**

Use `.notes-layout` with a `.notes-toc` linking to all eight required section IDs and a `.markdown-body.research-article` article. Keep heading order semantic: H1 in the hero and H2 for every article section.

- [ ] **Step 3: Write Background, Framework, Scope, and Datasets**

Explain that MemEval diagnoses an observable four-stage pipeline rather than proposing another memory architecture. Include a compact four-row table covering Extraction, Update, Retrieval, and Utilization plus their 11 subtypes. Separate memory systems, base models, and evaluator models into clearly labeled prose or lists. Report LoCoMo's 1,540 instances and LongMemEval-S's 500 instances with their roles.

- [ ] **Step 4: Write exact experimental result tables**

Include:

```text
Diagnostic consistency: 76.04% Exact Match; 81.62% Stage Match.
Per category Stage Match: Multi-hop 72.34%; Temporal 87.54%; Open-domain 71.88%; Single-hop 83.59%.
mem0 QA accuracy: GPT-4.1-mini 50.39%; GPT-4o-mini 50.71%; Qwen3.5-35B 57.40%; Qwen3.5-122B 58.31%.
Cross-architecture Stage Match: A-mem 86.67%; MemoryOS 87.50%.
OpenClaw: 73.70% QA accuracy, 1,135 correct and 405 diagnosed failures from 1,540 instances.
LongMemEval-S: 49.60% QA accuracy, 248 correct and 252 errors; 166 errors are Missing Critical Information.
```

Immediately after the diagnostic consistency table, state: `The 81.62% Stage Match measures agreement between automated diagnosis and expert annotation. It is not the QA accuracy of a memory system.`

- [ ] **Step 5: Write findings, limitations, and conclusion**

Cover extraction as the common early bottleneck, task-dependent retrieval/utilization failures, scaling shifting rather than removing failures, and the engineering value of stage-wise attribution. State the limitations: observable traces are required; automated diagnosis has upstream attribution bias; multi-hop and open-domain cases need human review; the work diagnoses but does not introduce stage-specific fixes; the A-mem/MemoryOS subset size is not reported in the main result table.

- [ ] **Step 6: Add Research-specific article accents**

Scope styles under `.research-detail` or `.research-article`: change TOC label/link emphasis, inline code, links, and blockquote border from Notes blue to the Research accent. Add compact project metadata and ensure tables remain horizontally scrollable. Preserve existing mobile behavior from `.notes-layout`.

- [ ] **Step 7: Run the focused tests**

Run:

```bash
node --test --test-name-pattern="research|documents contain" tests/site.test.mjs
```

Expected: PASS with no PDF reference and all content/route assertions satisfied.

- [ ] **Step 8: Commit the detail page**

```bash
git add research/chain-of-stage-diagnosis/index.html assets/css/site.css tests/site.test.mjs
git commit -m "feat: publish completed memory research"
```

### Task 4: Full Verification and Visual QA

**Files:**
- Verify: `research/index.html`
- Verify: `research/chain-of-stage-diagnosis/index.html`
- Verify: `assets/css/site.css`
- Verify: `tests/site.test.mjs`

**Interfaces:**
- Consumes: Completed static Research index and detail page.
- Produces: Verified desktop/mobile pages and a clean implementation commit set.

- [ ] **Step 1: Run the full automated suite**

```bash
npm test
git diff --check
```

Expected: all tests pass and `git diff --check` exits with no output.

- [ ] **Step 2: Audit route and private-PDF exclusion**

```bash
rg -n "Chain_of_stage_diagnosis\.pdf|<embed|<iframe|<object" research/index.html research/chain-of-stage-diagnosis/index.html
```

Expected: no matches.

- [ ] **Step 3: Start the local site**

```bash
python3 -m http.server 8000
```

If port 8000 is occupied, use 8001. Verify HTTP 200 for `/research/` and `/research/chain-of-stage-diagnosis/`.

- [ ] **Step 4: Perform browser visual QA**

Inspect both routes at desktop and mobile widths. Confirm one H1, no overlap, readable tables, a non-obscuring sticky TOC, visible completed status, correct theme behavior, and coherent single-column mobile flow.

- [ ] **Step 5: Review repository state**

```bash
git status --short
git log -5 --oneline
```

Expected: only the previously excluded untracked course source material remains outside the completed implementation. Do not stage it or the private PDF as part of the web-page commits.
