<script>
	import { gsap } from "gsap";
	import { onMount } from "svelte";

	import { theme, toggleTheme } from "$lib";
	import { fadeUpTitleSubtitle } from "$lib";

	/** @type {HTMLHeadingElement} */
	let title;

	/** @type {HTMLParagraphElement} */
	let subtitle;

	onMount(() => {
		const timeline = gsap.timeline();

		fadeUpTitleSubtitle({ title, subtitle, timeline });

		return () => timeline.kill();
	});
</script>

<section class="flex min-h-screen flex-col items-center justify-center">
	<h1
		bind:this={title}
		class="font-c-unbounded text-7xl font-black tracking-tight text-c-neutral-0"
	>
		Hello, World!
	</h1>

	<p bind:this={subtitle} class="mt-4 font-c-ubuntu text-xl text-c-neutral-1">
		Coming soon!
	</p>

	<button
		onclick={toggleTheme}
		class="absolute top-4 right-4 rounded-lg border border-c-border px-4 py-2 font-c-bebas text-c-neutral-0"
	>
		{theme.current}
	</button>
</section>
