<script>
	let {
		images = /** @type {string[]} */ ([]),
		activeIndex = $bindable(0),
		imageTrackEl = $bindable(),
		isMobile = false,
		handleDesktopImgClick = /** @type {((i: number) => void) | undefined} */ (undefined)
	} = $props();
</script>

<!-- mobile layout -->
<div data-carousel-viewport="mobile" class="flex flex-1 w-full flex-col gap-2 min-h-0 lg:hidden">
	<div
		data-project-img={0}
		class="relative flex-1 overflow-hidden rounded-xl min-h-0"
	>
		<img
			src={images[activeIndex]}
			alt=""
			class="absolute inset-0 h-full w-full object-cover"
			draggable={false}
		/>
	</div>
	{#if images.length >= 2}
		<div class="flex h-16 flex-row gap-2 shrink-0">
			{#each images as src, i}
				<button
					data-project-img={i + 1}
					onclick={() => activeIndex = i}
					class="relative flex-1 overflow-hidden rounded-lg transition-all duration-300 {i === activeIndex ? 'ring-2 ring-c-accent-0' : 'opacity-60 hover:opacity-80'}"
				>
					<img
						src={src}
						alt=""
						class="absolute inset-0 h-full w-full object-cover"
						draggable={false}
					/>
				</button>
			{/each}
		</div>
	{/if}
</div>

<!-- desktop layout -->
<div data-carousel-viewport="desktop" class="relative flex h-full w-full flex-col gap-3 max-lg:hidden">
	<div
		bind:this={imageTrackEl}
		class="relative flex h-full w-full flex-col gap-3"
	>
		{#each images as src, i}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				data-project-img={i}
				class="relative flex-1 overflow-hidden rounded-xl min-h-0 transition-[filter] duration-500 cursor-pointer"
				class:brightness-[0.35]={i !== activeIndex}
				onclick={() => handleDesktopImgClick?.(i)}
				onkeydown={(e) => e.key === "Enter" && handleDesktopImgClick?.(i)}
				role="button"
				tabindex="0"
			>
				<img
					src={src}
					alt=""
					class="h-full w-full object-cover"
				/>
			</div>
		{/each}
	</div>
</div>
