<script>
	import { onMount } from "svelte";
	import { gsap } from "gsap";
	import { theme, toggleTheme } from "$lib/utils/theme.svelte.js";

	/** @type {HTMLHeadingElement} */
	let title;

	/** @type {HTMLParagraphElement} */
	let subtitle;

	onMount(() => {
		const timeline = gsap.timeline();

		timeline
			.from(title, {
				y: 80,
				opacity: 0,
				duration: 1,
				ease: "power3.out"
			})
			.from(
				subtitle,
				{
					y: 30,
					opacity: 0,
					duration: 0.8,
					ease: "power2.out"
				},
				"-=0.5"
			);
	});
</script>

<section
	class="flex min-h-screen flex-col items-center justify-center bg-bg"
>
	<h1
		bind:this={title}
		class="text-7xl font-unbounded font-black tracking-tight text-text"
	>
		Hello, World!
	</h1>

	<p bind:this={subtitle} class="mt-4 font-ubuntu text-xl text-muted">
		Coming soon!
	</p>

	<button
		onclick={toggleTheme}
		class="absolute font-bebas top-4 right-4 rounded-lg border border-border px-4 py-2"
	>
		{theme.current}
	</button>
</section>
