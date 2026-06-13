<script>
	import { onDestroy } from "svelte";
	import { browser } from "$app/environment";

	function createNoise2D(seed = 1) {
		const perm = new Uint8Array(512);
		const p = Array.from({ length: 256 }, (_, i) => i);
		let s = seed || 1;
		for (let i = 255; i > 0; i--) {
			s = (s * 16807) % 2147483647;
			const j = s % (i + 1);
			[p[i], p[j]] = [p[j], p[i]];
		}
		for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

		/** @param {number} t */
		function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
		/** @param {number} a @param {number} b @param {number} t */
		function lerp(a, b, t) { return a + t * (b - a); }
		/** @param {number} hash @param {number} x @param {number} y */
		function grad(hash, x, y) {
			const h = hash & 3;
			const u = h < 2 ? x : y;
			const v = h < 2 ? y : x;
			return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
		}

		/** @param {number} x @param {number} y */
		return function noise2D(x, y) {
			const X = Math.floor(x) & 255;
			const Y = Math.floor(y) & 255;
			const xf = x - Math.floor(x);
			const yf = y - Math.floor(y);
			const u = fade(xf);
			const v = fade(yf);
			const aa = perm[perm[X] + Y];
			const ab = perm[perm[X] + Y + 1];
			const ba = perm[perm[X + 1] + Y];
			const bb = perm[perm[X + 1] + Y + 1];
			return lerp(
				lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u),
				lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u),
				v
			);
		};
	}

	let { reducedMotion = false } = $props();

	let dotGrid = $state(/** @type {HTMLElement | undefined} */ (undefined));

	/** @type {(() => void) | undefined} */
	let cleanup;

	let cancelled = false;

	async function initDots() {
		if (!browser || cancelled) return;

		const grid = document.createElement("div");
		grid.className = "dot-grid";

		const noise2D = createNoise2D(42);
		const spacing = 38;
		const cw = window.innerWidth;
		const ch = dotGrid?.offsetHeight ?? window.innerHeight;

		const fadeStart = window.innerHeight * 0.65;
		const fadeEnd = fadeStart + window.innerHeight * 0.3;

		/** @type {{ x: number, y: number, hoverable: boolean }[]} */
		const dots = [];
		/** @type {HTMLElement[]} */
		const dotEls = [];

		const fragment = document.createDocumentFragment();
		let count = 0;

		for (let x = 0; x < cw; x += spacing) {
			for (let y = spacing * 0.5; y < ch; y += spacing) {
				let yFade = 1;
				if (y < fadeStart) {
					yFade = 0;
				} else if (y < fadeEnd) {
					const t = (y - fadeStart) / (fadeEnd - fadeStart);
					yFade = t * t * (3 - 2 * t);
				}
				const n = noise2D(x * 0.01, y * 0.01);
				const opacity = (0.3 + (n + 1) * 0.5 * 0.45) * yFade;
				if (opacity < 0.01) continue;
				const hoverable = opacity >= 0.3;
				const dot = document.createElement("div");
				dot.className = "dot";
				dot.style.left = x + "px";
				dot.style.top = y + "px";
				dot.style.setProperty("--dot-opacity", String(opacity));
				fragment.appendChild(dot);
				dotEls.push(dot);
				dots.push({ x, y, hoverable });
				count++;

				if (count % 500 === 0) {
					await new Promise(r => setTimeout(r, 0));
					if (cancelled) return;
				}
			}
		}

		if (cancelled) return;
		grid.appendChild(fragment);
		dotGrid?.appendChild(grid);

		if (!reducedMotion) {
			const radius = 120;
			const radiusSq = radius * radius;
			/** @type {number | null} */
			let rafId = null;
			const activeStates = new Array(dotEls.length).fill(false);
			/** @type {PointerEvent | null} */
			let lastEvent = null;

			/** @param {PointerEvent} e */
			function onMove(e) {
				lastEvent = e;
				scheduleProximityCheck();
			}

			function scheduleProximityCheck() {
				if (rafId) return;
				rafId = requestAnimationFrame(() => {
					rafId = null;
					if (!lastEvent) return;
					const rect = grid.getBoundingClientRect();
					const mx = lastEvent.clientX - rect.left;
					const my = lastEvent.clientY - rect.top;
					for (let i = 0; i < dotEls.length; i++) {
						if (!dots[i].hoverable) continue;
						const dx = dots[i].x - mx;
						const dy = dots[i].y - my;
						const active = dx * dx + dy * dy < radiusSq;
						if (active !== activeStates[i]) {
							activeStates[i] = active;
							dotEls[i].classList.toggle("active", active);
						}
					}
				});
			}

			function onLeave() {
				lastEvent = null;
				if (rafId) {
					cancelAnimationFrame(rafId);
					rafId = null;
				}
				for (let i = 0; i < dotEls.length; i++) {
					if (!dots[i].hoverable) continue;
					if (activeStates[i]) {
						activeStates[i] = false;
						dotEls[i].classList.remove("active");
					}
				}
			}

			window.addEventListener("pointermove", onMove, { passive: true });
			document.documentElement.addEventListener("pointerleave", onLeave);
			window.addEventListener("scroll", scheduleProximityCheck, { passive: true });

			/** @param {PointerEvent} e */
			function onOut(e) {
				if (!e.relatedTarget) onLeave();
			}
			document.addEventListener("pointerout", onOut);
			window.addEventListener("blur", onLeave);

			cleanup = () => {
				window.removeEventListener("pointermove", onMove);
				document.documentElement.removeEventListener("pointerleave", onLeave);
				window.removeEventListener("scroll", scheduleProximityCheck);
				document.removeEventListener("pointerout", onOut);
				window.removeEventListener("blur", onLeave);
				if (rafId) cancelAnimationFrame(rafId);
				grid.remove();
			};
		} else {
			cleanup = () => {
				grid.remove();
			};
		}
	}

	function rebuildDots() {
		cancelled = true;
		cleanup?.();
		cancelled = false;
		initDots();
	}

	$effect(() => {
		if (dotGrid) {
			const raf = requestAnimationFrame(() => {
				initDots();
			});
			const ro = new ResizeObserver(() => rebuildDots());
			ro.observe(dotGrid);
			return () => {
				cancelAnimationFrame(raf);
				cleanup?.();
				ro.disconnect();
			};
		}
	});

	onDestroy(() => {
		cleanup?.();
	});
</script>

<div bind:this={dotGrid} class="dot-grid-wrapper"></div>

<style>
	:global(.dot-grid) {
		position: absolute;
		inset: 0;
		pointer-events: none;
		overflow: hidden;
		z-index: 0;
	}
	:global(.dot-grid .dot) {
		position: absolute;
		width: 2px;
		height: 2px;
		border-radius: 50%;
		background: var(--color-c-border);
		opacity: var(--dot-opacity, 0.15);
		transition: transform 0.4s ease, background 0.1s ease, opacity 0.4s ease;
	}
	:global(.dot-grid .dot.active) {
		transition: transform 0.1s ease, background 0.1s ease, opacity 0.1s ease;
		transform: scale(2);
		background: var(--color-c-accent-0);
		opacity: 0.15;
	}
	.dot-grid-wrapper {
		position: absolute;
		inset: 0;
		z-index: 0;
		pointer-events: none;
	}
</style>
