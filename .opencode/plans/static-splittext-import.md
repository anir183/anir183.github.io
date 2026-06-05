# Fix: Static import SplitText to eliminate cold-load race condition

## Problem
On cold load (close browser, reopen), the dynamic `await import("gsap/SplitText")` is a real network fetch. The `await` yields control, and during the yield Svelte's reactivity can process pending updates that interfere with GSAP setup. On reload (F5), the module cache serves it instantly — no yield, no race — which explains why consecutive reloads work fine.

## Changes

### `src/lib/gsap/sequences/hero_entry.svelte.js`
1. Add static import at top: `import { SplitText } from "gsap/SplitText";`
2. Remove `const { SplitText } = await import("gsap/SplitText");`
3. Remove `gsap.registerPlugin(SplitText);` (GSAP auto-registers plugins when statically imported, but verify if this is needed — if .registerPlugin is required for GSAP bonus plugins, keep it)

### `docs/NOTES.md`
- Update line 216: `bonus/plugins used (dynamically imported)` → `bonus/plugins used (statically imported in hero_entry)`

## Verification
1. `npx svelte-check` — should pass 0 errors
2. Test cold load: close browser tab, reopen site, verify hero animation plays correctly
3. Test reload: F5 multiple times, verify consistent behavior
