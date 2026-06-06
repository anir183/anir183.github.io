<script>
	import { onMount, tick } from "svelte";
	import { resolve } from "$app/paths";
	import {
		projects,
		AnimatedHeading,
		CubeGrid,
		AccentLink,
		projectsEntrySequence
	} from "$lib";
	import { inertOffscreen } from "$lib/actions/inert_offscreen.js";

	/** @type {import("$lib/utils/projects_data.svelte.js").Project | null} */
	let activeProject = $state(projects[0]);
	let isMobile = $state(false);
	let reducedMotion = $state(false);

	/** @type {HTMLElement | undefined} */
	let sectionEl = $state();
	/** @type {HTMLUListElement | undefined} */
	let projectListEl = $state();
	/** @type {HTMLAnchorElement | undefined} */
	let ctaEl = $state();
	/** @type {HTMLDivElement | undefined} */
	let gridContainerEl = $state();

	onMount(() => {
		const mql = window.matchMedia("(max-width: 1023px)");
		isMobile = mql.matches;
		const handler = (/** @type {MediaQueryListEvent} */ e) =>
			(isMobile = e.matches);
		mql.addEventListener("change", handler);

		reducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)"
		).matches;

		return () => mql.removeEventListener("change", handler);
	});

	let activeImageSrc = $derived(
		isMobile && activeProject ? activeProject.imageMobile : activeProject?.image
	);

	$effect(() => {
		if (!sectionEl || !projectListEl) return;

		const list = projectListEl;

		tick().then(() => {
			if (!list) return;
			const items = [...list.querySelectorAll("button")];
			projectsEntrySequence({
				projectItems: items,
				ctaButton: ctaEl,
				gridContainer: gridContainerEl,
				sectionEl,
				reducedMotion
			});
		});
	});
</script>

<section
	bind:this={sectionEl}
	use:inertOffscreen
	class="relative flex min-h-screen w-full flex-col lg:flex-row"
	id="projects"
>
	<div
		class="max-lg:absolute max-lg:top-0 max-lg:left-0 max-lg:z-20 max-lg:w-full max-lg:bg-gradient-to-b max-lg:from-c-bg-0/90 max-lg:via-c-bg-0/60 max-lg:to-transparent max-lg:px-6 max-lg:pt-24 max-lg:pb-12 lg:hidden"
	>
		<AnimatedHeading
			tag="h2"
			start={true}
		class="font-c-unbounded text-4xl max-sm:text-3xl font-black text-c-neutral-0"
	>
		<span class="text-c-accent-0">Projects</span> I have built.
	</AnimatedHeading>
</div>

	<div
		class="flex w-full flex-col justify-center px-8 py-16 max-lg:pointer-events-none max-lg:absolute max-lg:bottom-0 max-lg:left-0 max-lg:z-10 max-lg:w-full max-lg:justify-end max-lg:bg-[linear-gradient(45deg,color-mix(in_oklch,var(--color-c-bg-0)_95%,transparent)_0%,color-mix(in_oklch,var(--color-c-bg-0)_95%,transparent)_25%,transparent_70%)] max-lg:px-6 max-lg:pt-72 max-sm:pt-48 max-lg:pb-8 lg:w-2/5 lg:gap-10 lg:px-12 lg:py-24 lg:pl-16"
	>
		<div class="max-lg:hidden">
			<AnimatedHeading
				tag="h2"
				start={true}
				class="font-c-unbounded text-4xl font-black text-c-neutral-0 lg:text-6xl"
			>
				<span class="text-c-accent-0">Projects</span> I have built.
			</AnimatedHeading>
		</div>

		<ul
			bind:this={projectListEl}
			class="mt-12 flex flex-col gap-4 max-lg:pointer-events-auto"
		>
			{#each projects as project (project.id)}
				<li>
					<button
						onmouseenter={() => (activeProject = project)}
						onclick={() => (activeProject = project)}
						class="group cursor-pointer text-left transition-colors duration-200 hover:text-c-accent-0"
						class:text-c-accent-0={activeProject?.id === project.id}
						aria-pressed={activeProject?.id === project.id}
					>
						<span
							class="font-c-bebas text-sm font-bold tracking-widest text-c-neutral-1"
						>
							{project.tags.join(" · ")}
						</span>
						<h3 class="mt-1 font-c-ubuntu text-2xl max-sm:text-xl font-bold lg:text-3xl">
							{project.name}
						</h3>
					</button>
				</li>
			{/each}
		</ul>

		<AccentLink
			href={resolve("/projects")}
			class="-translate-x-3 translate-y-0.5 px-4 py-1.5 font-c-unbounded text-lg font-bold max-lg:pointer-events-auto max-lg:absolute max-lg:right-6 max-lg:bottom-8 max-lg:mt-0"
			bind:el={ctaEl}
		>
			More Projects
		</AccentLink>
	</div>

	<div
		bind:this={gridContainerEl}
		class="sticky bottom-0 flex h-[50vh] w-full items-center justify-center max-lg:static max-lg:h-screen max-lg:p-12 max-sm:px-6 max-sm:py-10 lg:top-0 lg:h-screen lg:w-3/5 lg:pr-16"
	>
		{#each projects as project (project.id)}
			<img
				src={project.image}
				alt=""
				aria-hidden="true"
				class="invisible absolute"
			/>
			<img
				src={project.imageMobile}
				alt=""
				aria-hidden="true"
				class="invisible absolute"
			/>
		{/each}
		<div
			class="aspect-video max-h-[80vh] w-full max-w-[90%] max-lg:aspect-auto max-lg:h-full max-lg:max-h-none max-lg:max-w-none"
		>
			<CubeGrid activeImage={activeImageSrc} />
		</div>
	</div>
</section>
