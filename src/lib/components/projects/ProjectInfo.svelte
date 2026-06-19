<script>
	import { AccentLink, AnimatedHeading } from "$lib";

	let {
		number = "",
		title = "",
		description = "",
		tags = [],
		link = "",
		sectionId,
		reducedMotion = false,
		triggerEl = undefined
	} = $props();
</script>

<div class="flex flex-col gap-4 lg:gap-6">
	<span
		data-pi="number"
		class="block font-c-jetbrains text-[clamp(1.5rem,6vw,3rem)] font-black text-c-accent-0/60 leading-none select-none"
	>
		{number}
	</span>

	<AnimatedHeading tag="h3" start={true} triggerOffset="top 20%" {sectionId} {reducedMotion} triggerEl={triggerEl} class="font-c-unbounded text-[clamp(1.5rem,5vw,2.75rem)] font-black leading-tight text-c-neutral-0">{title}</AnimatedHeading>

	<p data-pi="desc" class="text-base max-sm:text-xs leading-relaxed text-c-neutral-1 font-c-ubuntu lg:text-xl max-w-prose">
		{description}
	</p>

	{#if tags.length}
		<div data-pi="tags" class="flex flex-wrap gap-1.5">
			{#each tags as tag}
				<span
					class="rounded-full border border-c-accent-0/15 px-2.5 py-0.5 text-xs text-c-accent-0 font-c-ubuntu"
				>
					{tag}
				</span>
			{/each}
		</div>
	{/if}

	{#if link}
		<div data-pi="link">
			<AccentLink href={link} class="-translate-x-3 px-3 py-1 font-c-unbounded text-xs font-bold lg:text-sm">
				View Project
			</AccentLink>
		</div>
	{/if}
</div>

