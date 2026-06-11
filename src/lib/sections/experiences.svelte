<script>
	import { onMount, onDestroy, tick } from "svelte";
	import { gsap } from "gsap";
	import { experiences } from "$lib/utils/experiences_data.svelte.js";
	import { experiencesEntrySequence } from "$lib/gsap/sequences/experiences_entry.svelte.js";
	import { AnimatedHeading } from "$lib";

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
	});

	onDestroy(() => {
		cleanup?.();
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
			class="absolute inset-0 z-0 w-full h-full pointer-events-none"
			viewBox={viewBoxStr}
			preserveAspectRatio="xMidYMid meet"
		>
			<path
				bind:this={wavePathEl}
				d={pathD}
				fill="none"
				stroke="var(--color-c-accent-0)"
				stroke-width="2"
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
					<h3 class="text-4xl font-black text-c-neutral-0 font-c-unbounded leading-tight lg:text-5xl xl:text-6xl">
						{exp.role}
					</h3>
					<div data-el="company" class="mt-1 flex items-baseline gap-6 flex-wrap">
						<p class="text-lg font-semibold text-c-accent-0 font-c-ubuntu tracking-wide lg:text-xl">{exp.company}</p>
						<span class="shrink-0 text-lg text-c-neutral-1/40 font-c-jetbrains lg:text-xl">{exp.period}</span>
					</div>
					<p data-el="desc" class="mt-5 text-sm leading-relaxed text-c-neutral-1 font-c-ubuntu lg:text-base max-w-prose">
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
			</section>
		{/each}
	</div>
</div>
