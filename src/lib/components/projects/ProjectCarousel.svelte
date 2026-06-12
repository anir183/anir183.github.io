<script>
	let {
		images = /** @type {string[]} */ ([]),
		activeIndex = 0,
		imageTrackEl = $bindable()
	} = $props();
</script>

<div
	bind:this={imageTrackEl}
	class="relative flex h-[50vh] w-full flex-col gap-3 lg:h-[80vh]"
>
	{#each images as src, i}
		<div
			data-project-img={i}
			class="relative flex-1 overflow-hidden rounded-xl min-h-0 transition-[filter] duration-500"
			class:brightness-[0.35]={i !== activeIndex}
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
