<script>
	import { gsap } from "gsap";
	import { onMount } from "svelte";

	import { fadeUpTitleSubtitle } from "$lib";

	let {
		error = "unknown error",
		details = "something went wrong"
	} = $props();

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

<section class="flex min-h-screen flex-col items-center justify-center bg-bg">
	<h1
		bind:this={title}
		class="font-unbounded text-7xl font-black tracking-tight text-error"
	>
		{error}
	</h1>

	<p bind:this={subtitle} class="mt-4 font-ubuntu text-xl text-muted">
		{details}
	</p>
</section>
