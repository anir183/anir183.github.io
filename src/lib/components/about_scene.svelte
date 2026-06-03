<script>
	let { sceneEl = $bindable() } = $props();
</script>

<div
	bind:this={sceneEl}
	class="relative h-full w-full"
	style="perspective: 1200px"
>
	<!-- procedural halo glow -->
	<div data-layer-role="halo" class="pointer-events-none absolute inset-0">
		<div
			class="pointer-events-none absolute top-1/2 left-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full"
			style="
				background: radial-gradient(
					circle at 50% 50%,
					color-mix(in oklch, var(--color-c-accent-0) 20%, transparent) 0%,
					transparent 70%
				);
				filter: blur(60px);
			"
		></div>
	</div>

	<!-- background layer -->
	<img
		data-layer-role="bg"
		src="/assets/pfp/pfp-layer-3.png"
		alt=""
		class="pointer-events-none absolute inset-0 h-full w-full select-none object-contain will-change-transform"
		draggable="false"
	/>

	<!-- subject layer -->
	<img
		data-layer-role="subject"
		src="/assets/pfp/pfp-layer-2.png"
		alt=""
		class="pointer-events-none absolute inset-0 h-full w-full select-none object-contain will-change-transform"
		draggable="false"
	/>

	<!-- foreground layer -->
	<img
		data-layer-role="fg"
		src="/assets/pfp/pfp-layer-1.png"
		alt=""
		class="pointer-events-none absolute inset-0 h-full w-full select-none object-contain will-change-transform"
		draggable="false"
	/>
</div>
