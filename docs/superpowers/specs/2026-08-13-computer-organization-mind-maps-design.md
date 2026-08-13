# Computer Organization Mind Maps Design

## Purpose

Publish Vangie's exported notes for **Computer Organization** as one interactive mind map per chapter. The maps must preserve the source material while replacing conventional long-form chapter pages with a spatial, progressively disclosed knowledge structure.

## Scope

Publish only these six top-level Markdown files from `notes/CS+755cf848-063d-44c/CS+755cf848-063d-44cd-8126-c4ead1ceeebf/`:

1. 第二章：数据的表示和运算
2. 第三章：存储系统
3. 第四章：指令系统
4. 第五章：中央处理器
5. 第六章：总线
6. 第七章：输入／输出系统

Do not publish or copy `计组大题细节注意`, its CSV file, or any Markdown pages beneath its directory. The source export remains untouched.

## Information Architecture

- Add a `Computer Organization` course entry to `/notes/`.
- Add a course index at `/notes/computer-organization/`.
- Give each of the six chapters its own route beneath `/notes/computer-organization/`.
- The course index uses the existing Notes visual system and lists the six chapters in numeric order.
- A chapter page contains the shared site header, chapter identification, the mind-map canvas and its controls. It has no conventional article body, table of contents or separate reading panel.

## Source Structure and Content Fidelity

The Notion export contains few stable Markdown heading or list markers. Meaningful hierarchy is often expressed only by line order, numbering and prose conventions. Fully automatic hierarchy inference would produce unreliable parent-child relationships.

Each chapter therefore receives an explicit structure manifest. The manifest identifies node titles, parent-child relationships and the source ranges belonging to each detail node. It contains structural metadata only; it does not rewrite or summarize the author's notes.

The build process reads the original Markdown ranges and renders them into detail cards. Detail content preserves the source wording and supports:

- paragraphs and emphasis;
- lists and block quotes;
- tables;
- KaTeX formulas;
- locally copied images;
- supported attachments if a selected chapter refers to one.

When a source segment cannot be assigned safely, the build must report its chapter and source location rather than silently discard it. Structural manifests must cover all meaningful content in each of the six selected Markdown files.

## Mind Map Model

Each page presents one chapter as one mind map:

- The central root node is the chapter name.
- The first visible branches are the major numbered sections, such as `2.1` and `2.2`.
- Lower levels represent concepts and sub-concepts from the explicit chapter manifest.
- Branch nodes use concise titles already present in the source.
- Leaf and concept nodes may own a detail card containing their complete assigned source material.

Initial page state shows the root and major numbered sections. Lower branches are collapsed. Refreshing restores this default state; expanded state is not persisted.

## Interaction

- Clicking a collapsed branch node expands its immediate children.
- Clicking an expanded branch node collapses that subtree.
- Clicking a node with detail content opens a card next to that node. The card remains visually connected to its node.
- A second activation or the card's close control closes the detail card.
- Clicking blank canvas closes the active detail card without changing branch expansion.
- Only one detail card is open at a time, preventing overlapping reading surfaces.
- The canvas supports panning and bounded zooming.
- Controls provide `Zoom in`, `Zoom out`, `Reset` and `Collapse all`.
- `Reset` restores default zoom, position and branch expansion.
- `Collapse all` returns to the root and major numbered sections while retaining the current viewport unless necessary to keep the map visible.

Keyboard users can focus every node and control. `Enter` and `Space` activate nodes. `Escape` closes an open detail card. Focus returns to the originating node when its card closes.

## Layout and Rendering

Use a deterministic, locally rendered tree layout rather than a remote mind-map service. The implementation may use a small client-side layout/interaction module, but all content, styles, fonts, images and formula assets remain self-hosted and GitHub Pages compatible.

Branches expand horizontally from the central root. Node dimensions participate in layout so labels do not overlap. Opening a detail card triggers a local relayout or viewport adjustment that keeps the source node and card visible. Connectors are SVG paths positioned behind accessible HTML nodes and cards.

The map must remain usable when JavaScript fails: the page exposes the root and major section labels plus a clear message that interactive expansion requires JavaScript. No source content is fetched from a remote service at runtime.

## Visual Design

The map extends the existing dark research/editorial style:

- Root node: large serif chapter title with the Notes blue accent.
- Major section nodes: bordered dark surfaces with visible section numbers.
- Deeper concept nodes: smaller surfaces and restrained monospace metadata where useful.
- Connectors: low-contrast blue-gray; the active path uses the Notes accent.
- Nodes with details show a small textual or iconographic signal with an accessible label.
- Optional `FORMULA` and `IMAGE` metadata indicate rich detail content without relying on color.
- Geometry uses the site's one-pixel borders and small radii.
- Detail cards use the existing Notes typography and surface tokens. Long text wraps, formulas can scroll horizontally, and images retain their aspect ratio.

Both dark and light themes use the established site tokens. Motion is limited to short branch and card transitions; reduced-motion mode removes those transitions.

## Responsive Behavior

Desktop and tablet display the full pannable map canvas. Mobile retains the same mind-map model rather than becoming a list:

- single-finger drag pans the canvas;
- zoom buttons remain available and touch targets are at least 40 px;
- browser page scrolling remains possible outside the canvas;
- detail cards are clamped to the viewport and may use most of the screen width;
- long cards scroll internally while the underlying map position remains stable;
- a reset control provides recovery if the map is moved off-screen.

The canvas has a useful minimum height based on the viewport and does not cause page-level horizontal overflow.

## Build Architecture

Extend the existing static Notes build instead of creating an unrelated application:

1. Keep shared Markdown normalization, asset copying, KaTeX rendering, theme shell and escaping behavior reusable between courses.
2. Introduce Computer Organization course metadata and six explicit chapter manifests.
3. Convert each manifest plus source ranges into static node data and pre-rendered detail HTML.
4. Generate the course index and six chapter shells.
5. Load one local mind-map interaction module on chapter routes.
6. Copy only assets referenced by the selected chapter Markdown files.

Generated pages and assets are committed so GitHub Pages can serve them directly.

## Error Handling

The build fails with actionable messages when:

- a selected source Markdown file or referenced image is missing;
- a manifest source range is invalid or overlaps incompatibly;
- a node ID is duplicated;
- a parent node does not exist;
- meaningful source content is left uncovered;
- formula rendering encounters an unrecoverable error.

Non-fatal unsupported Markdown remains readable as escaped text inside its detail card and produces a build warning.

## Testing

Automated tests cover:

- the course index and all six routes;
- complete exclusion of `计组大题细节注意` and its descendants from generated output;
- initial presence of root and major-section nodes;
- unique node IDs and valid parent references;
- manifest coverage of selected source material;
- preservation of representative original Chinese prose;
- KaTeX output for representative formulas;
- correct copying and rewriting of representative images;
- accessible labels and keyboard-operable nodes and controls;
- local-only CSS, scripts, fonts and image references;
- no page-level horizontal overflow rules and reduced-motion styles.

Interaction tests exercise expand, collapse, open detail, close detail, zoom, reset and collapse-all behavior at the state-model level. Visual browser checks cover at least one dense desktop chapter and one mobile layout.

## Acceptance Criteria

1. `/notes/` and the course pages use `Computer Organization` as the sole course name; no parallel Chinese course label is displayed.
2. The course index exposes exactly the six selected chapters in order.
3. Each chapter route presents one interactive mind map and no conventional chapter article below it.
4. Initial state shows only the chapter root and major numbered sections.
5. Nodes expand and collapse progressively, and detail cards appear next to their originating nodes.
6. Detail cards preserve the assigned original wording, formulas and images without summarization.
7. All meaningful content from the six selected top-level chapter Markdown files is represented by the manifests.
8. `计组大题细节注意`, its CSV and all descendant pages are absent from public output.
9. Maps can be panned, zoomed, reset and collapsed on desktop and mobile.
10. Keyboard and reduced-motion users can operate the complete map.
11. The generated site is static, self-hosted and compatible with GitHub Pages.
12. Existing Operating Systems Notes continue to build and render without regression.
