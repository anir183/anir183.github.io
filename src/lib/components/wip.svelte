<script>
	import { onMount, onDestroy } from "svelte";
	import { gsap } from "gsap";
	import { Navbar, AccentLink } from "$lib";

	let { animationDelay = 0 } = $props();

	const navItems = [
		{ label: "Home", href: "/" },
		{ label: "Projects", href: "/projects" },
		{ label: "Experiences", href: "/experiences" }
	];

	/** @type {HTMLElement | undefined} */
	let sectionEl = $state();

	/** @type {HTMLDivElement | undefined} */
	let wipHeading = $state();

	/** @type {HTMLParagraphElement | undefined} */
	let description = $state();

	/** @type {HTMLElement | undefined} */
	let ctaEl = $state();

	/** @type {HTMLElement | undefined} */
	let navEl = $state();

	/** @type {HTMLButtonElement | undefined} */
	let themeBtn = $state();

	/** @type {HTMLButtonElement | undefined} */
	let hamburgerBtn = $state();

	/** @type {HTMLElement | undefined} */
	let logoEl = $state();

	let reducedMotion = $state(false);

	/** @type {gsap.core.Timeline | undefined} */
	let tl;

	/** @type {any[]} */
	let splitInstances = [];

	onMount(async () => {
		reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

		await document.fonts.ready;

		if (reducedMotion) {
			gsap.set([logoEl, themeBtn, hamburgerBtn, ctaEl], { opacity: 1 });
			if (sectionEl) gsap.set(sectionEl, { opacity: 1 });
			return;
		}

		if (sectionEl) gsap.set(sectionEl, { opacity: 0 });

		if (animationDelay > 0) {
			await new Promise((resolve) => setTimeout(resolve, animationDelay));
		}

		const navLinks = navEl
			? [...navEl.querySelectorAll(":scope > div:first-of-type a")]
			: [];

		if (!wipHeading || !description) return;

		const { SplitText } = await import("gsap/SplitText");
		gsap.registerPlugin(SplitText);

		const navSplit = SplitText.create(navLinks, {
			type: "lines",
			linesClass: "line",
			mask: "lines",
			autoSplit: true
		});

		const headingSplit = new SplitText(wipHeading, {
			type: "lines",
			linesClass: "line",
			mask: "lines",
			autoSplit: true
		});

		const descSplit = new SplitText(description, {
			type: "lines",
			linesClass: "line",
			mask: "lines",
			autoSplit: true
		});

		splitInstances = [navSplit, headingSplit, descSplit];

		const navLines = navLinks.flatMap((a) => [...a.querySelectorAll(".line")]);
		const headingLines = wipHeading ? [...wipHeading.querySelectorAll(".line")] : [];
		const descLines = description ? [...description.querySelectorAll(".line")] : [];

		if (logoEl) gsap.set(logoEl, { opacity: 0, x: -16 });
		gsap.set([...navLines, ...headingLines, ...descLines], {
			y: "125%"
		});
		if (themeBtn) gsap.set(themeBtn, { opacity: 0, scale: 0.8 });
		if (hamburgerBtn) gsap.set(hamburgerBtn, { opacity: 0, scale: 0.8 });
		if (ctaEl) gsap.set(ctaEl, { y: 16, opacity: 0 });

		if (sectionEl) gsap.set(sectionEl, { opacity: 1 });

		tl = gsap.timeline();

		if (logoEl) {
			tl.to(logoEl, {
				opacity: 1,
				x: 0,
				duration: 0.7,
				ease: "power3.out"
			});
		}

		tl.to(
			navLines,
			{
				y: "0%",
				duration: 1,
				stagger: 0.08,
				ease: "power3.out"
			},
			"<"
		);

		if (themeBtn) {
			tl.fromTo(
				themeBtn,
				{ opacity: 0, scale: 0.8 },
				{ opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" },
				"<0.2"
			);
		}

		if (hamburgerBtn) {
			tl.fromTo(
				hamburgerBtn,
				{ opacity: 0, scale: 0.8 },
				{ opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" },
				"<0.2"
			);
		}

		tl.to(
			headingLines,
			{
				y: "0%",
				duration: 0.8,
				stagger: 0.1,
				ease: "power3.out"
			},
			"-=0.3"
		);

		tl.to(
			descLines,
			{
				y: "0%",
				duration: 0.7,
				stagger: 0.08,
				ease: "power3.out"
			},
			"-=0.3"
		);

		if (ctaEl) {
			tl.to(
				ctaEl,
				{
					y: 0,
					opacity: 1,
					duration: 0.5,
					ease: "power3.out"
				},
				"-=0.15"
			);
		}
	});

	onDestroy(() => {
		tl?.kill();
		splitInstances.forEach((s) => s.revert());
	});
</script>

<section
	bind:this={sectionEl}
	class="relative flex min-h-dvh flex-col bg-c-bg-0"
>
	<Navbar
		{navItems}
		bind:navEl
		bind:themeBtn
		bind:hamburgerBtn
		bind:logoEl
	/>

	<div class="flex flex-1 flex-col items-center justify-center gap-5 px-3 text-center">
		<div
			bind:this={wipHeading}
			class="font-c-unbounded text-7xl font-black text-c-accent-0 max-sm:text-5xl"
		>
			WIP
		</div>

		<p
			bind:this={description}
			class="max-w-md font-c-ubuntu text-sm leading-relaxed text-c-neutral-1 max-sm:text-xs"
		>
			This page is under construction. Check back later for updates.
		</p>
	</div>

	<div bind:this={ctaEl} class="flex justify-center pb-10">
		<AccentLink
			href="/"
			class="-translate-x-3 px-3 py-1 font-c-unbounded text-xs font-bold lg:text-sm"
		>
			Back Home
		</AccentLink>
	</div>
</section>
