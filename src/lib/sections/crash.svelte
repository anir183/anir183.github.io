<script>
	import { gsap } from "gsap";
	import { onMount } from "svelte";

	let { error = "unknown error", details = "something went wrong" } = $props();

	/** @type {HTMLHeadingElement | undefined} */
	let title = $state();

	/** @type {HTMLParagraphElement | undefined} */
	let subtitle = $state();

	onMount(() => {
		if (!title || !subtitle) return;
		const tl = gsap.timeline();

		tl.from(title, {
			y: 80,
			opacity: 0,
			duration: 1,
			ease: "power3.out"
		}).from(
			subtitle,
			{
				y: 30,
				opacity: 0,
				duration: 0.8,
				ease: "power2.out"
			},
			"-=0.5"
		);

		return () => tl.kill();
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
