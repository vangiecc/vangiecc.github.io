# Vangie Personal Homepage Design

## Purpose

Build a small personal publishing site for Vangie with three distinct content areas:

- **Blog** for essays, opinions, and observations.
- **Notes** for learning notes, references, and working knowledge.
- **Research** for questions, experiments, and research progress.

The first release should establish the visual identity, navigation, and content structure without introducing a content management system or advanced discovery features.

## Design Direction

The site takes inspiration from the NameRank research microsite without copying its page composition. It combines editorial typography with the restrained visual language of a scientific instrument:

- Large serif display type for identity and section titles.
- Neutral sans-serif type for prose and navigation.
- Monospace type for dates, indexes, states, and compact metadata.
- A dark, cool background with a subtle grid and noise texture.
- Fine borders, minimal shadows, and 2-3 px corner radii.
- Sparse, semantic accent colors instead of decorative gradients.
- Long-form editorial layouts rather than a grid of promotional cards.

The name **Vangie** is the strongest first-viewport signal. The site does not use a portrait, hero illustration, decorative orbs, or a marketing-style feature section.

## Information Architecture

The initial site contains four routes:

| Route | Purpose |
| --- | --- |
| `/` | Identity, current interests, entry points, and recent updates |
| `/blog/` | Chronological essays and viewpoints |
| `/notes/` | Learning notes organized by subject |
| `/research/` | Research projects and progress records |

All routes share the same header, theme control, content width, background treatment, and footer.

Individual post, note, subject, and research-detail routes are outside the first implementation. All three collections use explicit empty states, and the implementation must not fabricate representative content merely to demonstrate navigation.

## Shared Header

The header remains visible at the top of the viewport and uses a translucent background, subtle blur, and a one-pixel bottom border.

- Left: a small phosphor-green status dot followed by `Vangie`, linking to `/`.
- Right: numbered links `01 Blog`, `02 Notes`, and `03 Research`.
- Final control: an icon-only light/dark theme toggle with an accessible label and tooltip.
- The active collection link receives a quiet surface background and brighter text.

On narrow screens, the full collection names `Blog`, `Notes`, and `Research` remain visible. The numeric prefixes are hidden below approximately 720 px to preserve space.

## Home Page

### Hero

The hero is a two-column layout on desktop and one column on small screens.

The left column contains:

- Monospace kicker: `FIELD NOTES / IDEAS / ONGOING WORK`.
- Large serif heading: `Vangie`.
- Editorial statement:

  `Writing down what I think, what I learn, and what I'm trying to understand.`

- A restrained command link labeled `Explore the archive` that scrolls to the collection entries.

The right column contains a bordered `CURRENTLY` readout with three rows:

- `Writing -`
- `Learning -`
- `Researching -`

The dash is an intentional empty state and can later be replaced with live content. The panel should look like a compact status instrument, not a biography card.

### Collection Entries

Blog, Notes, and Research appear as three full-width horizontal entry rows rather than three floating cards. Each entire row is clickable.

Each entry contains:

- A monospace index: `01`, `02`, or `03`.
- A serif collection title.
- A short description.
- An empty-state line: `No entries yet.`
- A right-aligned destination label and arrow.

Descriptions:

- Blog: `Essays, opinions, and observations.`
- Notes: `Learning notes, references, and working knowledge.`
- Research: `Questions, experiments, and research progress.`

Hovering a row introduces a subtle secondary-surface background, strengthens the border, and moves the arrow a few pixels to the right. The row must not change dimensions.

### Recent Section

A compact `RECENTLY` section follows the collection entries. Its initial state reads `No entries yet.` Once content exists, it can show the latest items across all three collections in reverse chronological order.

## Collection Pages

### Blog

Header:

- Index: `01 / BLOG`
- Title: `Ideas and observations.`
- Description: `Essays about technology, work, and things worth thinking through.`

Content is a reverse-chronological list. A populated row contains publication date, serif title, and a one- or two-line summary. The initial page uses a clear empty state and no fabricated example posts.

### Notes

Header:

- Index: `02 / NOTES`
- Title: `Things I'm learning.`
- Description: `Concise notes, references, and incomplete understanding.`

Content is organized by subject. A populated subject row contains its name and note count; an expanded or linked subject contains notes ordered by most recent update. The first release does not include backlinks, a knowledge graph, or full-text search.

### Research

Header:

- Index: `03 / RESEARCH`
- Title: `Questions under investigation.`
- Description: `Experiments, findings, and records of work in progress.`

Content is organized by project. A populated row contains a status, title, current question or hypothesis, and last-updated date. Supported statuses are `ACTIVE`, `EXPLORING`, and `ARCHIVED`. Statuses use typography and subtle color, not oversized badges.

## Footer

The footer uses a top rule and contains:

- Left: `GitHub`, `Email`, and `RSS` links.
- Right: `© 2026 Vangie`.

Links without final destinations should be omitted rather than using dead `#` links. The year may be generated from the current date.

## Visual System

### Typography

- Display and section headings: `Instrument Serif`, regular and italic.
- Body and interface text: `Instrument Sans Variable`, weights 400-700.
- Metadata and controls: `JetBrains Mono Variable`, weights 400-600.
- Fallbacks must keep the serif, sans-serif, and monospace roles intact.
- Body size begins near 17 px with approximately 1.6 line height.
- Display text uses tight line height but must remain legible and free from clipping.
- Letter spacing is zero for general text. Monospace uppercase metadata may use positive tracking.

### Dark Theme

| Token | Value | Role |
| --- | --- | --- |
| Background | `#080a10` | Main canvas |
| Surface | `#0d1017` | Readouts and interactive rows |
| Raised surface | `#12161f` | Hover and selected states |
| Primary text | `#eef1f8` | Titles and important values |
| Secondary text | `#aab3c7` | Body copy |
| Muted text | `#6f7a92` | Labels and metadata |
| Blog | `#46e0b0` | Blog identity and general signal |
| Notes | `#5a97e0` | Notes identity |
| Research | `#d98a2b` | Research identity |

Borders use low-opacity cool blue-gray values. Stronger borders remain below the contrast of body text.

### Light Theme

The light theme uses a warm paper-like background around `#efece3`, dark neutral text, and darker variants of the three semantic accents. It is designed independently for readable contrast rather than produced by CSS inversion.

### Background and Geometry

- A faint 34 px grid is visible most strongly near the top and fades down the page.
- A very subtle noise texture prevents the large dark field from looking flat.
- Main content width is approximately 1180 px; wide header content may reach 1360 px.
- Horizontal gutters are responsive from approximately 18 px to 56 px.
- Borders are one pixel; corner radii are 2-3 px.
- No page section should be presented as a floating outer card.
- Cards are reserved for the `CURRENTLY` readout or future repeated content that genuinely needs a frame.

## Interaction and Motion

- Theme preference persists in local storage.
- The theme is applied before first paint to prevent a flash of the wrong theme.
- Focus states use a clear two-pixel accent outline and sufficient offset.
- Entry-row and link transitions last approximately 140-180 ms.
- Initial content may fade in and rise no more than 14 px over approximately 600-700 ms.
- `prefers-reduced-motion` disables smooth scrolling and effectively removes transitions and animations.
- Icon-only controls have accessible names and tooltips.

## Responsive Behavior

- The hero becomes single-column below approximately 960 px.
- Collection rows preserve their reading order and become vertically stacked internally when needed.
- Dates and metadata may wrap above titles on small screens.
- The header never causes horizontal scrolling; numeric navigation prefixes can disappear below approximately 720 px.
- Touch targets are at least 40 px in each dimension.
- Long titles and URLs wrap without overlapping adjacent content.
- Fixed-format controls receive stable dimensions so hover, focus, and dynamic text do not shift the layout.

## Content and Data Model

The initial design requires only lightweight collection metadata:

- Shared: title, summary, date, and optional slug.
- Blog: publication date.
- Notes: subject and updated date.
- Research: status, current question, and updated date.

The implementation may store content in Markdown or framework-native content files. The choice should follow the existing repository or the smallest static-site setup selected during planning. No remote database, authentication, or admin interface is required.

## Accessibility and Semantics

- Use semantic landmarks: header, nav, main, section, and footer.
- Each page has one descriptive `h1`; heading levels do not skip.
- All interactive collection rows are real links and work without JavaScript.
- Theme colors meet WCAG AA contrast for normal text.
- Color never carries collection or research-status meaning by itself; text labels remain present.
- Empty states are exposed as text, not only visual punctuation.

## First-Release Scope

Included:

- Home page and three collection routes.
- Shared navigation and footer.
- Dark and light themes.
- Responsive layouts and accessible interaction states.
- Empty states for all content areas.
- Visual identity based on editorial research publishing.

Excluded:

- Search, filtering, pagination, comments, analytics, and subscriptions.
- A CMS, remote content API, or database.
- Tags beyond the Notes subject grouping.
- Knowledge graphs, backlinks, or related-content algorithms.
- Elaborate charts, canvas effects, or decorative media.
- Fabricated personal content or placeholder links.

## Acceptance Criteria

1. The site exposes working routes for Home, Blog, Notes, and Research.
2. Vangie is the dominant first-viewport identity on desktop and mobile.
3. The home page provides obvious, full-row links to all three collections.
4. Every route has a usable empty state without fake entries.
5. Dark and light themes render without a first-paint flash and persist across navigation.
6. The design uses the specified serif, sans-serif, and monospace roles consistently.
7. Blog, Notes, and Research retain green, blue, and amber semantic identities without relying on color alone.
8. The site has no horizontal overflow or overlapping text at common mobile and desktop widths.
9. Keyboard navigation exposes visible focus states and reaches every link and control.
10. Reduced-motion preferences are respected.
11. The visual treatment remains recognizably inspired by a research instrument while presenting a personal archive rather than imitating NameRank's data content.
