<script>
	import { onMount } from "svelte";
	import { gsap } from "gsap";
	import { page } from "$app/state";

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
		class="text-7xl font-unbounded font-black tracking-tight text-error"
	>
		{page.status}
	</h1>

	<p bind:this={subtitle} class="mt-4 font-ubuntu text-xl text-muted">
		{page.error ? page.error.message : "An Unknown Error Occurred!"}
	</p>
</section>
