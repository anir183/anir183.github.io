<script>
	import { onMount } from "svelte";

	let { headingSelector = "", headingFade = 0.65, headingTransition = undefined } = $props();

	/**
	 * @param {number} [seed]
	 * @returns {(x: number, y: number) => number}
	 */
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

		return (/** @type {number} */ x, /** @type {number} */ y) => {
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
			return lerp(lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u),
				lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u), v);
		};
	}

	/** @type {number} */
	const DOT_CHUNK = 200;
	let containerEl = $state(/** @type {HTMLElement | undefined} */ (undefined));

	onMount(() => {
		if (!containerEl) return;
		let cancelled = false;
		const el = containerEl;
		const noise2D = createNoise2D(42);
		const spacing = 38;
		let cw = 0;
		let currentCh = 0;
		let headingBottom = 0;
		let transitionEnd = 0;

		/** @param {{ x: number, y: number, opacity: number }[]} data */
		function createChunks(data) {
			let idx = 0;
			function chunk() {
				if (cancelled) return;
				const end = Math.min(idx + DOT_CHUNK, data.length);
				for (; idx < end; idx++) {
					const d = data[idx];
					const dot = document.createElement("div");
					dot.className = "dot";
					dot.style.left = d.x + "px";
					dot.style.top = d.y + "px";
					dot.style.setProperty("--dot-opacity", String(d.opacity));
					el.appendChild(dot);
				}
				if (idx < data.length) {
					requestAnimationFrame(chunk);
				}
			}
			requestAnimationFrame(chunk);
		}

		/** @param {number} fromY @param {number} toY */
		function generateDots(fromY, toY) {
			const dotData = [];
			const firstRow = Math.ceil(fromY / spacing);
			for (let x = 0; x < cw; x += spacing) {
				for (let y = firstRow * spacing + spacing * 0.5; y < toY; y += spacing) {
					let yFade = 1;
					if (headingSelector && y < headingBottom) {
						yFade = 0;
					} else if (headingSelector && y < transitionEnd) {
						const t = (y - headingBottom) / (transitionEnd - headingBottom);
						yFade = t * t * (3 - 2 * t);
					}
					const n = noise2D(x * 0.01, y * 0.01);
					const opacity = (0.3 + (n + 1) * 0.5 * 0.45) * yFade;
					if (opacity < 0.01) continue;
					dotData.push({ x, y, opacity });
				}
			}
			if (dotData.length) createChunks(dotData);
		}

		const initRaf = requestAnimationFrame(() => {
			if (cancelled) return;
			cw = el.offsetWidth;
			currentCh = el.offsetHeight;

			if (headingSelector) {
				const headingEl = /** @type {HTMLElement | null} */ (document.querySelector(headingSelector));
				if (headingEl) {
					headingBottom = headingEl.offsetTop + headingEl.offsetHeight * headingFade;
					const tLen = headingTransition !== undefined ? headingTransition : window.innerHeight * 0.3;
					transitionEnd = headingBottom + tLen;
				}
			}

			generateDots(0, currentCh);
		});

		/** @type {ReturnType<typeof setTimeout> | undefined} */
		let resizeTimer;
		const ro = new ResizeObserver(() => {
			if (cancelled) return;
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(() => {
				const newW = el.offsetWidth;
				const newH = el.offsetHeight;
				if (newW !== cw) {
					cw = newW;
					currentCh = 0;
					el.innerHTML = "";
					generateDots(0, newH);
					currentCh = newH;
				} else if (newH > currentCh) {
					generateDots(currentCh, newH);
					currentCh = newH;
				}
			}, 100);
		});
		ro.observe(el);

		return () => {
			cancelled = true;
			cancelAnimationFrame(initRaf);
			clearTimeout(resizeTimer);
			ro.disconnect();
		};
	});
</script>

<div bind:this={containerEl} class="dot-grid"></div>

<style>
	.dot-grid {
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
	}
</style>
