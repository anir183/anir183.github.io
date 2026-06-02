<script>
	import { onMount } from "svelte";
	import { gsap } from "gsap";
	import { experiences, AnimatedHeading } from "$lib";

	/** @type {HTMLElement | undefined} */
	let sectionEl = $state();

	onMount(() => {
		import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
			gsap.registerPlugin(ScrollTrigger);

			const cards = sectionEl?.querySelectorAll("[data-exp-id]");
			if (!cards || cards.length === 0) return;

			gsap.set(cards, { y: 60, opacity: 0 });

			ScrollTrigger.batch(cards, {
				start: "top 85%",
				once: true,
				onEnter: (batch) =>
					gsap.to(batch, {
						y: 0,
						opacity: 1,
						duration: 0.7,
						stagger: 0.15,
						ease: "power3.out"
					})
			});
		});

		return () => {
			gsap.globalTimeline?.getChildren(true).forEach((t) => t.kill());
		};
	});
</script>

<svelte:head>
	<title>Experiences — anir183</title>
</svelte:head>

<section
	bind:this={sectionEl}
	class="min-h-screen px-8 py-24 lg:px-16 lg:py-32"
>
	<AnimatedHeading
		tag="h1"
		start={true}
		class="font-c-unbounded text-4xl font-black text-c-neutral-0 lg:text-6xl"
	>
		Experiences
	</AnimatedHeading>

	<div class="relative mx-auto mt-16 max-w-3xl lg:mt-24">
		<!-- timeline line -->
		<div class="absolute left-6 top-2 bottom-2 w-px bg-c-border/20 lg:left-8"></div>

		{#each experiences as exp (exp.id)}
			<div class="relative pb-16 pl-16 last:pb-0 lg:pl-20" data-exp-id={exp.id}>
				<!-- timeline dot -->
				<div
					class="absolute left-3 top-1.5 h-3 w-3 rounded-full border-4 border-c-bg-0 bg-c-accent-0 lg:left-4 lg:h-4 lg:w-4"
				></div>

				<div
					class="rounded-2xl border border-c-border/40 bg-c-bg-2/30 p-5 backdrop-blur-xl transition-colors duration-200 hover:border-c-border/60 lg:p-6"
				>
					<div class="flex flex-wrap items-start justify-between gap-2">
						<div>
							<h2 class="font-c-unbounded text-lg font-bold text-c-neutral-0 lg:text-xl">
								{exp.role}
							</h2>
							<span class="font-c-ubuntu text-sm text-c-accent-0">
								{exp.company}
							</span>
						</div>
						<span
							class="shrink-0 font-c-bebas text-xs tracking-widest text-c-neutral-1"
						>
							{exp.period}
						</span>
					</div>
					<p class="mt-3 font-c-ubuntu text-sm leading-relaxed text-c-neutral-1">
						{exp.description}
					</p>
					{#if exp.tags.length > 0}
						<div class="mt-4 flex flex-wrap gap-2">
							{#each exp.tags as tag (tag)}
								<span
									class="rounded-full bg-c-accent-0/10 px-3 py-1 font-c-bebas text-xs tracking-wider text-c-accent-0"
								>
									{tag}
								</span>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</section>
