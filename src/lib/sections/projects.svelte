<script>
	import { resolve } from "$app/paths";
	import {
		projects,
		AnimatedHeading,
		CubeGrid,
		GRID_COLS,
		GRID_ROWS
	} from "$lib";

	/** @type {import("$lib/utils/projects_data.svelte.js").Project | null} */
	let activeProject = $state(projects[0]);
</script>

<section
	class="relative flex min-h-screen w-full flex-col lg:flex-row"
	id="projects"
>
	<div
		class="flex w-full flex-col justify-center px-8 py-16 lg:w-2/5 lg:px-12 lg:py-24"
	>
		<AnimatedHeading
			tag="h2"
			start={true}
			class="font-c-unbounded text-5xl font-black text-c-neutral-0 lg:text-7xl"
		>
			Projects
		</AnimatedHeading>

		<ul class="mt-12 flex flex-col gap-4">
			{#each projects as project (project.id)}
				<li>
					<button
						onmouseenter={() => (activeProject = project)}
						onclick={() => (activeProject = project)}
						class="group cursor-pointer text-left transition-colors duration-200 hover:text-c-accent-0"
						class:text-c-accent-0={activeProject?.id === project.id}
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
			class="group relative mt-12 inline-flex w-fit items-center gap-3 overflow-hidden rounded-full border border-c-border/40 bg-c-bg-2/30 px-8 py-4 font-c-ubuntu text-base text-c-neutral-0 backdrop-blur-xl transition-all duration-300 hover:border-c-border hover:bg-c-bg-2/50"
		>
			<span class="relative z-10">View All Projects</span>
			<span
				class="relative z-10 text-lg transition-transform duration-300 group-hover:translate-x-1"
				>→</span
			>
		</a>
	</div>

	<div
		class="sticky bottom-0 flex h-[50vh] w-full items-center justify-center lg:top-0 lg:h-screen lg:w-3/5"
	>
		{#each projects as project (project.id)}
			<img
				src={project.image}
				alt=""
				aria-hidden="true"
				class="invisible absolute"
			/>
		{/each}
		<div class="aspect-video max-h-[62vh] w-full max-w-[80%]">
			<CubeGrid
				cols={GRID_COLS}
				rows={GRID_ROWS}
				activeImage={activeProject?.image}
			/>
		</div>
	</div>
</section>
