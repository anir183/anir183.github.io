# Terminal Growth Fix

## Root Cause
The socials `<section>` uses `min-h-screen`, allowing unbounded growth. Every flex item in the chain inherits this — `min-h-0` can't help because the section itself keeps expanding. `overflow-y-auto` on the output is powerless without a definite height ancestor.

## Changes

### 1. `src/lib/sections/socials.svelte:70`
**Before:** `class="flex min-h-screen w-full flex-col lg:flex-row lg:gap-12"`
**After:** `class="flex w-full flex-col max-lg:h-screen lg:min-h-screen lg:flex-row lg:gap-12"`

On mobile (`max-lg:`), the section is exactly `100vh` — fixed height forces the flex chain to distribute a known allocation. On desktop (`lg:`), `lg:min-h-screen` preserves existing behavior.

### 2. `src/lib/sections/socials.svelte:97`
**Before:** `class="flex w-full flex-col justify-center gap-5 px-5 max-lg:py-6 bg-c-bg-0 lg:..."`
**After:** `class="flex w-full flex-col justify-center gap-5 px-5 max-lg:overflow-y-auto max-lg:py-6 bg-c-bg-0 lg:..."`

Safety net: if the panel's text overflows its flex allocation on very small viewports (<600px), the panel scrolls internally instead of being clipped.

### Already applied (keep):
- Terminal container: `max-lg:flex-1 max-lg:min-h-0`
- Inner div: `max-lg:flex-1 max-lg:min-h-0`
- Terminal wrapper: `max-lg:flex-1 max-lg:min-h-0`
- Output div: `max-lg:flex-1 max-lg:min-h-0`

## Verification
- `npx vite build` — clean
- `npx svelte-check` — 0 errors
- Desktop (`lg:`) behavior unchanged — `lg:h-[55vh]` on output, `lg:sticky` on terminal container
- Mobile terminal output scrolls instead of growing the section
- Content panel accessible on all viewport sizes
- `createSectionSnap`, `inertOffscreen`, GSAP/ScrollTrigger — unaffected
