<script>
	import { onMount } from "svelte";
	import { gsap } from "gsap";
	import { ScrollTrigger } from "gsap/ScrollTrigger";
	import {
		AboutScene,
		AccentLink,
		AnimatedHeading,
		createParallax,
		aboutEntrySequence,
		LG_BREAKPOINT
	} from "$lib";

	/** @type {HTMLDivElement | undefined} */
	let sceneContainer = $state();

	/** @type {HTMLElement | undefined} */
	let sectionEl = $state();

	/** @type {HTMLParagraphElement | undefined} */
	let paraEl = $state();

	/** @type {HTMLDivElement | undefined} */
	let ctaEl = $state();

	let isMobile = $state(false);
	let reducedMotion = $state(false);

	onMount(() => {
		const isTouch = window.matchMedia("(pointer: coarse)").matches;
		isMobile = window.innerWidth < LG_BREAKPOINT;
		reducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)"
		).matches;

		const sceneEl = sceneContainer;

		if (!reducedMotion) {
			gsap.registerPlugin(ScrollTrigger);

			const tl = aboutEntrySequence({
				sceneContainer: sceneEl,
				subtitle: paraEl,
				ctaGroup: ctaEl,
				reducedMotion
			});

			if (tl) {
				ScrollTrigger.create({
					trigger: sectionEl,
					start: "top 20%",
					once: true,
					animation: tl
				});
			}
		}

		const layers = sceneEl
			? [...sceneEl.querySelectorAll("[data-layer-role]")]
			: [];

		const strengthMap = /** @type {Record<string, number>} */ ({
			halo: 8,
			subject: 18,
			fg: 28
		});

		const rotStrengthMap = /** @type {Record<string, number>} */ ({
			halo: 1,
			subject: 3,
			fg: 5
		});

		const layerConfig = layers.map((el) => {
			const role = el.getAttribute("data-layer-role") ?? "";
			return {
				el: /** @type {HTMLElement} */ (el),
				strength: strengthMap[role] ?? 6,
				rotStrength: rotStrengthMap[role] ?? 0
			};
		});

		/** @type {gsap.core.Tween | undefined} */
		let floatTween;
		if (!reducedMotion && sceneEl) {
			floatTween = gsap.to(sceneEl, {
				y: "+=6",
				duration: 4,
				repeat: -1,
				yoyo: true,
				ease: "sine.inOut"
			});
		}

		/** @type {(() => void) | undefined} */
		let cleanupParallax;
		if (!isTouch && !reducedMotion && sceneEl && sectionEl) {
			cleanupParallax = createParallax({
				container: sectionEl,
				layers: layerConfig,
				duration: 0.8
			});
		}

		return () => {
			floatTween?.kill();
			cleanupParallax?.();
		};
	});
</script>

<section
	bind:this={sectionEl}
	id="about"
	class="relative flex min-h-screen w-full flex-col lg:flex-row"
>
	<!-- mobile heading overlay -->
	<div
		class="absolute top-0 left-0 z-10 w-full bg-gradient-to-b from-c-bg-0/90 via-c-bg-0/60 to-transparent px-6 pt-24 pb-12 lg:hidden"
	>
		<AnimatedHeading
			tag="h2"
			class="font-c-unbounded text-4xl font-black text-c-neutral-0"
		>
			A little bit about <span class="text-c-accent-0">me</span>.
		</AnimatedHeading>
	</div>

	<!-- scene panel (middle on mobile, sticky right on desktop) -->
	<div
		class="flex w-full items-center justify-center px-4 max-lg:h-[50vh] max-lg:mt-[14rem] lg:sticky lg:top-0 lg:h-screen lg:w-1/2 lg:px-8 lg:order-2"
	>
		<div class="h-full max-h-[55vh] w-full max-w-[60%] lg:max-h-[70vh]">
			<AboutScene bind:sceneEl={sceneContainer} />
		</div>
	</div>

	<!-- content panel (absolute bottom on mobile, left on desktop) -->
	<div
		class="flex w-full flex-col justify-center gap-6 px-6 pb-12 max-lg:absolute max-lg:bottom-0 max-lg:left-0 max-lg:z-10 max-lg:w-full max-lg:justify-end max-lg:bg-gradient-to-tr max-lg:from-c-bg-0/95 max-lg:via-c-bg-0/75 max-lg:to-c-bg-0/0 max-lg:px-6 max-lg:pt-32 max-lg:pb-8 lg:w-1/2 lg:gap-10 lg:px-16 lg:pb-24 lg:pt-24 lg:pl-16 lg:order-1"
	>
		<AnimatedHeading
			tag="h2"
			start={!isMobile}
			class="font-c-unbounded text-3xl font-black text-c-neutral-0 max-lg:hidden lg:text-6xl"
		>
			A little bit about <span class="text-c-accent-0">me</span>.
		</AnimatedHeading>

		<p
			bind:this={paraEl}
			class="font-c-ubuntu text-xl leading-relaxed text-c-neutral-1 lg:text-2xl"
		>
			B.Tech Computer Science student specializing in Cyber Security.
			Passionate about low-level systems, modern web engineering, and creating
			fast interactive experiences. I enjoy working across the full stack —
			from crafting responsive UIs to designing resilient backend services.
		</p>

		<div bind:this={ctaEl} class="flex flex-wrap items-center gap-4">
			<AccentLink
				href="https://github.com/anir183"
				class="-translate-x-3 px-4 py-1.5 font-c-unbounded font-bold text-base lg:text-lg"
			>
				GitHub
			</AccentLink>
			<AccentLink
				href="/assets/resume.pdf"
				class="-translate-x-3 px-4 py-1.5 font-c-unbounded font-bold text-base lg:text-lg"
			>
				Resume
			</AccentLink>
		</div>
	</div>
</section>
