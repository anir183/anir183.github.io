<script>
	import { onMount, onDestroy, tick } from "svelte";
	import { gsap } from "gsap";
	import { experiences } from "$lib/utils/experiences_data.svelte.js";
	import { experiencesEntrySequence } from "$lib/gsap/sequences/experiences_entry.svelte.js";
	import { AnimatedHeading } from "$lib";

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
	let yearCleanup;

	/** @type {(() => void) | undefined} */
	let roCleanup;
	/** @type {boolean} */
	let rebuilding = false;

	$effect(() => {
		if (headingStart && mountsReady && !reducedMotion) {
			const timeout = setTimeout(() => {
				const node = nodeEls[0];
				if (node) gsap.to(node, { scale: 1, opacity: 1, duration: 0.6, ease: "power2.out" });
			}, 1200);
			return () => clearTimeout(timeout);
		}
	});

	async function initExperiences() {
		await tick();

		const parentEl = /** @type {HTMLElement | null} */ (sectionsParent?.parentElement);
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
	}

	async function rebuildExperiences() {
		if (rebuilding || !sectionsParent?.parentElement) return;
		rebuilding = true;
		try {
			cleanup?.();
			yearCleanup?.();
			mountsReady = false;
			pathSegments = [];
			nodePositions = [];
			viewBoxStr = "0 0 100 100";
			await tick();
			await initExperiences();
		} finally {
			rebuilding = false;
		}
	}

	onMount(async () => {
		await initExperiences();

		const parentEl = sectionsParent?.parentElement;
		if (!parentEl) return;

		/** @type {ReturnType<typeof setTimeout> | undefined} */
		let resizeTimer;
		const ro = new ResizeObserver(() => {
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(rebuildExperiences, 100);
		});
		ro.observe(parentEl);

		roCleanup = () => {
			clearTimeout(resizeTimer);
			ro.disconnect();
		};
	});

onDestroy(() => {
	cleanup?.();
	yearCleanup?.();
	roCleanup?.();
});
</script>

<div class="relative">
	<section id="experiences-heading" class="relative z-10 flex min-h-screen items-center px-5 max-lg:px-3">
		<div class="mx-auto w-full max-w-4xl">
			<AnimatedHeading tag="h2" start={headingStart} {reducedMotion} class="font-c-unbounded text-5xl max-sm:text-2xl font-black text-center lg:text-7xl"
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
				class="relative z-10 flex min-h-screen items-center px-5 max-lg:px-3"
			>
				<div
					bind:this={contentWraps[i]}
					class="w-full max-w-sm opacity-0 will-change-transform
						{i % 2 === 0
							? 'max-lg:mx-auto lg:ml-[10vw] lg:mr-auto'
							: 'max-lg:mx-auto lg:mr-[10vw] lg:ml-auto'
						}"
				>
				<h3 class="text-4xl font-black text-c-neutral-0 font-c-unbounded leading-tight lg:text-5xl xl:text-6xl">
					{exp.role}
				</h3>
				<div data-el="company" class="mt-1.5 flex items-baseline gap-5 flex-wrap">
					<p class="text-base font-semibold text-c-accent-0 font-c-ubuntu tracking-wide lg:text-xl">{exp.company}</p>
					<span class="shrink-0 text-base text-c-neutral-1/40 font-c-jetbrains lg:text-xl">{exp.period}</span>
				</div>
				<p data-el="desc" class="mt-5 text-xs leading-relaxed text-c-neutral-1 font-c-ubuntu lg:text-sm max-w-prose">
					{exp.description}
				</p>
				{#if exp.tags?.length}
					<div data-el="tags" class="mt-5 flex flex-wrap gap-1.5">
						{#each exp.tags as tag}
							<span class="rounded-full border border-c-accent-0/15 px-2.5 py-0.5 text-xs text-c-accent-0 font-c-ubuntu">
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
				<span data-el="year" class="block font-c-jetbrains text-[clamp(2.25rem,12vw,9.5rem)] font-black text-c-neutral-2 leading-none select-none">
					{exp.period.slice(0, 4)}
				</span>
			</div>
			</section>
		{/each}
	</div>
</div>

