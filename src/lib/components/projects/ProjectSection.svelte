<script>
	import { onMount } from "svelte";
	import { gsap } from "gsap";
	import ProjectInfo from "./ProjectInfo.svelte";
	import ProjectCarousel from "./ProjectCarousel.svelte";
	import { AccentLink } from "$lib";


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
			isMobile = nowMobile;

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
	class="relative w-full lg:flex lg:min-h-screen lg:items-center lg:px-10 lg:py-20 max-lg:flex max-lg:min-h-screen max-lg:flex-col"
>
	<!-- DESKTOP: ProjectInfo left panel -->
	<div class="lg:w-2/5 lg:pr-8 max-lg:hidden">
		<ProjectInfo
			number={project?.number ?? ""}
			title={project?.name ?? ""}
			description={project?.description ?? ""}
			tags={project?.tags ?? []}
			link={project?.link ?? ""}
		/>
	</div>

	<!-- MOBILE: Row 1 — number, title, description -->
	<div class="pt-20 pb-4 px-5 bg-c-bg-0 lg:hidden">
		<span
			class="block font-c-jetbrains text-[clamp(1.5rem,6vw,3rem)] font-black text-c-accent-0/60 leading-none select-none"
		>
			{project?.number}
		</span>
		<h3
			class="mt-1 font-c-unbounded text-[clamp(1.5rem,5vw,2.75rem)] font-black leading-tight text-c-neutral-0"
		>
			{project?.name}
		</h3>
		<p class="mt-2 max-w-prose text-xs leading-relaxed text-c-neutral-1 font-c-ubuntu">
			{project?.description}
		</p>
	</div>

	<!-- Carousel area: right on desktop, middle on mobile -->
	<div class="flex max-lg:flex-1 max-lg:px-5 lg:w-3/5 lg:h-[80vh]">
		<ProjectCarousel
			images={images}
			bind:imageTrackEl
			bind:activeIndex
			{isMobile}
		/>
	</div>

	<!-- DESKTOP: Dot indicators -->
	<div
		class="hidden flex-col items-center justify-center gap-3 lg:flex lg:ml-4"
	>
		{#each images as _, i}
			<div
				class="h-3 w-3 rounded-full border transition-all duration-500 {i === activeIndex ? 'border-c-accent-0 bg-c-accent-0 scale-125' : 'border-c-neutral-2/40 bg-c-bg-2'}"
			></div>
		{/each}
	</div>

	<!-- MOBILE: Row 3 — tags + button -->
	<div class="py-6 px-5 bg-c-bg-0 lg:hidden">
		{#if project?.tags?.length}
			<div class="flex flex-wrap gap-1.5">
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
			<AccentLink href={project.link} class="mt-3 -translate-x-3 px-3 py-1 font-c-unbounded text-xs font-bold">
				View Project
			</AccentLink>
		{/if}
	</div>
</section>
