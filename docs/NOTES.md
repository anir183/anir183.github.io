# portfolio notes

### file structure

```
src/
├── app.d.ts
├── app.html
├── lib
│   ├── components				[ui compoenents — implemented: preloader, navbar]
│   │   ├── accent_button.svelte     [planned]
│   │   ├── preloader.svelte         [implemented]
│   │   └── navbar.svelte            [implemented]
│   ├── gsap					[all gsap related code lives here]
│   │   ├── sequences			[full gsap timeline sequences]
│   │   │   └── hero_entry.svelte.js   [implemented]
│   │   └── clips				[reusable GSAP clips/tweens]
│   │       └── stagger_wipe.svelte.js
│   ├── index.js
│   ├── sections				[individual sections]
│   │   ├── crash.svelte
│   │   ├── projects.svelte    [planned]
│   │   ├── about.svelte       [planned]
│   │   └── hero.svelte        [implemented — production]
│   └── utils					[utility functions]
│       ├── constants.svelte.js
│       ├── loading.svelte.js
│       ├── assert.svelte.js
│       └── theme.svelte.js
└── routes						[full page compositions]
	├── +error.svelte
	├── layout.css
	├── +layout.js
	├── +layout.svelte
	└── +page.svelte
```

### code architecture

code is modularised and broken into reusable components without overdoing it.
navbar, button, etc can be valid as they may have quite a bit of css and animation
logic couple with them while components like heading_text, link_button, etc
arent as they are only a couple classes added in the html.

same holds true for gsap animations. only things which are somewhat more technical
complex and reusable should be its own animation file. sequences for sections / pages
will always stay in src/lib/gsap/sequences to not pollute the svelte files. they
may include related code to the animation sequence like looping through a set of
elements.

all modules are exported from `src/lib/index.js` and imported via `$lib` (barrel
import) — not from deeper paths like `$lib/components/...` or `$lib/utils/...`.
this includes intra-lib imports (files within `src/lib/` import from `$lib` too).
note: IDE LSP may show false "no exported member" errors for `$lib` barrel imports
but `svelte-check` and `vite build` resolve them correctly.

modularisation should not be done when - it is a one time use - the code is small and managable - it doesnt make sense outside the file

### font usage

- **Unbounded** → branding, logo, title/heading texts
- **BebasNeue** → supporting texts (nav links, labels, captions)
- **Ubuntu** → readability / large body texts

### code style

always follow the latest and correct version of technologies used. this is a
static svelte site with gsap for animation. it should be suitably fast and use
the most simple implementation possible within expectation. it should be easy to
edit and modify and avoid multi-layer abstractions.

refer to docs for svelte 5.55.2, svelte kit 2.60.1 and tailwindcss 4.2.2
and do not use deprecated functionality or funtionality with a modern / better
implementation eg. prefer svelte runes over store, prefer tailwind variables over
css variables.

for tailwindcss always maintain the classes defined in src/routes/layout.css
and use them instead of adding a custom magic color etc... if a reusable style
appears in the future modify layout.css as requried

use jsdocs as much as possible within expectation.. no need to type variables
which are easily inferred... also use the custom utils/assert implememtation
whereever necessary... asserts are not necessary in gsap animations or simple
logic but probably good to have in complex logic or easily failing operations like
theme changing or complex state management etc to make sure code does not reach
unexpected states or weird edge cases

### mcp

you can use the some mcp tools for installed packages

notes from svelte mcp

```md
You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available Svelte MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.
```

### shared constants

design tokens and repeated values that cross the JS/CSS boundary live in
`src/lib/utils/constants.svelte.js`:

- `LG_BREAKPOINT` (1024) — matches Tailwind `lg` breakpoint; used in JS
- `STAGGER_FAST` (0.1) — shared stagger duration for link-line animations
- `BODY_SCROLL_LOCK` ("overflow-hidden") — CSS class used in JS for body scroll blocking

image loading is centralized in `src/lib/utils/loading.svelte.js`:

- `loadAllImages(onProgress)` — scans `document.images`, tracks per-image load progress,
  calls `onProgress(loaded/total)` after each image, returns a promise that resolves when
  all images (including cached) have loaded. Used during the preloader phase.

### code quality refactors applied

- hero.svelte intro images: 5 repeated `<div>` blocks refactored into `{#each}` loop with `imageData` array
- Tailwind v4 custom breakpoint `--breakpoint-intro: 1000px` replaces all `max-[1000px]` arbitrary values across hero.svelte
- `fadeUpTitleSubtitle` inlined into crash.svelte (single-use module per modularity rule), file deleted
- `willChange: "true"` → `willChange: "transform"` in hero_entry.svelte.js (was invalid CSS)
- magic ±1200 spread extracted as `INTRO_IMG_SPREAD` constant in hero_entry.svelte.js
- magic 500ms interval extracted as `DOT_INTERVAL_MS` constant in preloader.svelte
- hamburger animation in hero_entry.svelte.js: guarded with `window.innerWidth < 1024` (desktop skip)
- scrollY threshold raised to 10px in navbar.svelte to avoid elastic-scroll flicker
- SSE guards (`typeof` checks) added to `theme.svelte.js` for localStorage/window/document access
- `stagger_wipe.svelte.js` opts destructured in function signature (consistency with prior pattern)
- hero.svelte portrait theme comparisons: raw `'light'`/`'dark'` strings replaced with `themes.LIGHT`/`themes.DARK` constants (consistency with navbar.svelte)
- +layout.svelte inline flicker-prevention script: wrapped in `typeof` guards for localStorage/window (SSR-safe consistency with theme.svelte.js)
- loading.svelte.js cached image `onLoad()`: deferred to microtask via `Promise.resolve().then()` to prevent synchronous progress callback during `Promise.all` construction
- preloader + navbar decoupled from hero.svelte into +page.svelte: hero.svelte is now a pure content section exposing refs via `$bindable()` props (`introImgs`, `heroH1`); +page.svelte owns the loading lifecycle, preloader visibility, navbar refs, and GSAP sequence orchestration

### notes

<!-- put any notes you think may be needed to be taken into consideration again -->

- hero.bak.svelte is the original proof-of-concept; keep for reference but dont use as-is
- GSAP targets use `bind:this` refs (not CSS selectors) for reliable element capture
- child components expose refs to parent sections via `$bindable()` props (e.g., `<Navbar bind:navEl>`)
- GSAP easings: use built-in eases only (power2.out, power3.out, power4.out) — no CustomEase
- SplitText is the only GSAP bonus plugin used (dynamically imported)
- body scroll is locked only during preloader phase via `overflow-hidden` on body
- preloader always hides due to `.finally()` chain in +page.svelte
- timeline has 0.5s delay to let preloader fade-out complete before images animate
- image loading is decoupled from `heroEntrySequence` — `loadAllImages(onProgress)` runs first,
  tracks per-image progress, then hero sequence starts (images already cached)
- nav links use `resolve("/")` from `$app/paths` for base-path-agnostic hrefs
- portrait images (light/dark) use class-based `theme.current` toggling with CSS transition crossfade
- mobile hamburger: 3-span → X morph via CSS transitions (top[10→19], middle[opacity 0], bottom[28→19], rotate ±45)
- mobile menu: fly-in panel (right, 250ms, x:400) + fade backdrop, nav links centered vertically with BebasNeue, close ✕ button top-right
- mobile menu overlay is a sibling of `<nav>` (NOT inside it) so the GSAP hero sequence doesn't capture mobile links via `navEl.querySelectorAll("a")`
- navbar starts transparent (no bg/blur/border) in hero, gains glass effect on scroll (scrollY > 0) via scroll listener + conditional classes with 500ms transition

### hero_entry.svelte.js animation sequence

1. dynamic import of SplitText plugin
2. apply SplitText to nav links + hero headline (lines + mask)
3. collect `.line` elements from refs (no global CSS selectors)
4. set initial off-screen positions for all 5 intro images
5. timeline:
   - all images slide into centered fan layout (power4.out, staggered)
   - left 2 images spread left, right 2 spread right (power4.out)
   - center portrait expands to full viewport (power4.out)
   - nav lines stagger-reveal upward (power3.out)
   - theme toggle button fades in (power3.out)
   - hero headline lines stagger-reveal upward (power3.out)

### preloader

- full-viewport fixed overlay (bg-c-bg-0), z-100
- accepts `progress` prop (0-1) via `$bindable()`:
  - when defined: shows `{Math.round(progress * 100)}%`
  - when undefined: shows "Loading..." with animated dots (fallback)
- dots animation via `setInterval` in `$effect` — only runs when progress is undefined
- controlled from +page.svelte:
  1. `loadAllImages(onProgress)` tracks per-image load, calls back with progress fraction
  2. preloader shows percentage in real-time as images load
  3. when all images loaded → `heroEntrySequence` starts → `.finally()` sets `preloaderVisible = false`
  4. fade-out via svelte/fade transition (500ms)
- body overflow:hidden is applied during preloader, removed in `.finally()`
- always hides — `.finally()` runs regardless of promise resolve/reject

### ref pattern (bind:this + $bindable)

- `bind:this={el}` on the DOM element captures the ref
- child components (e.g., Navbar) use `$bindable()` to expose internal refs
- section components (e.g., Hero) use `$bindable()` to expose their internal DOM refs upward to the page
- +page.svelte owns all refs and orchestration — calls `loadAllImages()`, then `heroEntrySequence()`, manages preloader
- all refs are passed as a config object to the GSAP sequence function
- sequence accepts: introImages[], heroHeadline, navLinks[], themeButton

### roadmap

<!-- current state of the project, what has been done and what is to be done -->

[x] preloader component (basic Loading... overlay with animated dots)
[x] navbar component (fixed nav with logo, links, theme toggle)
[x] navbar — replaced "183" text link with static theme-aware SVG logo
[x] navbar — responsive: lg+ inline nav links, <lg hamburger with animated fly-in panel
[x] navbar — font-c-bebas for nav links, glass-effect backdrop-blur, accent hover
[x] hero_entry GSAP sequence (full intro animation from hero.bak, minus preloader)
[x] hero.svelte production rewrite (pure content section with $bindable() refs, preloader/navbar orchestration moved to +page.svelte)
[x] update barrel exports (index.js)
[x] consolidate all imports to use $lib barrel (no $lib/.../... paths)
[x] code quality audit: fix magic strings, deduplicate hero intro images, add SSR guards, fix invalid CSS, inline single-use modules
[x] shared constants module (src/lib/utils/constants.svelte.js): extracted LG_BREAKPOINT, STAGGER_FAST, BODY_SCROLL_LOCK
[x] loading module (src/lib/utils/loading.svelte.js): centralized `loadAllImages(onProgress)` with per-image progress tracking
[x] preloader: percentage display when progress bound, fallback Loading... dots otherwise
[x] image loading decoupled from hero_entry.svelte.js — preloader phase runs before animation sequence

[ ] projects section
[ ] about section
[ ] contact section
[ ] accent_button component
[ ] route structure for navigation
[ ] content / data files
