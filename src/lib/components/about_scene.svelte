<script>
	let { sceneEl = $bindable() } = $props();
</script>

<div
	bind:this={sceneEl}
	class="relative h-full w-full"
>
	<!-- halo — outside image layer context so bloom with filter:blur doesn't intersect -->
	<div
		class="absolute inset-0 m-auto max-h-full max-w-full pointer-events-none"
		style="aspect-ratio: 2160 / 2668"
	>
		<div
			data-layer-role="halo"
			class="pointer-events-none absolute inset-0"
			style="transform: perspective(1200px) translateX(calc(var(--px,0)*1px)) translateY(calc(var(--py,0)*1px)) rotateX(calc(var(--rx,0)*1deg)) rotateY(calc(var(--ry,0)*1deg)) scale(calc(var(--entry-scale, 1)))"
		>
			<!-- bloom — large soft ambient glow -->
			<div
				class="pointer-events-none absolute aspect-square w-[95%] rounded-full top-[29%] left-1/2 -translate-x-1/2 -translate-y-1/2"
				style="
					background: radial-gradient(
						circle,
						color-mix(in srgb, var(--color-c-accent-0) 40%, transparent) 0%,
						transparent 50%
					);
					filter: blur(40px);
				"
			></div>

			<!-- main disc — sharper gradient disc -->
			<div
				class="pointer-events-none absolute aspect-square w-[80%] rounded-full top-[31%] left-1/2 -translate-x-1/2 -translate-y-1/2"
				style="
					background: linear-gradient(
						180deg,
						color-mix(in srgb, var(--color-c-accent-0) 80%, black) 0%,
						color-mix(in srgb, var(--color-c-accent-0) 35%, transparent) var(--halo-disc-stop-2),
						transparent 80%
					);
				"
			></div>
		</div>
	</div>

	<!-- aspect-wrapper replicates object-contain sizing for the image layers -->
	<div
		class="absolute inset-0 m-auto max-h-full max-w-full"
		style="aspect-ratio: 2160 / 2668"
	>
		<!-- subject layer -->
		<img
			data-layer-role="subject"
			src="/assets/pfp/pfp-layer-2.png"
			alt=""
			class="pointer-events-none absolute inset-0 z-[1] h-full w-full select-none object-cover will-change-transform"
			draggable="false"
			style="transform: perspective(1200px) translateX(calc(var(--px,0)*1px)) translateY(calc(var(--py,0)*1px)) rotateX(calc(var(--rx,0)*1deg)) rotateY(calc(var(--ry,0)*1deg)) scale(calc(var(--entry-scale, 1)))"
		/>

		<!-- foreground layer -->
		<img
			data-layer-role="fg"
			src="/assets/pfp/pfp-layer-1.png"
			alt=""
			class="pointer-events-none absolute inset-0 z-[2] h-full w-full select-none object-cover will-change-transform"
			draggable="false"
			style="transform: perspective(1200px) translateX(calc(var(--px,0)*1px)) translateY(calc(var(--py,0)*1px)) rotateX(calc(var(--rx,0)*1deg)) rotateY(calc(var(--ry,0)*1deg)) scale(calc(var(--entry-scale, 1)))"
		/>
	</div>
</div>
