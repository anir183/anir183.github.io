<script>
	import { theme, themes, Picture } from "$lib";

	let { heroH1 = $bindable() } = $props();

	const imageData = [
		{ src: "/assets/hero_images/random_0.jpg" },
		{ src: "/assets/hero_images/random_1.jpg" },
		{
			src: "/assets/hero_images/portrait_bg_light.png",
			portraitDark: "/assets/hero_images/portrait_bg_dark.png",
			z: "z-1"
		},
		{ src: "/assets/hero_images/random_2.jpg" },
		{ src: "/assets/hero_images/random_3.jpg" }
	];
</script>

<section class="hero relative h-svh w-full overflow-hidden">
	{#each imageData as img (img.src)}
		<div
			class="intro-img absolute top-1/2 left-1/2 {img.z ??
				'z-2'} aspect-video w-[20vw] max-intro:w-[35vw] overflow-hidden rounded-4xl will-change-transform"
		>
			{#if img.portraitDark}
				<Picture
					src={img.src}
					alt=""
					draggable={false}
					oncontextmenu={(/** @type {MouseEvent} */ e) => e.preventDefault()}
					class="absolute inset-0 block h-full w-full object-cover transition-opacity duration-700 {theme.current ===
						themes.LIGHT
						? 'opacity-100'
						: 'opacity-0'}"
				/>
				<Picture
					src={img.portraitDark}
					alt=""
					draggable={false}
					oncontextmenu={(/** @type {MouseEvent} */ e) => e.preventDefault()}
					class="absolute inset-0 block h-full w-full object-cover transition-opacity duration-700 {theme.current ===
						themes.DARK
						? 'opacity-100'
						: 'opacity-0'}"
				/>
			{:else}
				<Picture
					src={img.src}
					alt=""
					draggable={false}
					oncontextmenu={(/** @type {MouseEvent} */ e) => e.preventDefault()}
					class="block h-full w-full object-cover"
				/>
			{/if}
		</div>
	{/each}

	<div
		class="hero-content absolute bottom-0 left-0 z-10 box-border w-full p-6 max-intro:px-5 max-intro:pb-6"
	>
		<div class="hero-header max-w-[70%] max-intro:max-w-full">
			<h1
				bind:this={heroH1}
				class="
					font-c-unbounded
					text-[clamp(2.75rem,6.4vw,7rem)]
					leading-[0.9]
					font-black
					text-c-neutral-0
					drop-shadow-[0_4px_24px_var(--color-c-shadow)]
					max-intro:text-[clamp(2.25rem,11.2vw,4.75rem)]
				"
			>
				Hello!<br />
				I'm
				<span class="text-c-accent-0 transition-colors duration-700">
					Anirban
				</span>.
			</h1>
		</div>
	</div>
</section>
