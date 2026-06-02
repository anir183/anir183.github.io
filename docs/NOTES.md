# portfolio notes

### file structure

```
src/
├── app.d.ts
├── app.html
├── lib
│   ├── components				[ui compoenents]
│   │   ├── accent_button.svelte       [planned]
│   │   ├── animated_heading.svelte    [implemented]
│   │   ├── cube_grid.svelte           [implemented]
│   │   ├── preloader.svelte           [implemented]
│   │   └── navbar.svelte              [implemented]
│   ├── gsap					[all gsap related code lives here]
│   │   ├── sequences			[full gsap timeline sequences]
│   │   │   ├── cube_grid.svelte.js    [implemented]
│   │   │   └── hero_entry.svelte.js   [implemented]
│   │   └── clips				[reusable GSAP clips/tweens]
│   │       └── stagger_wipe.svelte.js
│   ├── index.js
│   ├── sections				[individual sections]
│   │   ├── crash.svelte
│   │   ├── projects.svelte    [implemented]
│   │   ├── about.svelte       [planned]
│   │   └── hero.svelte        [implemented]
│   └── utils					[utility functions]
│       ├── constants.svelte.js
│       ├── loading.svelte.js
│       ├── projects_data.svelte.js
│       ├── assert.svelte.js
│       └── theme.svelte.js
└── routes						[full page compositions]
	├── +error.svelte
	├── layout.css
	├── +layout.js
	├── +layout.svelte
	├── +page.svelte
	└── projects/
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

- +page.svelte scroll lock timing: `preloaderVisible = false` moved into the `.then()` before `tl.then()` wait — preloader hides as soon as hero sequence setup finishes (gsap.set positions everything), while timeline plays with its 0.5s delay (preloader fades out over this period); scroll lock still held until timeline completes
- layout.css: `body.overflow-hidden` hardened with `position: fixed; inset: 0; width: 100%; height: 100%` to prevent any scroll bypass
- cube_grid.svelte: replaced `bind:this={tileEls[i]}` with `data-tile-index={i}` + `querySelectorAll("[data-tile-index]")` — eliminates Svelte 5 $state proxy quirks with indexed array binding
- cube_grid.svelte: removed `getImageDimensions()` cache and cover math from `paintFaces` — `new Image().naturalWidth` was often 0 at onMount time (images not loaded yet), caching fallback 1×1 dimensions and corrupting background-position for all subsequent renders; reverted to simple stretch-to-fill (safe for 3:2 placeholder images in 16:9 grid)
- cube_grid.svelte paintFaces: added aspect-ratio-aware background sizing (cover-style via `new Image().naturalWidth/Height`, computed offset per tile) — images no longer stretch, they fill the grid while maintaining intrinsic aspect
- cube_grid.svelte: removed `overflow-hidden` from `.cube-grid` to prevent cube corners being clipped during breathing rotation
- cube_grid.svelte: breathing no longer killed/restarted during tile flips — breathing tweens animate z/rotationZ while flip tweens animate rotationY, different properties so GSAP handles both simultaneously without conflict (avoids jarring snap-to-zero mid-transition)
- cube_grid.svelte: dynamic square tile computation — removed `cols`/`rows` props, internal `$state` computed from container dimensions via `computeGridDimensions()` (target ~144 tiles, `sqrt(N * aspect)` formula to keep each tile square). `onMount` → `computeGridDimensions()` → `await tick()` → build `tileMeta`. `GRID_COLS`/`GRID_ROWS` constants removed from projects_data (no longer referenced anywhere)
- cube_grid.svelte: paintFaces cover math restored — reads image dimensions from preloaded `<img>` elements via `findImageElement()` (iterates `document.querySelectorAll("img")`, compares `getAttribute("src")`). Computes cover-style `bgW`/`bgH` with centered offset per tile. No more image stretching
- cube_grid.svelte: initial paint race condition fix — `getImageDimensions()` returns `null` (not `{w:1,h:1}`) when image not loaded. `onMount` calls `ensureImageLoaded(activeImage)` (awaits `load` event on preloaded `<img>`) before painting. `startBreathing()` runs immediately (doesn't need images). `transitionTo` path unaffected (images guaranteed loaded by user interaction time)
- cube_grid.svelte.js staggerRotateTiles: `from: "center"` → `from: "random"`, `amount: 0.5`, `duration: 1.2` → `0.9` — faster, random-order flips
- projects.svelte: cube grid container changed to 16:9 `aspect-video w-full max-h-[62vh] max-w-[85%] lg:max-w-[90%]` (bigger, rectangle)
- projects.svelte: "Projects" heading `text-4xl lg:text-5xl` → `text-5xl lg:text-7xl`
- projects.svelte: project name font `font-c-unbounded` → `font-c-ubuntu`
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
- preloader + navbar decoupled from hero.svelte into +page.svelte: hero.svelte is now a pure content section exposing refs via `$bindable()` props (`introImgs`); +page.svelte owns the loading lifecycle, preloader visibility, navbar refs, and GSAP sequence orchestration
- `AnimatedHeading` component introduced with ScrollTrigger character-stagger animation (`x: 100, opacity: 0, skewX: 20` → stagger-reveal on enter); used by projects section heading (hero retains its own inline h1)
- cube_grid.svelte: side faces (rotateY ±90°, rotateX ±90°) removed — only front+rear faces kept for image flip; at 1px cube depth, side faces were invisible edges causing dark artifacts during rotation
- projects.svelte: cube grid container changed from stretch-to-fill to centered fixed square box (`aspect-square` constrained by `min(55vh,55vw)`)
- projects.svelte mobile overlay: uses `max-lg:` variants on single DOM structure — zero desktop class changes. Grid panel `max-lg:static max-lg:h-screen` (overrides `sticky bottom-0 h-[50vh]`). List panel `max-lg:absolute bottom-0 left-0 z-10 ...` (overlays bottom-left with `c-bg-0` gradient). CubeGrid container `max-lg:h-full max-lg:aspect-auto max-lg:max-h-none max-lg:max-w-none` (fills viewport). All `lg:` classes untouched.
- projects.svelte mobile: heading moved to `top-0 left-0` with `bg-gradient-to-b from-c-bg-0/90 via-c-bg-0/60 to-transparent` for readability. CTA moved to `bottom-8 right-6` with `max-lg:absolute`. Desktop AnimatedHeading wrapped in `max-lg:hidden`. Grid panel padding increased `p-4` → `p-12`. Removed `GRID_COLS`/`GRID_ROWS` import and CubeGrid props (CubeGrid computes dynamically internally).
- navbar.svelte: border flash fix — `border-b` always present, color transitions between `border-transparent` ↔ `border-c-border/20` (prevents 0→1px discontinuity during 500ms transition)
- layout.css: `body.overflow-hidden` selector hardened with `!important`, `overscroll-behavior: none`, `touch-action: none` — prevents touch/wheel scroll bypass during preloader phase
- full codebase audit (batch 1): removed unused static assets (pfp_cutout.png, sun_dark.svg, moon_light.svg, logo_light.png, logo_dark.png); removed dead `GRID_COLS`/`GRID_ROWS` exports; fixed barrel import extensions (.svelte → .svelte.js); replaced animated_heading if-chain with `<svelte:element>`; fixed loading.svelte.js img.onload → addEventListener({ once: true }); simplified theme.svelte.js initTheme conditionals; fixed crash.svelte $state refs; disabled `svelte/no-navigation-without-resolve` eslint rule (cannot validate hash-link concatenation); added `prefers-reduced-motion` query in layout.css; added `role="status"` + `aria-live="polite"` on preloader; changed `aria-selected`→`aria-pressed` on project buttons (buttons don't support aria-selected); added "← Go Home" link on error page

### notes

<!-- put any notes you think may be needed to be taken into consideration again -->

<!-- hero.bak.svelte removed — original proof-of-concept, no longer needed -->

- GSAP targets use `bind:this` refs (not CSS selectors) for reliable element capture
- child components expose refs to parent sections via `$bindable()` props (e.g., `<Navbar bind:navEl>`)
- GSAP easings: use built-in eases only (power2.out, power3.out, power4.out) — no CustomEase
- SplitText and ScrollTrigger are GSAP bonus/plugins used (dynamically imported)
- body scroll is locked during preloader+hero animation phase via `overflow-hidden` on body (hardened in layout.css with `!important position: fixed inset: 0 width: 100% height: 100% overscroll-behavior: none touch-action: none`); lock is released in `.finally()` only after `tl.then()` resolves (timeline finished playing, not just created)
- preloader always hides due to `.finally()` chain in +page.svelte
- timeline has 0.5s delay to let preloader fade-out complete before images animate
- image loading is decoupled from `heroEntrySequence` — `loadAllImages(onProgress)` runs first,
  tracks per-image progress, then hero sequence starts (images already cached)
- nav links use `resolve("/")` from `$app/paths` for base-path-agnostic hrefs
- portrait images (light/dark) use class-based `theme.current` toggling with CSS transition crossfade
- mobile hamburger: 3-span → X morph via CSS transitions (top[10→19], middle[opacity 0], bottom[28→19], rotate ±45)
- mobile menu: fly-in panel (right, 250ms, x:400) + fade backdrop, nav links centered vertically with BebasNeue, close ✕ button top-right
- mobile menu overlay is a sibling of `<nav>` (NOT inside it) so the GSAP hero sequence doesn't capture mobile links via `navEl.querySelectorAll("a")`
- hero GSAP SplitText targets only nav links (not logo): selector narrowed to `navEl.querySelectorAll(":scope > div:first-of-type a")` — excludes the logo `<a>` element to prevent logo text corruption
- nav link hrefs use `sectionUrl(name)` helper: Projects → `resolve("/") + "#projects"`, others → `resolve("/")` (only Projects has a section with matching `id`)
- Escape key on mobile panel: registered via `window.addEventListener("keydown", handler)` inside `$effect` (non-focusable backdrop elements can't receive keyboard events); panel ref auto-focuses on open for accessible dismiss
- navbar starts transparent (no bg/blur/border) in hero, gains glass effect on scroll (scrollY > 10) via scroll listener + conditional classes with 500ms transition; `border-b` always present to prevent border flash (color transitions transparent ↔ visible)

### hero_entry.svelte.js animation sequence

1. dynamic import of SplitText plugin
2. apply SplitText to nav links (lines + mask)
3. collect `.line` elements from refs (no global CSS selectors)
4. set initial off-screen positions for all 5 intro images
5. set nav lines off-screen (y: 125%)
6. timeline:
   - all images slide into centered fan layout (power4.out, staggered)
   - left 2 images spread left, right 2 spread right (power4.out)
   - center portrait expands to full viewport (power4.out)
   - nav lines stagger-reveal upward (power3.out)
   - theme toggle button fades in (power3.out)

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
- hero.svelte no longer exposes `introImgs` via `$bindable()` — refs collected via `document.querySelectorAll(".intro-img")` in +page.svelte `onMount`
- +page.svelte owns all refs and orchestration — calls `loadAllImages()`, then `heroEntrySequence()`, manages preloader
- all refs are passed as a config object to the GSAP sequence function
- sequence accepts: introImages[], navLinks[], themeButton

### cube grid

- CSS 3D cube grid (`cube_grid.svelte`): `display: grid` with `transform-style: preserve-3d` per tile
- each tile: front face (image), rear face (flipped image via `rotateY(180deg)`), no side faces (removed to avoid dark edge artifacts at 1px depth)
- tiles are row-major order (`{#each tileIndices as i (i)}`); `tileMeta` built in `onMount` via `querySelectorAll("[data-tile-index]")` (avoids Svelte 5 $state proxy quirks with indexed `bind:this`)
- `paintFaces(image, face)` computes tile dimensions from `getBoundingClientRect()`, sets `background-size/-position` to reconstruct the full image across the grid with cover math (reads image dimensions from preloaded `<img>` elements, constrains by narrower axis, centers the overflow)
- GSAP stagger: `staggerRotateTiles()` in `cube_grid.svelte.js` uses GSAP stagger grid with `from: "random"`, rotates each tile 180° on `rotationY`, `power4.inOut` easing, 0.9s duration, `amount: 0.5`
- reveal queue: `transitionTo(image)` state machine — if currently animating, queues the image and processes on completion; alternates between painting front/rear face so next image is pre-painted on the hidden face before rotation
- breathing idle animation: random Z offset (-20 to 60px), random duration (1.5–3s), yoyo repeat, random stagger delay (0–2s) — no longer killed during flip transitions (breathing tweens z/rotationZ, flip tweens rotationY — different GSAP properties, no conflict)
- dynamic square tiles: `computeGridDimensions()` measures container, solves `cols/rows = aspect` with target ~144 tiles so each cell is always square regardless of viewport shape. `GRID_COLS`/`GRID_ROWS` removed. Runs in `onMount` before building `tileMeta`
- container: mobile — `h-full w-full max-lg:p-12 max-lg:h-screen` (fills viewport, 3rem inset); desktop — `max-w-[90%] max-h-[80vh]` centered with `lg:pr-16` right spacing
- `firstEffectRun` guard reads `activeImage` into local before early return to ensure Svelte 5 dependency tracking
- `paintFaces` sign fix: `background-position` formula uses `-(col*w + offsetX)` (not `-(col*w - offsetX)`) — col 0 correctly shows `-offsetX` (image shifted left) instead of `+offsetX` (wrong crop direction)
- project images preloaded via hidden `<img>` elements in `projects.svelte` (picked up by `document.images` in `loadAllImages`)

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
[x] AnimatedHeading component — reusable scroll-triggered character-stagger heading with SplitText + ScrollTrigger (x: 100, opacity: 0, skewX: 20 → stagger-reveal on enter); hero headline migrated to use it

[x] projects section (cube grid with image flip reveal, GSAP stagger, breathing idle animation)
[x] /projects detail page (card grid layout from projects_data)
[x] preloader scroll lock hardening (!important, overscroll-behavior, touch-action, position:fixed)
[x] scroll lock timing: tl.then() waits for hero animation to complete before unlocking
[x] navbar border flash fix (always-on border-b, color transitions only)
[x] cube grid: remove side faces (dark edge artifacts at 1px depth)
[x] cube grid: contained in max-w-[90%] max-h-[80vh] box with lg:pr-16 right spacing
[x] cube grid: breathing not killed during flip transitions (different GSAP properties — no conflict)
[x] cube grid: random stagger instead of center wave, shorter duration (0.9s), amount 0.5
[x] cube grid: pre-allocated tileEls array to fix first-row tile duplication bug
[x] cube grid: dynamic square tiles (cols/rows computed from container aspect ratio, ~144 target, always square)
[x] cube grid: cover math restored (images zoom+crop instead of stretch, read from preloaded img elements)
[x] cube grid: firstEffectRun guard reads activeImage before early return for Svelte 5 dep tracking
[x] cube grid: paintFaces sign fix (col 0 correctly shows -offsetX instead of +offsetX)
[x] projects section: mobile overlay improvements — heading top-left with gradient, CTA bottom-right, grid padding increased to p-12
[x] projects section: heading bigger (5xl→7xl lg), project name font-c-ubuntu
[x] projects section: mobile gradient changed from to-t (bottom-up) to to-tr (bottom-left→top-right 45°) with higher intensity
[x] projects section: desktop grid panel lg:pr-16 / list panel lg:pl-16 for balanced spacing
[ ] about section
[ ] social section
[ ] accent_button component
[ ] route structure for navigation
[ ] content / data files
