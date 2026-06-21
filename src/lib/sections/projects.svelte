<script>
	import { onMount, tick } from "svelte";
	import { resolve } from "$app/paths";
	import {
		projects,
		AnimatedHeading,
		CubeGrid,
		AccentLink,
		Picture,
		projectsEntrySequence
	} from "$lib";
	import { inertOffscreen } from "$lib/actions/inert_offscreen.js";

	/** @type {import("$lib/utils/projects_data.svelte.js").Project | null} */
	let activeProject = $state(projects[0]);
	let isMobile = $state(false);
	let reducedMotion = $state(typeof window !== 'undefined' && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

	/** @type {HTMLElement | undefined} */
	let sectionEl = $state();
	/** @type {HTMLUListElement | undefined} */
	let projectListEl = $state();
	/** @type {HTMLAnchorElement | undefined} */
	let ctaEl = $state();
	/** @type {HTMLDivElement | undefined} */
	let gridContainerEl = $state();

	let entryActive = $state(true);

	onMount(() => {
		const mql = window.matchMedia("(max-width: 1023px)");
		isMobile = mql.matches;
		const handler = (/** @type {MediaQueryListEvent} */ e) =>
			(isMobile = e.matches);
		mql.addEventListener("change", handler);

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
				reducedMotion,
				onEntryComplete: () => { entryActive = false; }
			});
		});
	});
</script>

<section
	bind:this={sectionEl}
	use:inertOffscreen
	class="relative flex min-h-svh w-full flex-col lg:flex-row"
	id="projects"
>
	<div
		class="max-lg:absolute max-lg:top-0 max-lg:left-0 max-lg:z-20 max-lg:w-full max-lg:bg-gradient-to-b max-lg:from-c-bg-0/90 max-lg:via-c-bg-0/60 max-lg:to-transparent max-lg:px-5 max-lg:pt-20 max-lg:pb-10 lg:hidden"
	>
		<AnimatedHeading
			tag="h2"
			start={true}
			reducedMotion={reducedMotion}
		class="font-c-unbounded text-3xl max-sm:text-xl font-black text-c-neutral-0"
		sectionId="projects"
	>
		<span class="text-c-accent-0">Projects</span> I have built.
	</AnimatedHeading>
</div>

	<div
		class="flex w-full flex-col justify-center px-6 py-12 max-lg:pointer-events-none max-lg:absolute max-lg:bottom-0 max-lg:left-0 max-lg:z-10 max-lg:w-full max-lg:justify-end max-lg:bg-[linear-gradient(45deg,color-mix(in_oklch,var(--color-c-bg-0)_95%,transparent)_0%,color-mix(in_oklch,var(--color-c-bg-0)_95%,transparent)_25%,transparent_70%)] max-lg:px-5 max-lg:pt-56 max-sm:pt-40 max-lg:pb-6 lg:w-2/5 lg:gap-8 lg:px-10 lg:py-20 lg:pl-12"
	>
		<div class="max-lg:hidden">
			<AnimatedHeading
				tag="h2"
				start={true}
				reducedMotion={reducedMotion}
				class="font-c-unbounded text-3xl font-black text-c-neutral-0 lg:text-5xl"
				sectionId="projects"
			>
				<span class="text-c-accent-0">Projects</span> I have built.
			</AnimatedHeading>
		</div>

		<ul
			bind:this={projectListEl}
			class="mt-10 flex flex-col gap-3 max-lg:pointer-events-auto"
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
							class="font-c-bebas text-xs font-bold tracking-widest text-c-neutral-1"
						>
							{project.tags.join(" · ")}
						</span>
						<h3 class="mt-0.5 font-c-ubuntu text-xl max-sm:text-sm font-bold lg:text-2xl">
							{project.name}
						</h3>
					</button>
				</li>
			{/each}
		</ul>

		<AccentLink
			href={resolve("/projects")}
			class="-translate-x-3 translate-y-0.5 px-3 py-1 font-c-unbounded text-sm font-bold max-lg:pointer-events-auto max-lg:mt-5 max-lg:self-start max-sm:text-xs"
			bind:el={ctaEl}
		>
			More Projects
		</AccentLink>
	</div>

	<div
		bind:this={gridContainerEl}
		class="sticky bottom-0 flex h-[50vh] w-full items-center justify-center max-lg:static max-lg:h-svh max-lg:p-10 max-sm:px-5 max-sm:py-8 lg:top-0 lg:h-svh lg:w-3/5 lg:pr-12"
	>
		{#each projects as project (project.id)}
			<Picture
				src={project.image}
				alt="Screenshot of {project.name}"
				aria-hidden="true"
				class="invisible absolute"
			/>
			<Picture
				src={project.imageMobile}
				alt="Screenshot of {project.name}"
				aria-hidden="true"
				class="invisible absolute"
			/>
		{/each}
		<div
			class="aspect-video max-h-[80vh] w-full max-w-[90%] max-lg:aspect-auto max-lg:h-full max-lg:max-h-none max-lg:max-w-none"
		>
			<CubeGrid activeImage={activeImageSrc} bind:entryActive />
		</div>
	</div>
</section>
