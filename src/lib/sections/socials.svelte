<script>
	import { onMount } from "svelte";
	import { gsap } from "gsap";
	import { ScrollTrigger } from "gsap/ScrollTrigger";
	import { socials, AnimatedHeading, AccentLink, Terminal } from "$lib";
	import { inertOffscreen } from "$lib/actions/inert_offscreen.js";

	/** @type {HTMLParagraphElement | undefined} */
	let paraEl = $state();
	/** @type {HTMLDivElement | undefined} */
	let linksEl = $state();
	/** @type {HTMLElement | undefined} */
	let sectionEl = $state();

	let reducedMotion = $state(typeof window !== 'undefined' && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
	let terminalPlay = $state(false);

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);

		if (reducedMotion) {
			if (paraEl) gsap.set(paraEl, { y: 0, opacity: 1 });
			if (linksEl) gsap.set(linksEl, { y: 0, opacity: 1 });
			terminalPlay = true;
			return;
		}

		if (paraEl) gsap.set(paraEl, { y: 19, opacity: 0 });
		if (linksEl) gsap.set(linksEl, { y: 13, opacity: 0 });

		const tl = gsap.timeline({
			onComplete: () => (terminalPlay = true)
		});

		if (paraEl) {
			tl.to(paraEl, {
				y: 0,
				opacity: 1,
				duration: 0.6,
				ease: "power3.out"
			});
		}

		if (linksEl) {
			tl.to(
				linksEl,
				{
					y: 0,
					opacity: 1,
					duration: 0.5,
					ease: "power3.out"
				},
				"-=0.15"
			);
		}

		ScrollTrigger.create({
			trigger: sectionEl,
			start: "top 20%",
			once: true,
			animation: tl
		});
	});
</script>

<section
	bind:this={sectionEl}
	use:inertOffscreen
	id="socials"
	class="flex min-h-screen w-full flex-col lg:flex-row lg:gap-16"
>
	<!-- mobile heading -->
	<div
		class="pt-20 pb-4 px-6 bg-c-bg-0 lg:hidden"
	>
		<AnimatedHeading
			tag="h2"
			class="font-c-unbounded text-4xl max-sm:text-2xl font-black text-c-neutral-0"
		>
			Open a <span class="text-c-accent-0">social</span>.
		</AnimatedHeading>
	</div>

	<!-- terminal panel (middle on mobile, left on desktop) -->
	<div
		class="flex w-full px-4 max-lg:flex-1 max-lg:items-stretch max-lg:justify-start max-lg:py-8 lg:sticky lg:top-0 lg:order-1 lg:h-screen lg:w-3/5 lg:items-center lg:justify-center lg:px-16"
	>
		<div class="w-full max-lg:flex max-lg:flex-1 max-lg:flex-col">
			<Terminal bind:playEntry={terminalPlay} {socials} />
		</div>
	</div>

	<!-- content panel (bottom on mobile with gradient, right on desktop) -->
	<div
		class="flex w-full flex-col justify-center gap-6 px-6 max-lg:py-8 bg-c-bg-0 lg:order-2 lg:w-2/5 lg:gap-10 lg:px-16 lg:py-24 lg:pl-16"
	>
		<AnimatedHeading
			tag="h2"
			start={true}
			reducedMotion={reducedMotion}
			class="font-c-unbounded text-3xl font-black text-c-neutral-0 max-lg:hidden lg:text-6xl"
		>
			Open a <span class="text-c-accent-0">social</span>.
		</AnimatedHeading>

		<p
			bind:this={paraEl}
			class="font-c-ubuntu text-xl max-sm:text-base leading-relaxed text-c-neutral-1 lg:text-2xl"
		>
			If you want to reach me, here are some social I am available on. Send a
			ping my way and I'll reply when I'm available. You will probably have the
			best luck using Email and Discord.
		</p>

		<div
			bind:this={linksEl}
			class="flex flex-wrap items-center gap-2"
		>
			{#each socials as s (s.id)}
				<AccentLink
					href={s.url}
					class="-translate-x-3 px-4 py-1.5 font-c-unbounded text-base max-sm:text-sm font-bold lg:text-lg"
				>
					{s.name}
				</AccentLink>
			{/each}
		</div>
	</div>
</section>
