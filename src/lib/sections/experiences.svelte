<script>
	import { onMount, onDestroy, tick } from "svelte";
	import { gsap } from "gsap";
	import { experiences } from "$lib/utils/experiences_data.svelte.js";
	import { experiencesEntrySequence } from "$lib/gsap/sequences/experiences_entry.svelte.js";
	import { AnimatedHeading } from "$lib";

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

	let { reducedMotion = false, headingStart = false } = $props();

	let sectionsParent = $state(/** @type {HTMLElement | undefined} */ (undefined));
	let wavePathEl = $state(/** @type {SVGPathElement | undefined} */ (undefined));
	let sectionEls = $state(/** @type {HTMLElement[]} */ ([]));
	let contentWraps = $state(/** @type {HTMLElement[]} */ ([]));
	let nodeEls = $state(/** @type {SVGCircleElement[]} */ ([]));

	let pathD = $state("");
	let viewBoxStr = $state("0 0 100 100");
	let nodePositions = $state(/** @type {{ x: number, y: number }[]} */ ([]));
	let mountsReady = $state(false);

	/** @type {(() => void) | undefined} */
	let cleanup;
	/** @type {(() => void) | undefined} */
	let dotGridCleanup;
	/** @type {(() => void) | undefined} */
	let yearCleanup;

	$effect(() => {
		if (headingStart && mountsReady && !reducedMotion) {
			const timeout = setTimeout(() => {
				const node = nodeEls[0];
				if (node) gsap.to(node, { scale: 1, opacity: 1, duration: 0.6, ease: "power2.out" });
			}, 1200);
			return () => clearTimeout(timeout);
		}
	});

	onMount(async () => {
		await tick();

		const parentEl = /** @type {HTMLElement} */ (sectionsParent?.parentElement);
		if (!parentEl) return;
		const parentWidth = parentEl.offsetWidth;
		const parentHeight = parentEl.offsetHeight;
		const isMobile = parentWidth < 1024;
		const nodeCount = experiences.length;
		if (!nodeCount) return;

		const leftX = parentWidth * 0.1;
		const rightX = parentWidth * 0.9;

		// Heading node immediately below centered header text
		/** @type {HTMLElement} */
		const headingSection = /** @type {HTMLElement} */ (parentEl.firstElementChild);
		/** @type {HTMLElement | null} */
		const headingWrapper = headingSection.querySelector(':scope > div');
		let headingNodeY = headingSection.offsetTop + headingSection.offsetHeight * 0.85;
		if (headingWrapper) {
			const wrapperRect = headingWrapper.getBoundingClientRect();
			const parentRect = parentEl.getBoundingClientRect();
			headingNodeY = wrapperRect.bottom - parentRect.top + 32;
		}
		const headingNode = {
			x: parentWidth * 0.5,
			y: headingNodeY
		};

		// Experience nodes on opposite side of text
		// Text side: even=left (ml-[10vw]), odd=right (mr-[10vw])
		// Node side: even=RIGHT, odd=LEFT
		const expNodes = [];
		for (let i = 0; i < nodeCount; i++) {
			const section = sectionEls[i];
			expNodes.push({
				x: isMobile ? parentWidth * 0.5 : (i % 2 === 0 ? rightX : leftX),
				y: section.offsetTop + section.offsetHeight / 2
			});
		}

		// Full path waypoints: heading + all experiences
		const pathPoints = [headingNode, ...expNodes];

		// Build path d string from all waypoints
		let d = "";
		for (let i = 0; i < pathPoints.length; i++) {
			if (i === 0) {
				d += `M ${Math.round(pathPoints[i].x)} ${Math.round(pathPoints[i].y)}`;
			} else {
				const prev = pathPoints[i - 1];
				const curr = pathPoints[i];
				const segLen = Math.abs(curr.x - prev.x);
				const spread = segLen * 0.4;
				const expIdx = i - 1;
				const yOff = isMobile ? window.innerHeight * 0.12 : window.innerHeight * (0.05 + 0.03 * (expIdx % 3));
				const dir = expIdx % 2 === 0 ? -1 : 1;

				const cp1x = prev.x + (curr.x > prev.x ? spread : -spread);
				const cp1y = prev.y + yOff * dir;
				const cp2x = curr.x - (curr.x > prev.x ? spread : -spread);
				const cp2y = curr.y - yOff * dir;

				d += ` C ${Math.round(cp1x)} ${Math.round(cp1y)}, ${Math.round(cp2x)} ${Math.round(cp2y)}, ${Math.round(curr.x)} ${Math.round(curr.y)}`;
			}
		}

		pathD = d;
		viewBoxStr = `0 0 ${parentWidth} ${parentHeight}`;
		nodePositions = [headingNode, ...expNodes];

		// Compute per-segment path lengths from the same control points
		/** @type {number[]} */
		const segmentLengths = [];
		if (pathPoints.length > 1) {
			const tempPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
			document.body.appendChild(tempPath);
			try {
				for (let i = 1; i < pathPoints.length; i++) {
					const prev = pathPoints[i - 1];
					const curr = pathPoints[i];
					const sLen = Math.abs(curr.x - prev.x);
					const spread = sLen * 0.4;
					const expIdx = i - 1;
					const yOff = isMobile ? window.innerHeight * 0.12 : window.innerHeight * (0.05 + 0.03 * (expIdx % 3));
					const dir = expIdx % 2 === 0 ? -1 : 1;
					const cp1x = prev.x + (curr.x > prev.x ? spread : -spread);
					const cp1y = prev.y + yOff * dir;
					const cp2x = curr.x - (curr.x > prev.x ? spread : -spread);
					const cp2y = curr.y - yOff * dir;
					const segD = `M ${Math.round(prev.x)} ${Math.round(prev.y)} C ${Math.round(cp1x)} ${Math.round(cp1y)}, ${Math.round(cp2x)} ${Math.round(cp2y)}, ${Math.round(curr.x)} ${Math.round(curr.y)}`;
					tempPath.setAttribute("d", segD);
					segmentLengths.push(tempPath.getTotalLength());
				}
			} finally {
				document.body.removeChild(tempPath);
			}
		}

		mountsReady = true;
		await tick();

		cleanup = /** @type {(() => void) | undefined} */ (await experiencesEntrySequence({
			sectionsParent: /** @type {HTMLElement} */ (sectionsParent),
			wavePath: wavePathEl,
			nodeEls: /** @type {SVGElement[]} */ (/** @type {unknown} */ (nodeEls)),
			contentWraps: /** @type {HTMLElement[]} */ (contentWraps),
			segmentLengths,
			reducedMotion
		}));

		// --- Dot grid with Perlin noise ---
		await tick();

		const dotContainer = /** @type {HTMLElement} */ (sectionsParent?.parentElement);
		if (!dotContainer) return;

		const dotGrid = document.createElement("div");
		dotGrid.className = "dot-grid";

		const noise2D = createNoise2D(42);
		const spacing = 48;
		const cw = dotContainer.offsetWidth;
		const ch = dotContainer.offsetHeight;

		/** @type {{ x: number, y: number, hoverable: boolean }[]} */
		const dots = [];
		/** @type {HTMLElement[]} */
		const dotEls = [];

		// Heading bottom → 30vh transition zone for dot fade-in
		const headingSectionEl = /** @type {HTMLElement | null} */ (dotContainer.querySelector(':scope > section'));
		const headingBottom = headingSectionEl ? headingSectionEl.offsetTop + headingSectionEl.offsetHeight * 0.65 : 0;
		const transitionEnd = headingBottom + window.innerHeight * 0.3;

		for (let x = 0; x < cw; x += spacing) {
			for (let y = spacing * 0.5; y < ch; y += spacing) {
				let yFade = 1;
				if (y < headingBottom) {
					yFade = 0;
				} else if (y < transitionEnd) {
					const t = (y - headingBottom) / (transitionEnd - headingBottom);
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
				dotGrid.appendChild(dot);
				dotEls.push(dot);
				dots.push({ x, y, hoverable });
			}
		}

		dotContainer.appendChild(dotGrid);

		// Mouse proximity
		if (!reducedMotion) {
			const radius = 150;
			const radiusSq = radius * radius;
			/** @type {number | null} */
			let rafId = null;
			const activeStates = new Array(dotEls.length).fill(false);

			/** @param {PointerEvent} e */
			function onMove(e) {
				if (rafId) return;
				rafId = requestAnimationFrame(() => {
					rafId = null;
					const rect = dotGrid.getBoundingClientRect();
					const mx = e.clientX - rect.left;
					const my = e.clientY - rect.top;
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

			window.addEventListener("pointermove", onMove);

			dotGridCleanup = () => {
				window.removeEventListener("pointermove", onMove);
				if (rafId) cancelAnimationFrame(rafId);
				dotGrid.remove();
			};
		} else {
			dotGridCleanup = () => {
				dotGrid.remove();
			};
		}

		// --- Year header SplitText + per-character backdrop blur ---
		const yearEls = document.querySelectorAll('[data-el="year"]');
		if (!reducedMotion && yearEls.length) {
			const { ScrollTrigger } = await import("gsap/ScrollTrigger");
			const { default: SplitText } = await import("gsap/SplitText");
			gsap.registerPlugin(SplitText);

			/** @type {import("gsap/ScrollTrigger").ScrollTrigger[]} */
			const triggers = [];

			yearEls.forEach((el) => {
				const split = new SplitText(el, { type: "chars" });
				gsap.set(split.chars, { y: 30, opacity: 0 });
				const st = ScrollTrigger.create({
					trigger: /** @type {HTMLElement} */ (el.closest("section")),
					start: "top 20%",
					once: true,
					onEnter: () => {
						gsap.to(split.chars, {
							y: 0,
							opacity: 1,
							duration: 1,
							stagger: 0.3,
							ease: "power2.out"
						});
					}
				});
				triggers.push(st);
			});

			yearCleanup = () => triggers.forEach((st) => st.kill());
		} else if (yearEls.length) {
			yearEls.forEach((el) => { /** @type {HTMLElement} */ (el).style.opacity = "1"; });
		}
	});

onDestroy(() => {
	cleanup?.();
	dotGridCleanup?.();
	yearCleanup?.();
});
</script>

<div class="relative">
	<section class="relative z-10 flex min-h-screen items-center px-6 pt-24 max-lg:pt-16 max-lg:px-4">
		<div class="mx-auto w-full max-w-6xl">
			<AnimatedHeading tag="h2" start={headingStart} {reducedMotion} class="font-c-unbounded text-6xl font-black text-center lg:text-8xl"
			>Experiences</AnimatedHeading>
		</div>
	</section>

	{#if mountsReady}
		<svg
			class="absolute inset-0 z-20 w-full h-full pointer-events-none"
			viewBox={viewBoxStr}
			preserveAspectRatio="xMidYMid meet"
		>
			<path
				bind:this={wavePathEl}
				d={pathD}
				fill="none"
				stroke="var(--color-c-accent-0)"
				stroke-width="3"
				stroke-opacity="0.35"
			/>
			{#each nodePositions as pos, i}
				<circle
					bind:this={nodeEls[i]}
					cx={pos.x}
					cy={pos.y}
					r="7"
					fill="var(--color-c-accent-0)"
				/>
			{/each}
		</svg>
	{/if}

	<div bind:this={sectionsParent}>
		{#each experiences as exp, i}
			<section
				bind:this={sectionEls[i]}
				id="experience-{i}"
				class="relative z-10 flex min-h-screen items-center px-6 max-lg:px-4"
			>
				<div
					bind:this={contentWraps[i]}
					class="w-full max-w-lg opacity-0 will-change-transform
						{i % 2 === 0
							? 'max-lg:mx-auto lg:ml-[10vw] lg:mr-auto'
							: 'max-lg:mx-auto lg:mr-[10vw] lg:ml-auto'
						}"
				>
				<h3 class="text-5xl font-black text-c-neutral-0 font-c-unbounded leading-tight lg:text-6xl xl:text-7xl">
					{exp.role}
				</h3>
				<div data-el="company" class="mt-2 flex items-baseline gap-6 flex-wrap">
					<p class="text-xl font-semibold text-c-accent-0 font-c-ubuntu tracking-wide lg:text-2xl">{exp.company}</p>
					<span class="shrink-0 text-xl text-c-neutral-1/40 font-c-jetbrains lg:text-2xl">{exp.period}</span>
				</div>
				<p data-el="desc" class="mt-6 text-base leading-relaxed text-c-neutral-1 font-c-ubuntu lg:text-lg max-w-prose">
					{exp.description}
				</p>
				{#if exp.tags?.length}
					<div data-el="tags" class="mt-6 flex flex-wrap gap-2">
						{#each exp.tags as tag}
							<span class="rounded-full border border-c-accent-0/15 px-3 py-1 text-sm text-c-accent-0 font-c-ubuntu">
								{tag}
							</span>
						{/each}
					</div>
				{/if}
				</div>
			<div
				class="absolute top-1/2 -translate-y-1/2 pointer-events-none z-10 hidden lg:block
					{i % 2 === 0 ? 'right-[5vw]' : 'left-[5vw]'}"
			>
				<span data-el="year" class="block font-c-jetbrains text-[clamp(3rem,15vw,12rem)] font-black text-c-neutral-2 leading-none select-none">
					{exp.period.slice(0, 4)}
				</span>
			</div>
			</section>
		{/each}
	</div>
</div>

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
		width: 2.5px;
		height: 2.5px;
		border-radius: 50%;
		background: var(--color-c-border);
		opacity: var(--dot-opacity, 0.15);
		transition: transform 1s ease, background 1s ease;
		will-change: transform;
	}
	:global(.dot-grid .dot.active) {
		transform: scale(3.5);
		background: var(--color-c-accent-0);
		opacity: 0.7;
	}
</style>
