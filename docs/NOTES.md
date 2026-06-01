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
│   │   └── title_subtitle_fade_up.svelte.js
│   ├── index.js
│   ├── sections				[individual sections]
│   │   ├── crash.svelte
│   │   ├── projects.svelte    [planned]
│   │   ├── about.svelte       [planned]
│   │   └── hero.svelte        [implemented — production]
│   └── utils					[utility functions]
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

modularisation should not be done when
	- it is a one time use
	- the code is small and managable
	- it doesnt make sense outside the file

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

### notes
<!-- put any notes you think may be needed to be taken into consideration again -->

- hero.bak.svelte is the original proof-of-concept; keep for reference but dont use as-is
- GSAP targets use `bind:this` refs (not CSS selectors) for reliable element capture
- child components expose refs to parent sections via `$bindable()` props (e.g., `<Navbar bind:navEl>`)
- GSAP easings: use built-in eases only (power3.out, power4.out) — no CustomEase
- SplitText is the only GSAP bonus plugin used (dynamically imported)
- body scroll is locked only during preloader phase via `overflow-hidden` on body
- preloader always hides due to `try/catch/finally` in hero.svelte
- timeline has 0.5s delay to let preloader fade-out complete before images animate
- nav links use `resolve("/")` from `$app/paths` for base-path-agnostic hrefs
- portrait images (light/dark) use class-based `theme.current` toggling with CSS transition crossfade

### hero_entry.svelte.js animation sequence
1. dynamic import of SplitText plugin
2. wait for all document images to load
3. apply SplitText to nav links + hero headline (lines + mask)
4. collect `.line` elements from refs (no global CSS selectors)
5. set initial off-screen positions for all 5 intro images
6. timeline:
   - all images slide into centered fan layout (power4.out, staggered)
   - left 2 images spread left, right 2 spread right (power4.out)
   - center portrait expands to full viewport (power4.out)
   - nav lines stagger-reveal upward (power3.out)
   - theme toggle button fades in (power3.out)
   - hero headline lines stagger-reveal upward (power3.out)

### preloader
- full-viewport fixed overlay (bg-c-bg-0), z-100
- centered "Loading..." with dots cycling via setInterval in $effect
- controlled from hero.svelte: visible during image loading, fades out via svelte/fade transition
- body overflow:hidden is applied during preloader, removed in `.finally()`
- always hides — `.finally()` runs regardless of promise resolve/reject

### ref pattern (bind:this + $bindable)
- hero.svelte declares `let el = $state()` for each animated element
- `bind:this={el}` on the DOM element captures the ref
- child components (e.g., Navbar) use `$bindable()` to expose internal refs
- parent reads child refs via `bind:prop={parentVar}`
- all refs are passed as a config object to the GSAP sequence function
- sequence accepts: introImages[], heroHeadline, navLinks[], themeButton

### roadmap
<!-- current state of the project, what has been done and what is to be done -->

[x] preloader component (basic Loading... overlay with animated dots)
[x] navbar component (fixed nav with logo, links, theme toggle)
[x] hero_entry GSAP sequence (full intro animation from hero.bak, minus preloader)
[x] hero.svelte production rewrite (composing preloader + navbar + images + animation)
[x] update barrel exports (index.js)

[ ] projects section
[ ] about section
[ ] contact section
[ ] accent_button component
[ ] route structure for navigation
[ ] content / data files
