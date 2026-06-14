<script>
	import { onMount, tick } from "svelte";
	import { gsap } from "gsap";
	import ProjectInfo from "./ProjectInfo.svelte";
	import ProjectCarousel from "./ProjectCarousel.svelte";
	import ImageLightbox from "../ImageLightbox.svelte";
	import { AccentLink } from "$lib";


	let {
		project = /** @type {import("$lib/utils/projects_data.svelte.js").Project | null} */ (null),
		reducedMotion = false
	} = $props();

	/** @type {HTMLElement | undefined} */
	let sectionEl = $state();
	/** @type {HTMLElement | undefined} */
	let wrapperEl = $state();
	let wrapperHeight = $state(/** @type {number | null} */ (null));
	/** @type {HTMLElement | undefined} */
	let imageTrackEl = $state();
	let activeIndex = $state(0);
	let showLightbox = $state(false);
	let isMobile = $state(false);
	let imgWrapsRef = $state(/** @type {HTMLElement[]} */ ([]));
	let flexScrollTrigger = /** @type {import("gsap/ScrollTrigger").ScrollTrigger | undefined} */ (undefined);
	let flexTimeline = /** @type {gsap.core.Timeline | undefined} */ (undefined);

	/** @type {(() => void) | undefined} */
	let gsapCleanup;

	let images = $derived((isMobile ? project?.imagesMobile : project?.images) ?? []);
	let hasMultipleImages = $derived(images.length >= 2);

	/**
	 * @param {number} i
	 */
	function handleDesktopImgClick(i) {
		if (i === activeIndex) {
			showLightbox = true;
			return;
		}
		activeIndex = i;
		const wraps = imgWrapsRef;
		if (!wraps.length) return;

		if (flexTimeline && flexScrollTrigger) {
			const n = wraps.length;
			const progress = i / (n - 1);
			flexTimeline.progress(progress);
			const targetScroll = flexScrollTrigger.start + progress * (flexScrollTrigger.end - flexScrollTrigger.start);
			window.scrollTo({ top: targetScroll, behavior: "instant" });
		} else {
			wraps.forEach((wrap, j) => {
				gsap.set(wrap, { flexGrow: j === i ? 4.67 : 1 });
			});
		}
	}

	onMount(() => {
		let mounted = true;

		const mql = window.matchMedia("(max-width: 1023px)");
		isMobile = mql.matches;

		async function rebuild() {
			gsapCleanup?.();
			gsapCleanup = undefined;

			const nowMobile = window.innerWidth < 1024;
			isMobile = nowMobile;

			if (!mounted || !sectionEl) return;

			const carouselViewport = nowMobile ? "mobile" : "desktop";
			const imgWraps = /** @type {HTMLElement[]} */ ([
				...sectionEl.querySelectorAll(`[data-carousel-viewport="${carouselViewport}"] [data-project-img]`)
			]);
			imgWrapsRef = imgWraps;

			if (reducedMotion) {
				if (hasMultipleImages && !nowMobile) {
					if (imgWraps.length >= 2) {
						gsap.set(imgWraps[0], { flexGrow: 4.67 });
					}
				}
				return;
			}

			if (!imgWraps.length) return;

			const isDesktop = !nowMobile && hasMultipleImages;

			// Entry animation — set initial state
			gsap.set(imgWraps, {
				opacity: 0,
				...(isDesktop ? { y: 40 } : {})
			});

			const entryTl = gsap.timeline({ paused: true });

			if (isDesktop) {
				entryTl.to(imgWraps, {
					opacity: 1,
					y: 0,
					duration: 1.0,
				stagger: 0.3,
				ease: "power3.out"
			}, "+=0.2");
			} else {
				entryTl.to(imgWraps, {
					opacity: 1,
					duration: 1.0,
					stagger: 0.2,
					ease: "power3.out"
				}, "+=0.2");
			}

			// Text content entry animation
			const contentPanelSel = nowMobile
				? "[data-content-panel=mobile-header] [data-pi], [data-content-panel=mobile-footer] [data-pi]"
				: "[data-content-panel=desktop] [data-pi], [data-pi=indicators]";
			const contentEls = /** @type {HTMLElement[]} */ ([
				...sectionEl.querySelectorAll(contentPanelSel)
			]);
			if (contentEls.length) {
				const yMap = /** @type {Record<string, number>} */ ({
					number: 40,
					title: 40,
					desc: 24,
					tags: 16,
					link: 12,
					indicators: 12
				});
				contentEls.forEach((el) => {
					const role = el.getAttribute("data-pi") || "";
					const yVal = yMap[role] ?? 24;
					gsap.set(el, { y: yVal, opacity: 0 });
				});
				contentEls.forEach((el, i) => {
					entryTl.to(el, {
						y: 0,
						opacity: 1,
						duration: 0.6,
						ease: "power3.out"
					}, 0.2 + i * 0.12);
				});
			}

			// Always use ScrollTrigger for entry — handles scroll restoration timing correctly
			/** @type {import("gsap/ScrollTrigger").ScrollTrigger | undefined} */
		let entrySt;

			const needsScrollTrigger = isDesktop && imgWraps.length >= 2;

			// Wait for DOM to be fully settled before measuring section height
			await tick();
			await new Promise(r => requestAnimationFrame(r));

			// Compute wrapper height for CSS sticky pin
			if (isDesktop && imgWraps.length >= 2) {
				const scrollDist = Math.round(images.length * 0.3 * window.innerHeight);
				wrapperHeight = sectionEl.offsetHeight + scrollDist;
			} else {
				wrapperHeight = null;
			}

			import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
				if (!mounted || !sectionEl) return;
				gsap.registerPlugin(ScrollTrigger);

				// Entry ScrollTrigger — fires when section enters viewport, or immediately if already in view
				entrySt = ScrollTrigger.create({
					trigger: sectionEl,
					start: "top 20%",
					once: true,
					animation: entryTl
				});

				// Desktop flexGrow pin+scrub
				if (isDesktop && imgWraps.length >= 2) {
						const n = imgWraps.length;
						const scrollDistance = Math.round(images.length * 0.3 * window.innerHeight);
						const seg = 1 / (n - 1);

						const flexTl = gsap.timeline({ ease: "none" });
						flexTl.set(imgWraps[0], { flexGrow: 4.67 }, 0);

						for (let i = 0; i < n - 1; i++) {
							const startPos = i * seg;
							flexTl.to(imgWraps[i], { flexGrow: 1, duration: seg }, startPos);
							flexTl.to(imgWraps[i + 1], { flexGrow: 4.67, duration: seg }, startPos);
						}

						const st = ScrollTrigger.create({
							trigger: wrapperEl,
							start: "top top",
							end: "+=" + scrollDistance,
							scrub: 1,
							animation: flexTl,
							onUpdate: (self) => {
								activeIndex = Math.round(self.progress * (n - 1));
							}
						});

						flexScrollTrigger = st;
						flexTimeline = flexTl;

						gsapCleanup = () => {
							flexScrollTrigger = undefined;
							flexTimeline = undefined;
							st.kill();
							flexTl.kill();
							entrySt?.kill();
							entryTl.kill();
						};
					} else {
						gsapCleanup = () => {
							entrySt?.kill();
							entryTl.kill();
						};
					}

					// Recalculate pin-spacers once custom fonts are rendered
					document.fonts.ready.then(() => ScrollTrigger.refresh());
				});
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

<div
	bind:this={wrapperEl}
	class="relative"
	style="height: {wrapperHeight != null ? wrapperHeight + 'px' : ''}"
>
<section
	bind:this={sectionEl}
	id="project-{project?.id}"
	class="w-full max-lg:static lg:sticky lg:top-0 lg:flex lg:min-h-screen lg:items-center lg:px-10 lg:py-20 max-lg:flex max-lg:min-h-screen max-lg:flex-col"
>
	<!-- DESKTOP: ProjectInfo left panel -->
	<div data-content-panel="desktop" class="lg:w-2/5 lg:pr-8 max-lg:hidden">
		<ProjectInfo
			number={project?.number ?? ""}
			title={project?.name ?? ""}
			description={project?.description ?? ""}
			tags={project?.tags ?? []}
			link={project?.link ?? ""}
		/>
	</div>

	<!-- MOBILE: Row 1 — number, title, description -->
	<div data-content-panel="mobile-header" class="pt-20 pb-4 px-5 bg-c-bg-0 lg:hidden">
		<span
			data-pi="number"
			class="block font-c-jetbrains text-[clamp(1.5rem,6vw,3rem)] font-black text-c-accent-0/60 leading-none select-none"
		>
			{project?.number}
		</span>
		<h3
			data-pi="title"
			class="mt-1 font-c-unbounded text-[clamp(1.5rem,5vw,2.75rem)] font-black leading-tight text-c-neutral-0"
		>
			{project?.name}
		</h3>
		<p data-pi="desc" class="mt-2 max-w-prose text-base max-sm:text-xs leading-relaxed text-c-neutral-1 font-c-ubuntu">
			{project?.description}
		</p>
	</div>

	<!-- Carousel area: right on desktop, middle on mobile -->
	<div class="flex max-lg:flex-1 max-lg:px-5 lg:w-3/5 lg:h-[70vh]">
		<ProjectCarousel
			images={images}
			bind:imageTrackEl
			bind:activeIndex
			{isMobile}
			{handleDesktopImgClick}
		/>
	</div>

	<!-- DESKTOP: Dot indicators -->
	<div
		data-pi="indicators"
		class="hidden flex-col items-center justify-center gap-3 lg:flex lg:ml-4"
	>
		{#each images as _, i}
			<div
				class="h-3 w-3 rounded-full border transition-all duration-500 {i === activeIndex ? 'border-c-accent-0 bg-c-accent-0 scale-125' : 'border-c-neutral-2/40 bg-c-bg-2'}"
			></div>
		{/each}
	</div>

	<!-- MOBILE: Row 3 — tags + button -->
	<div data-content-panel="mobile-footer" class="py-6 px-5 bg-c-bg-0 lg:hidden">
		{#if project?.tags?.length}
			<div data-pi="tags" class="flex flex-wrap gap-1.5">
				{#each project.tags as tag}
					<span
						class="rounded-full border border-c-accent-0/15 px-2.5 py-0.5 text-xs text-c-accent-0 font-c-ubuntu"
					>
						{tag}
					</span>
				{/each}
			</div>
		{/if}
		{#if project?.link}
			<div data-pi="link">
				<AccentLink href={project.link} class="mt-3 -translate-x-3 px-3 py-1 font-c-unbounded text-xs font-bold">
					View Project
				</AccentLink>
			</div>
		{/if}
	</div>
</section>

{#if showLightbox}
	<ImageLightbox src={images[activeIndex]} onclose={() => showLightbox = false} />
{/if}
</div>
