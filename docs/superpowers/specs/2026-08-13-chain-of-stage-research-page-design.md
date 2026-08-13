# Chain-of-Stage Research Page Design

## Goal

Present Vangie's completed research project, "When Do Memories Break? Chain-of-Stage Diagnosis for LLM Memory Systems," in the Research section of the personal site. The presentation is written in English and explains the research background, evaluated systems, datasets, experimental results, and primary conclusions.

## Scope

- Replace the empty state on `/research/` with a completed-project entry.
- Add a dedicated detail page at `/research/chain-of-stage-diagnosis/`.
- Keep the source PDF private from the website: do not link to it, embed it, or expose a download control.
- Do not alter the Blog or Notes sections.

## Research Index

The Research index retains its existing hero and editorial layout. Its status legend adds `COMPLETED` alongside the existing future-facing statuses.

The first project row contains:

- Status: `COMPLETED`
- Title: `When Do Memories Break?`
- Subtitle: `Chain-of-Stage Diagnosis for LLM Memory Systems`
- A concise description identifying MemEval as a stage-wise diagnostic framework for LLM memory systems
- A full-row link to `/research/chain-of-stage-diagnosis/`

The row uses the site's existing restrained Research accent color, fine rules, serif display type, and compact metadata. It is not presented as a promotional card.

## Detail Page

The detail page follows the established site shell and article conventions:

- Shared Vangie header, navigation, theme toggle, and footer
- Research-colored project hero
- Status and concise project metadata
- Left-side `ON THIS PAGE` navigation on desktop
- Single-column flow on smaller screens
- A readable article body using the existing `markdown-body` typography

The page contains these sections:

1. `Background`
2. `Diagnostic Framework`
3. `Evaluation Scope`
4. `Datasets`
5. `Experimental Results`
6. `Main Findings`
7. `Limitations`
8. `Conclusion`

## Content Requirements

The page describes MemEval as a diagnostic framework rather than a new memory architecture. It explains the four-stage lifecycle:

- Extraction
- Update
- Retrieval
- Utilization

It summarizes the 11 failure categories without reproducing unnecessary prompt details.

The evaluation section clearly separates three roles:

- Memory systems under diagnosis: mem0, A-mem, MemoryOS, and OpenClaw
- Base models used with mem0: GPT-4.1-mini, GPT-4o-mini, Qwen3.5-35B, and Qwen3.5-122B
- Meta-evaluator models: GPT-5, DeepSeek V3.2 Exp, and GPT-4.1

The dataset section reports:

- LoCoMo: 1,540 QA instances across Multi-hop, Temporal, Open-domain, and Single-hop categories
- LongMemEval-S: 500 long-term-memory QA instances

The results include compact tables for:

- Automated diagnostic consistency: 76.04% Exact Match and 81.62% Stage Match
- Per-category diagnostic consistency
- mem0 QA accuracy across the four base models
- Cross-architecture diagnostic agreement for A-mem and MemoryOS
- OpenClaw end-to-end accuracy and diagnosed error count

The copy explicitly states that `81.62% Stage Match` measures agreement between automated diagnosis and expert annotation. It is not memory-system QA accuracy.

The main findings emphasize:

- Extraction is the most common early-stage bottleneck.
- Retrieval and utilization become important for multi-hop, temporal, and evidence-synthesis tasks.
- Larger base models shift failure distributions rather than eliminating structural weaknesses.
- End-to-end accuracy alone is insufficient for actionable memory-system engineering.
- MemEval is suited to trend-level and stage-level diagnosis, with human oversight still necessary for ambiguous cascading errors.

## Visual Design

- Reuse existing CSS tokens and site typography.
- Use the Research orange only as a restrained accent, combined with the site's neutral surfaces and text colors.
- Use unframed page sections and fine horizontal separators.
- Use tables where exact comparisons matter.
- Do not add decorative illustrations, gradients, nested cards, or oversized marketing copy.
- Keep headings compact and ensure long table content remains usable on narrow screens through responsive overflow or stacked presentation.

## Accessibility

- Use semantic headings in order.
- Provide a descriptive `aria-label` for the project list and table wrappers where needed.
- Preserve visible focus states for all links.
- Maintain readable contrast in both dark and light themes.
- Ensure the desktop table of contents does not obscure article content and becomes part of the normal flow on mobile.

## Testing

Automated tests verify that:

- `/research/` exposes the completed project and links to its detail route.
- The old empty state is removed.
- The detail page uses the shared site shell, `notes-layout`/article layout, table of contents, and `markdown-body`.
- All required research sections and key numerical results are present.
- The page distinguishes Stage Match from QA accuracy.
- Neither the Research index nor detail page links to or embeds the PDF.
- Existing navigation, accessibility, Notes, and Blog checks continue to pass.

## Out of Scope

- Publishing or linking the PDF
- Rewriting the paper itself
- Adding charts that are not already represented by exact tabular results
- Adding additional research projects
- Creating a content management system
