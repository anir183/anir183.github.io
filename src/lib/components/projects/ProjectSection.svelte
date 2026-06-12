<script>
	import { onMount } from "svelte";
	import { gsap } from "gsap";
	import ProjectInfo from "./ProjectInfo.svelte";
	import ProjectCarousel from "./ProjectCarousel.svelte";


	let {
		project = /** @type {import("$lib/utils/projects_data.svelte.js").Project | null} */ (null),
		reducedMotion = false
	} = $props();

	/** @type {HTMLElement | undefined} */
	let sectionEl = $state();
	/** @type {HTMLElement | undefined} */
	let imageTrackEl = $state();
	let activeIndex = $state(0);
	let isMobile = $state(false);

	/** @type {(() => void) | undefined} */
	let gsapCleanup;

	let images = $derived(project?.images ?? []);
	let hasMultipleImages = $derived(images.length >= 2);

	onMount(() => {
		let mounted = true;

		const mql = window.matchMedia("(max-width: 1023px)");
		isMobile = mql.matches;

		function rebuild() {
			gsapCleanup?.();
			gsapCleanup = undefined;

			const nowMobile = window.innerWidth < 1024;

			if (!mounted || !sectionEl) return;

			if (reducedMotion) {
				if (imageTrackEl && hasMultipleImages) {
					const maxYPct = -((images.length - 1) / images.length) * 100;
					gsap.set(imageTrackEl, { yPercent: maxYPct });
				}
				return;
			}

			if (!nowMobile && hasMultipleImages && imageTrackEl) {
				import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
					if (!mounted || !sectionEl || !imageTrackEl) return;

					gsap.registerPlugin(ScrollTrigger);

					const scrollDistance = Math.round(images.length * 0.6 * window.innerHeight);
					const maxYPct = -((images.length - 1) / images.length) * 100;

					const tl = gsap.timeline();
					tl.to(imageTrackEl, { yPercent: maxYPct, ease: "none" });

					const st = ScrollTrigger.create({
						trigger: sectionEl,
						pin: true,
						start: "top top",
						end: "+=" + scrollDistance,
						scrub: 1,
						animation: tl,
						onUpdate: (self) => {
							activeIndex = Math.round(self.progress * (images.length - 1));
						}
					});

					gsapCleanup = () => {
						st.kill();
						tl.kill();
					};
				});
			} else if (nowMobile && images.length > 0) {
				import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
					if (!mounted || !sectionEl) return;

					gsap.registerPlugin(ScrollTrigger);

					const imgEls = /** @type {HTMLElement[]} */ ([
						...sectionEl.querySelectorAll("[data-project-img]")
					]);
					if (!imgEls.length) return;

					gsap.set(imgEls, { y: 30, opacity: 0 });

					const mobileTl = gsap.timeline();
					mobileTl.to(imgEls, {
						y: 0,
						opacity: 1,
						stagger: 0.15,
						duration: 0.6,
						ease: "power2.out"
					});

					const st = ScrollTrigger.create({
						trigger: sectionEl,
						start: "top 80%",
						once: true,
						animation: mobileTl
					});

					gsapCleanup = () => {
						st.kill();
						mobileTl.kill();
					};
				});
			}
		}

		rebuild();

		const mqlHandler = () => rebuild();
		mql.addEventListener("change", mqlHandler);

		return () => {
			mounted = false;
			gsapCleanup?.();
			mql.removeEventListener("change", mqlHandler);
		};
	});
</script>

<section
	bind:this={sectionEl}
	class="relative w-full px-5 py-12 lg:flex lg:min-h-screen lg:items-center lg:px-10 lg:py-20"
>
	<div class="lg:w-2/5 lg:pr-8">
		<ProjectInfo
			number={project?.number ?? ""}
			title={project?.name ?? ""}
			description={project?.description ?? ""}
			tags={project?.tags ?? []}
			link={project?.link ?? ""}
		/>
	</div>

	<div class="relative mt-8 lg:mt-0 lg:w-3/5">
		<ProjectCarousel
			images={images}
			bind:imageTrackEl
			{activeIndex}
		/>
		<div
			class="absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 flex-col items-center gap-3 lg:flex"
		>
			{#each images as _, i}
				<div
					class="h-3 w-3 rounded-full border transition-all duration-500 {i === activeIndex ? 'border-c-accent-0 bg-c-accent-0 scale-125' : 'border-c-neutral-2/40 bg-transparent'}"
				></div>
			{/each}
		</div>
	</div>
</section>
