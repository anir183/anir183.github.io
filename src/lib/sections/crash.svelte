<script>
	import { gsap } from "gsap";
	import { onMount } from "svelte";

	import { fadeUpTitleSubtitle } from "$lib";

	let { error = "unknown error", details = "something went wrong" } = $props();

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

<section
	class="flex min-h-screen flex-col items-center justify-center bg-c-bg-0"
>
	<h1
		bind:this={title}
		class="font-c-unbounded text-7xl font-black tracking-tight text-c-error"
	>
		{error}
	</h1>

	<p bind:this={subtitle} class="mt-4 font-c-ubuntu text-xl text-c-neutral-1">
		{details}
	</p>
</section>
