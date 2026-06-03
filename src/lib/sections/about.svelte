<script>
	import { onMount } from "svelte";
	import { gsap } from "gsap";
	import {
		AboutScene,
		AccentLink,
		AnimatedHeading,
		createParallax
	} from "$lib";

	/** @type {HTMLDivElement | undefined} */
	let sceneContainer = $state();

	/** @type {HTMLElement | undefined} */
	let sectionEl = $state();

	onMount(() => {
		const isTouch = window.matchMedia("(pointer: coarse)").matches;
		const reducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)"
		).matches;

		const sceneEl = sceneContainer;
		const layers = sceneEl
			? [...sceneEl.querySelectorAll("[data-layer-role]")]
			: [];

		const strengthMap = /** @type {Record<string, number>} */ ({
			halo: 6,
			bg: 10,
			subject: 16,
			fg: 22
		});

		const layerConfig = layers.map((el) => ({
			el: /** @type {HTMLElement} */ (el),
			strength:
				strengthMap[el.getAttribute("data-layer-role") ?? ""] ?? 6
		}));

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
	class="relative flex min-h-screen w-full flex-col lg:flex-row"
>
	<!-- content panel (skills-style) -->
	<div
		class="flex w-full flex-col justify-center gap-6 px-6 pb-12 pt-16 lg:w-1/2 lg:gap-10 lg:px-16 lg:pb-24 lg:pt-24 lg:pl-16"
	>
		<AnimatedHeading
			tag="h2"
			start={true}
			class="font-c-unbounded text-4xl font-black text-c-neutral-0 lg:text-7xl"
		>
			About Me
		</AnimatedHeading>

		<p
			class="font-c-ubuntu text-lg leading-relaxed text-c-neutral-1 lg:text-2xl"
		>
			B.Tech Computer Science student specializing in Cyber Security.
			Passionate about low-level systems, modern web engineering, and creating
			fast interactive experiences. I enjoy working across the full stack —
			from crafting responsive UIs to designing resilient backend services.
		</p>

		<div class="flex flex-wrap items-center gap-4">
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

	<!-- scene panel -->
	<div
		class="flex w-full items-center justify-center max-lg:h-[45vh] max-lg:pb-16 max-lg:px-8 lg:sticky lg:top-0 lg:h-screen lg:w-1/2 lg:pr-16"
	>
		<div class="h-full max-h-[55vh] w-full max-w-[60%] lg:max-h-[70vh]">
			<AboutScene bind:sceneEl={sceneContainer} />
		</div>
	</div>
</section>
