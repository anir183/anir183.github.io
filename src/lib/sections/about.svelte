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
	import { inertOffscreen } from "$lib/actions/inert_offscreen.js";

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

		const layerEls = sceneEl
			? [...sceneEl.querySelectorAll("[data-layer-role]")]
			: [];
		const layers = /** @type {HTMLElement[]} */ (
			["fg", "subject", "halo"]
				.map((role) =>
					layerEls.find((el) => el.getAttribute("data-layer-role") === role)
				)
				.filter((el) => el != null)
		);

		if (!reducedMotion) {
			gsap.registerPlugin(ScrollTrigger);

			const tl = aboutEntrySequence({
				layers,
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
	use:inertOffscreen
	id="about"
	class="flex min-h-screen w-full flex-col lg:flex-row"
>
	<!-- mobile heading -->
	<div
		class="pt-20 pb-4 px-6 bg-c-bg-0 lg:hidden"
	>
		<AnimatedHeading
			tag="h2"
			class="font-c-unbounded text-4xl max-sm:text-3xl font-black text-c-neutral-0"
		>
			A little bit about <span class="text-c-accent-0">me</span>.
		</AnimatedHeading>
	</div>

	<!-- scene panel (middle on mobile, sticky right on desktop) -->
	<div
		class="flex w-full justify-center px-4 max-lg:flex-1 max-lg:items-center lg:sticky lg:top-0 lg:order-2 lg:h-screen lg:w-1/2 lg:items-center lg:px-8"
	>
		<div class="w-full max-w-[60%] max-sm:max-w-[75%] max-lg:h-auto max-lg:aspect-[2160/2668] lg:h-full lg:max-h-[70vh]">
			<AboutScene bind:sceneEl={sceneContainer} />
		</div>
	</div>

	<!-- content panel (absolute bottom on mobile, left on desktop) -->
	<div
		class="flex w-full flex-col justify-center gap-6 px-6 max-lg:py-8 bg-c-bg-0 lg:order-1 lg:w-1/2 lg:gap-10 lg:px-16 lg:py-24 lg:pl-16"
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
			class="font-c-ubuntu text-xl max-sm:text-base leading-relaxed text-c-neutral-1 lg:text-2xl"
		>
			B.Tech Computer Science student specializing in Cyber Security. Passionate
			about low-level systems, modern web engineering, and creating fast
			interactive experiences. I enjoy working across the full stack — from
			crafting responsive UIs to designing resilient backend services.
		</p>

		<div bind:this={ctaEl} class="flex flex-wrap items-center gap-4">
			<AccentLink
				href="https://github.com/anir183"
				class="-translate-x-3 px-4 py-1.5 font-c-unbounded text-base max-sm:text-sm font-bold lg:text-lg"
			>
				GitHub
			</AccentLink>
			<AccentLink
				href="/assets/resume.pdf"
				class="-translate-x-3 px-4 py-1.5 font-c-unbounded text-base max-sm:text-sm font-bold lg:text-lg"
			>
				Resume
			</AccentLink>
		</div>
	</div>
</section>
