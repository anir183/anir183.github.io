<script>
	import { onMount, tick } from "svelte";
	import { experiences } from "$lib/utils/experiences_data.svelte.js";
	import { experiencesEntrySequence } from "$lib/gsap/sequences/experiences_entry.svelte.js";
	import { AnimatedHeading } from "$lib";

	let { reducedMotion = false } = $props();

	let sectionEl = $state(/** @type {HTMLElement | undefined} */ (undefined));
	let wavePathEl = $state(/** @type {SVGPathElement | undefined} */ (undefined));
	let cardEls = $state(/** @type {HTMLElement[]} */ ([]));
	let nodeEls = $state(/** @type {SVGCircleElement[]} */ ([]));

	let waveD = $state("");
	let viewBox = $state("0 0 100 100");
	let nodePositions = $state(/** @type {number[][]} */ ([]));
	let mountsReady = $state(false);

	onMount(async () => {
		await tick();
		const el = /** @type {HTMLElement} */ (sectionEl);
		if (!el) return;
		const rect = el.getBoundingClientRect();
		const width = rect.width;
		const height = rect.height;
		if (!width || !height) return;

		const isMobile = width < 1024;
		const amp = isMobile ? 0 : Math.min(width * 0.06, 50);
		const centerX = width / 2;
		const numCards = experiences.length;
		const padding = 100;

		const step = 150;
		let d = "";
		for (let i = 0; i <= step; i++) {
			const t = i / step;
			const y = padding + (height - padding * 2) * t;
			const phase = t * Math.PI * (numCards + 1);
			const x = centerX + amp * Math.sin(phase);
			d += (i === 0 ? "M" : " L") + `${Math.round(x)},${Math.round(y)}`;
		}
		waveD = d.trim();
		viewBox = `0 0 ${width} ${height}`;

		const positions = [];
		for (let i = 0; i < numCards; i++) {
			const t = i / (numCards - 1 || 1);
			const y = padding + (height - padding * 2) * t;
			const phase = t * Math.PI * (numCards + 1);
			const x = centerX + amp * Math.sin(phase);
			positions.push([Math.round(x), Math.round(y)]);
		}
		nodePositions = positions;

		mountsReady = true;
		await tick();

		experiencesEntrySequence({
			sectionEl: /** @type {HTMLElement} */ (sectionEl),
			wavePath: wavePathEl,
			nodeEls: /** @type {SVGElement[]} */ (/** @type {unknown} */ (nodeEls)),
			cardEls: /** @type {HTMLElement[]} */ (cardEls),
			reducedMotion
		});
	})
</script>

<div class="relative max-lg:px-4">
	<div class="mx-auto max-w-6xl px-6 pt-36 max-lg:px-0">
		<AnimatedHeading tag="h2" start={true} {reducedMotion} class="font-c-unbounded text-6xl font-black lg:text-8xl">Experiences</AnimatedHeading>
	</div>

	<div bind:this={sectionEl} class="relative mx-auto max-w-6xl px-6 pb-20 max-lg:px-0">
		<svg
			class="pointer-events-none absolute left-0 top-0 h-full w-full"
			{...{ viewBox }}
			preserveAspectRatio="xMidYMid meet"
		>
			<path
				bind:this={wavePathEl}
				d={waveD}
				fill="none"
				stroke="var(--color-c-accent-0)"
				stroke-width="2"
				stroke-opacity="0.3"
			/>
			{#if mountsReady}
				{#each nodePositions as [cx, cy], i}
					<circle
						bind:this={nodeEls[i]}
						{cx}
						{cy}
						r="5"
						fill="var(--color-c-accent-0)"
					/>
				{/each}
			{/if}
		</svg>

		{#each experiences as exp, i}
			<div
				class="flex items-center py-20 max-lg:justify-center max-lg:py-12 {i % 2 === 0 ? '' : 'flex-row-reverse'}"
			>
				<div
					bind:this={cardEls[i]}
					class="w-[45%] rounded-2xl border border-c-border/10 bg-c-bg-1/40 p-6 opacity-0 backdrop-blur-sm transition-shadow hover:shadow-lg hover:shadow-c-accent-0/5 max-lg:w-full max-lg:max-w-lg"
				>
					<div class="flex items-start justify-between gap-3">
						<div>
							<h3 class="text-xl font-bold text-c-neutral-0 max-lg:text-lg">
								{exp.role}
							</h3>
							<p class="mt-1 text-sm text-c-accent-0">{exp.company}</p>
						</div>
						<span class="shrink-0 whitespace-nowrap text-xs text-c-neutral-1/60">{exp.period}</span>
					</div>
					<p class="mt-3 text-sm leading-relaxed text-c-neutral-1">
						{exp.description}
					</p>
					{#if exp.tags?.length}
						<div class="mt-4 flex flex-wrap gap-1.5">
							{#each exp.tags as tag}
								<span class="rounded-full border border-c-accent-0/15 px-2.5 py-0.5 text-xs text-c-accent-0">
									{tag}
								</span>
							{/each}
						</div>
					{/if}
				</div>
				<div class="w-[10%] max-lg:hidden"></div>
				<div class="w-[45%] max-lg:hidden"></div>
			</div>
		{/each}
	</div>
</div>
