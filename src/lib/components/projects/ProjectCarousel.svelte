<script>
	let {
		images = /** @type {string[]} */ ([]),
		activeIndex = 0,
		imageTrackEl = $bindable()
	} = $props();
</script>

<div
	class="relative h-[50vh] w-full overflow-hidden lg:h-[80vh]"
>
	<div
		bind:this={imageTrackEl}
		class="flex flex-col will-change-transform"
	>
		{#each images as src, i}
			<div
				data-project-img={i}
				class="relative h-[50vh] shrink-0 lg:h-[80vh]"
				class:brightness-50={i !== activeIndex}
				class:brightness-100={i === activeIndex}
			>
				<img
					src={src}
					alt=""
					class="h-full w-full object-cover"
					loading="lazy"
				/>
			</div>
		{/each}
	</div>
</div>
