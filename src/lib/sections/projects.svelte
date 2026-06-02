<script>
	import { onMount } from "svelte";
	import { resolve } from "$app/paths";
	import { projects, AnimatedHeading, CubeGrid } from "$lib";

	/** @type {import("$lib/utils/projects_data.svelte.js").Project | null} */
	let activeProject = $state(projects[0]);
	let isMobile = $state(false);

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
</script>

<section
	class="relative flex min-h-screen w-full flex-col lg:flex-row"
	id="projects"
>
	<div
		class="max-lg:absolute max-lg:top-0 max-lg:left-0 max-lg:z-20 max-lg:w-full max-lg:bg-gradient-to-b max-lg:from-c-bg-0/90 max-lg:via-c-bg-0/60 max-lg:to-transparent max-lg:px-6 max-lg:pt-8 max-lg:pb-12 lg:hidden"
	>
		<AnimatedHeading
			tag="h2"
			start={true}
			class="font-c-unbounded text-5xl font-black text-c-neutral-0"
		>
			Projects
		</AnimatedHeading>
	</div>

	<div
		class="flex w-full flex-col justify-center px-8 py-16 max-lg:absolute max-lg:bottom-0 max-lg:left-0 max-lg:z-10 max-lg:w-full max-lg:justify-end max-lg:bg-gradient-to-tr max-lg:from-c-bg-0/95 max-lg:via-c-bg-0/75 max-lg:to-c-bg-0/0 max-lg:px-6 max-lg:pt-32 max-lg:pb-8 lg:w-2/5 lg:px-12 lg:py-24 lg:pl-16"
	>
		<div class="max-lg:hidden">
			<AnimatedHeading
				tag="h2"
				start={true}
				class="font-c-unbounded text-5xl font-black text-c-neutral-0 lg:text-7xl"
			>
				Projects
			</AnimatedHeading>
		</div>

		<ul class="mt-12 flex flex-col gap-4">
			{#each projects as project (project.id)}
				<li>
					<button
						onmouseenter={() => (activeProject = project)}
						onclick={() => (activeProject = project)}
						class="group cursor-pointer text-left transition-colors duration-200 hover:text-c-accent-0"
						class:text-c-accent-0={activeProject?.id === project.id}
						aria-pressed={activeProject?.id === project.id}
					>
						<span class="font-c-bebas text-sm tracking-widest text-c-neutral-1">
							{project.tags.join(" · ")}
						</span>
						<h3 class="mt-1 font-c-ubuntu text-2xl font-bold lg:text-3xl">
							{project.name}
						</h3>
					</button>
				</li>
			{/each}
		</ul>

		<a
			href={resolve("/projects")}
			class="group relative mt-12 inline-flex w-fit items-center gap-3 overflow-hidden rounded-full border border-c-border/40 bg-c-bg-2/30 px-8 py-4 font-c-ubuntu text-base text-c-neutral-0 backdrop-blur-xl transition-all duration-300 hover:border-c-border hover:bg-c-bg-2/50 max-lg:absolute max-lg:right-6 max-lg:bottom-8 max-lg:mt-0"
		>
			<span class="relative z-10">View All Projects</span>
			<span
				class="relative z-10 text-lg transition-transform duration-300 group-hover:translate-x-1"
				>→</span
			>
		</a>
	</div>

	<div
		class="sticky bottom-0 flex h-[50vh] w-full items-center justify-center max-lg:static max-lg:h-screen max-lg:p-12 lg:top-0 lg:h-screen lg:w-3/5 lg:pr-16"
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
