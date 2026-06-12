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
	let sectionEls = $state(/** @type {HTMLElement[]} */ ([]));
	let contentWraps = $state(/** @type {HTMLElement[]} */ ([]));
	let nodeEls = $state(/** @type {SVGCircleElement[]} */ ([]));

	let pathSegments = $state(/** @type {string[]} */ ([]));
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

		// Heading node immediately below centered header text
		/** @type {HTMLElement} */
		const headingSection = /** @type {HTMLElement} */ (parentEl.firstElementChild);
		/** @type {HTMLElement | null} */
		const headingWrapper = headingSection.querySelector(':scope > div');
		let headingNodeY = headingSection.offsetTop + headingSection.offsetHeight * 0.85;
		if (headingWrapper) {
			const wrapperRect = headingWrapper.getBoundingClientRect();
			const parentRect = parentEl.getBoundingClientRect();
			headingNodeY = wrapperRect.bottom - parentRect.top + 26;
		}
		const headingNode = {
			x: parentWidth * 0.5,
			y: headingNodeY
		};

		// Experience nodes on opposite side of text
		// Text side: even=left (ml-[10vw]), odd=right (mr-[10vw])
		// Node side: even=RIGHT, odd=LEFT
		nodePositions = [headingNode];

		/** @type {number[]} */
		let segmentLengths = [];

		if (isMobile) {
			const parentRect = parentEl.getBoundingClientRect();
			const cx = parentWidth * 0.5;
			const pad = 32;

			// Node positions: heading + top_i for all, bot_i except last — all centered
			let prevY = headingNodeY;
			for (let i = 0; i < nodeCount; i++) {
				const cr = contentWraps[i].getBoundingClientRect();
				const topY = cr.top - parentRect.top - pad;
				const botY = cr.bottom - parentRect.top + pad;
				nodePositions.push({ x: cx, y: topY });
				if (i < nodeCount - 1) {
					nodePositions.push({ x: cx, y: botY });
				}
				// Visible segment: prevY → topY (heading→top_0, or bot_{i-1}→top_i)
				pathSegments.push(`M ${Math.round(cx)} ${Math.round(prevY)} L ${Math.round(cx)} ${Math.round(topY)}`);
				segmentLengths.push(Math.abs(topY - prevY));
				prevY = botY;
			}
		} else {
			const parentRect = parentEl.getBoundingClientRect();
			const pad = 32;
			for (let i = 0; i < nodeCount; i++) {
				const yearEl = sectionEls[i].querySelector('[data-el="year"]');
				if (yearEl) {
					const yearRect = yearEl.getBoundingClientRect();
					const cx = yearRect.left + yearRect.width / 2 - parentRect.left;
					const topY = yearRect.top - parentRect.top - pad;
					const botY = yearRect.bottom - parentRect.top + pad;
					nodePositions.push({ x: cx, y: topY });
					if (i < nodeCount - 1) {
						nodePositions.push({ x: cx, y: botY });
					}
				}
			}

			// Visible segments: odd-indexed pairs in nodePositions:
			// 0→1 = heading→top_0, 2→3 = bot_0→top_1, 4→5 = bot_1→top_2, ...
			if (nodePositions.length > 1) {
				const tempPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
				document.body.appendChild(tempPath);
				try {
					for (let i = 1; i < nodePositions.length; i += 2) {
						const prev = nodePositions[i - 1];
						const curr = nodePositions[i];
						const expIdx = i - 1;
						const segLen = Math.abs(curr.x - prev.x);
						const spread = segLen * 0.4;
						const dir = expIdx % 2 === 0 ? -1 : 1;

						let s = (expIdx * 127 + 42) % 2147483647;
						s = (s * 16807) % 2147483647;
						const rY = s / 2147483647;
						s = (s * 16807) % 2147483647;
						const rX1 = s / 2147483647;
						s = (s * 16807) % 2147483647;
						const rX2 = s / 2147483647;

						const yMul = 0.7 + 0.6 * rY;
						const baseYOff = window.innerHeight * 0.064;
						const yOff = baseYOff * yMul;
						const xRandScale = 0.04;
						const xOff1 = (rX1 * 2 - 1) * parentWidth * xRandScale;
						const xOff2 = (rX2 * 2 - 1) * parentWidth * xRandScale;

						let cp1x = prev.x + (curr.x > prev.x ? spread : -spread) + xOff1;
						let cp2x = curr.x - (curr.x > prev.x ? spread : -spread) + xOff2;
						cp1x = Math.max(0, Math.min(parentWidth, cp1x));
						cp2x = Math.max(0, Math.min(parentWidth, cp2x));

						const cp1y = prev.y + yOff * dir;
						const cp2y = curr.y - yOff * dir;

						const segD = `M ${Math.round(prev.x)} ${Math.round(prev.y)} C ${Math.round(cp1x)} ${Math.round(cp1y)}, ${Math.round(cp2x)} ${Math.round(cp2y)}, ${Math.round(curr.x)} ${Math.round(curr.y)}`;
						pathSegments.push(segD);

						tempPath.setAttribute("d", segD);
						segmentLengths.push(tempPath.getTotalLength());
					}
				} finally {
					document.body.removeChild(tempPath);
				}
			}
		}

		viewBoxStr = `0 0 ${parentWidth} ${parentHeight}`;

		mountsReady = true;
		await tick();

		// Collect path elements for entry sequence
		/** @type {SVGPathElement[]} */
		const wavePaths = /** @type {SVGPathElement[]} */ (Array.from(parentEl.querySelectorAll('[data-path-seg]')));

		// Pass only heading + top nodes to entry sequence for standard activation
		/** @type {SVGElement[]} */
		const activationNodeEls = /** @type {SVGElement[]} */ (nodeEls.filter((_, idx) => idx === 0 || idx % 2 === 1));

		// Hide bottom nodes before entry sequence (entry sequence won't handle them)
		for (let i = 0; i < nodeCount - 1; i++) {
			const el = nodeEls[2 + 2 * i];
			if (el) gsap.set(el, { scale: 0, opacity: 0 });
		}

		cleanup = /** @type {(() => void) | undefined} */ (await experiencesEntrySequence({
			sectionsParent: /** @type {HTMLElement} */ (sectionsParent),
			wavePaths,
			nodeEls: activationNodeEls,
			contentWraps: /** @type {HTMLElement[]} */ (contentWraps),
			segmentLengths,
			reducedMotion
		}));

		// Bottom node activation on scroll
		if (reducedMotion) {
			for (let i = 0; i < nodeCount - 1; i++) {
				const el = nodeEls[2 + 2 * i];
				if (el) gsap.set(el, { scale: 1, opacity: 1 });
			}
		} else {
			const { ScrollTrigger } = await import("gsap/ScrollTrigger");
			/** @type {import("gsap/ScrollTrigger").ScrollTrigger[]} */
			const bottomTriggers = [];
			for (let i = 0; i < nodeCount - 1; i++) {
				const section = sectionEls[i];
				const botIdx = 2 + 2 * i;
				const st = ScrollTrigger.create({
					trigger: section,
					start: "top 20%",
					once: true,
					onEnter: () => {
						const el = nodeEls[botIdx];
						if (el) gsap.to(el, { scale: 1, opacity: 1, duration: 1.2, ease: "power2.out" });
					}
				});
				bottomTriggers.push(st);
			}
			const prevCleanup = cleanup;
			cleanup = () => {
				prevCleanup?.();
				bottomTriggers.forEach((st) => st.kill());
			};
		}

		// --- Dot grid with Perlin noise ---
		await tick();

		const dotContainer = /** @type {HTMLElement} */ (sectionsParent?.parentElement);
		if (!dotContainer) return;

		const dotGrid = document.createElement("div");
		dotGrid.className = "dot-grid";

		const noise2D = createNoise2D(42);
		const spacing = 38;
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
					const rect = dotGrid.getBoundingClientRect();
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

			dotGridCleanup = () => {
				window.removeEventListener("pointermove", onMove);
				document.documentElement.removeEventListener("pointerleave", onLeave);
				window.removeEventListener("scroll", scheduleProximityCheck);
				document.removeEventListener("pointerout", onOut);
				window.removeEventListener("blur", onLeave);
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
				gsap.set(split.chars, { y: 24, opacity: 0 });
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
	<section id="experiences-heading" class="relative z-10 flex min-h-screen items-center px-6 max-lg:px-4">
		<div class="mx-auto w-full max-w-6xl">
			<AnimatedHeading tag="h2" start={headingStart} {reducedMotion} class="font-c-unbounded text-6xl max-sm:text-3xl font-black text-center lg:text-8xl"
			>Experiences</AnimatedHeading>
		</div>
	</section>

	{#if mountsReady}
		<svg
			class="absolute inset-0 z-20 w-full h-full pointer-events-none"
			viewBox={viewBoxStr}
			preserveAspectRatio="xMidYMid meet"
		>
			{#each pathSegments as d, i}
				<path d={d} data-path-seg={i}
					fill="none" stroke="var(--color-c-accent-0)"
					stroke-width="2.5" stroke-opacity="0.35"
				/>
			{/each}
			{#each nodePositions as pos, i}
				<circle
					bind:this={nodeEls[i]}
					cx={pos.x}
					cy={pos.y}
					r="5.6"
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
		width: 2px;
		height: 2px;
		border-radius: 50%;
		background: var(--color-c-border);
		opacity: var(--dot-opacity, 0.15);
		transition: transform 1s ease, background 1s ease;
		will-change: transform;
	}
	:global(.dot-grid .dot.active) {
		transform: scale(2);
		background: var(--color-c-accent-0);
		opacity: 0.5;
	}
</style>
