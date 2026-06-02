<script>
	import { projects, AnimatedHeading } from "$lib";
</script>

<svelte:head>
	<title>Projects — anir183</title>
</svelte:head>

<section class="min-h-screen px-8 py-24 lg:px-16">
	<AnimatedHeading
		tag="h1"
		start={true}
		class="font-c-unbounded text-4xl font-black text-c-neutral-0 lg:text-6xl"
	>
		All Projects
	</AnimatedHeading>

	<div class="mt-16 grid gap-12 md:grid-cols-2 lg:grid-cols-3">
		{#each projects as project (project.id)}
			<article
				class="group overflow-hidden rounded-2xl border border-c-border/20 bg-c-bg-1/50 backdrop-blur-sm transition-all duration-300 hover:border-c-border/40 hover:shadow-lg"
			>
				<div class="aspect-video overflow-hidden">
					<img
						src={project.image}
						alt={project.name}
						class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
					/>
				</div>
				<div class="p-6">
					<div class="flex flex-wrap gap-2">
						{#each project.tags as tag (tag)}
							<span
								class="rounded-full bg-c-accent-0/10 px-3 py-1 font-c-bebas text-xs tracking-wider text-c-accent-0"
							>
								{tag}
							</span>
						{/each}
					</div>
					<h2 class="mt-4 font-c-unbounded text-2xl font-bold text-c-neutral-0">
						{project.name}
					</h2>
					<p
						class="mt-2 font-c-ubuntu text-base leading-relaxed text-c-neutral-1"
					>
						{project.description}
					</p>
				</div>
			</article>
		{/each}
	</div>
</section>
