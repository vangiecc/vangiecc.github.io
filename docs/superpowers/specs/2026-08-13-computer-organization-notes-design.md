# Computer Organization Notes Design

## Purpose

Publish Vangie's **Computer Organization** notes using the same article-based structure, visual system, and reading experience as the existing Operating Systems archive.

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

- `/notes/` contains a `Computer Organization` course entry.
- `/notes/computer-organization/` lists the six chapters in numeric order.
- Each chapter has an independent route under `/notes/computer-organization/`.
- Course and chapter pages use `Computer Organization` as the sole course name.
- Chinese chapter titles and all Chinese source content remain unchanged.

## Course Index

The course index matches `/notes/operating-systems/`:

- a Notes hero with course identity and short description;
- chapter and section statistics;
- six full-width chapter links;
- chapter number, English display title, Chinese source title, section count, and arrow;
- shared site header, theme control, background, content width, and footer.

## Chapter Pages

Each chapter page matches the Operating Systems chapter layout:

- hero containing chapter number, `COMPUTER ORGANIZATION`, English display title, and Chinese source title;
- sticky `ON THIS PAGE` navigation on the left;
- complete article content on the right;
- generated anchors for numbered source sections such as `5.1` through `5.6`;
- responsive single-column layout on small screens;
- no mind-map canvas, nodes, connectors, detail cards, zoom controls, pan gestures, or JavaScript-only content interaction.

## Source Parsing

The Computer Organization export uses plain numbered lines rather than Markdown heading markers. During the build, a standalone numbered section line matching `N.N title` becomes a level-three heading. False internal markers such as the standalone `2.1` and `2.2` lines inside Chapter 2 are not treated as top-level sections unless they include a title and match the chapter's declared section boundaries.

All remaining Markdown is rendered in source order. The build preserves:

- original prose without summarization or rewriting;
- emphasis, lists, block quotes, and tables;
- KaTeX formulas;
- all 91 referenced PNG images;
- original ordering and relationships between text, formulas, and images.

Notion indentation is normalized using the same shared renderer as Operating Systems so prose is not misclassified as code.

## Visual Design

Computer Organization reuses the existing Operating Systems Notes classes and tokens rather than introducing a separate visual language:

- `notes-hero`, `notes-layout`, `notes-toc`, and `markdown-body`;
- Instrument Serif headings, Instrument Sans prose, and JetBrains Mono metadata;
- Notes blue accent, one-pixel borders, small radii, and dark/light themes;
- identical formula, image, table, code, quote, link, and responsive rules.

No Computer Organization-specific UI styling is required beyond content metadata when the existing shared classes are sufficient.

## Build Architecture

Extend the shared static Notes pipeline:

1. Keep common Markdown normalization, image rewriting, KaTeX rendering, shell generation, heading IDs, and table-of-contents markup reusable.
2. Define six Computer Organization chapter records with source prefixes, route slugs, English titles, Chinese titles, and valid numbered section markers.
3. Copy only images referenced by the selected six Markdown files.
4. Convert declared numbered section lines to Markdown headings before rendering.
5. Generate the course index and six article pages.
6. Commit generated HTML and local assets for direct GitHub Pages serving.

The mind-map state module, renderer, CSS rules, tests, and generated mind-map markup are removed because they no longer serve any published route.

## Error Handling

The build fails with an actionable message when:

- a selected Markdown file is missing or ambiguous;
- a declared numbered section marker is absent;
- a referenced image is missing;
- a generated heading ID is duplicated unexpectedly;
- formula rendering encounters an unrecoverable error.

The excluded `计组大题细节注意` material is never scanned or copied.

## Testing

Automated tests verify:

- the course index and all six chapter routes;
- exactly six chapter links in the correct order;
- chapter pages use `notes-layout`, `notes-toc`, and `markdown-body`;
- representative section headings receive stable IDs and appear in `ON THIS PAGE`;
- representative original Chinese prose is preserved;
- representative KaTeX formulas render without raw dollar delimiters;
- exactly 91 PNG assets are copied and their URLs are rewritten;
- no CSV or `计组大题细节注意` content enters generated output;
- no mind-map markup, scripts, controls, fallback text, or CSS remains;
- all existing Operating Systems tests continue to pass.

## Acceptance Criteria

1. `/notes/` links to `Computer Organization`.
2. `/notes/computer-organization/` lists exactly Chapters 2–7 in numeric order.
3. Each chapter page has the same article layout and visual treatment as an Operating Systems chapter page.
4. Every chapter has a functional left-side `ON THIS PAGE` navigation built from its declared numbered sections.
5. Complete source content is presented in original order without summarization.
6. Formulas, images, emphasis, lists, tables, and quotes use the shared Notes rendering styles.
7. All 91 selected images are local and no CSV is published.
8. `计组大题细节注意` and its descendants are absent from generated output.
9. Mind-map code, markup, styling, controls, and fallback messages are removed.
10. The static site remains compatible with GitHub Pages and existing Operating Systems output has no regression.
