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
				if (hasMultipleImages) {
					const imgWraps = [...sectionEl.querySelectorAll("[data-project-img]")];
					if (imgWraps.length >= 2) {
						gsap.set(imgWraps[0], { flexGrow: 4.67 });
					}
				}
				return;
			}

			if (!nowMobile && hasMultipleImages) {
				import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
					if (!mounted || !sectionEl) return;

					gsap.registerPlugin(ScrollTrigger);

					const imgWraps = /** @type {HTMLElement[]} */ ([
						...sectionEl.querySelectorAll("[data-project-img]")
					]);
					const n = imgWraps.length;
					if (n < 2) return;

					const scrollDistance = Math.round(images.length * 0.3 * window.innerHeight);
					const seg = 1 / (n - 1);

					const tl = gsap.timeline({ ease: "none" });
					tl.set(imgWraps[0], { flexGrow: 4.67 }, 0);

					for (let i = 0; i < n - 1; i++) {
						const startPos = i * seg;
						tl.to(imgWraps[i], { flexGrow: 1, duration: seg }, startPos);
						tl.to(imgWraps[i + 1], { flexGrow: 4.67, duration: seg }, startPos);
					}

					const st = ScrollTrigger.create({
						trigger: sectionEl,
						pin: true,
						start: "top top",
						end: "+=" + scrollDistance,
						scrub: 1,
						animation: tl,
						onUpdate: (self) => {
							activeIndex = Math.round(self.progress * (n - 1));
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
	id="project-{project?.id}"
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

	<div class="relative mt-8 flex items-stretch gap-3 lg:mt-0 lg:w-3/5">
		<div class="flex-1 min-w-0">
			<ProjectCarousel
				images={images}
				bind:imageTrackEl
				{activeIndex}
			/>
		</div>
		<div
			class="hidden flex-col items-center justify-center gap-3 lg:flex"
		>
			{#each images as _, i}
				<div
					class="h-3 w-3 rounded-full border transition-all duration-500 {i === activeIndex ? 'border-c-accent-0 bg-c-accent-0 scale-125' : 'border-c-neutral-2/40 bg-transparent'}"
				></div>
			{/each}
		</div>
	</div>
</section>
