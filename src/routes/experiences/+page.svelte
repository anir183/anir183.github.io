<script>
	import { onMount } from "svelte";
	import { fade } from "svelte/transition";
	import { browser } from "$app/environment";
	import { resolve } from "$app/paths";
	import { gsap } from "gsap";
	import {
		DotGrid,
		Navbar,
		Footer,
		Preloader,
		loadAllImages,
		BODY_SCROLL_LOCK,
		createSectionSnap,
		ExperiencesSection,
		STAGGER_FAST,
		LG_BREAKPOINT
	} from "$lib";

	let reducedMotion = $state(browser && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
	let preloaderVisible = $state(true);
	let progress = $state(0);
	let preloaderDone = $state(false);

	/** @type {HTMLElement | undefined} */
	let navEl = $state();
	/** @type {HTMLButtonElement | undefined} */
	let themeBtn = $state();
	/** @type {HTMLButtonElement | undefined} */
	let hamburgerBtn = $state();

	/** @type {gsap.core.Timeline | undefined} */
	let navTl;

	let headingStart = $state(false);

	/** @type {(() => void) | undefined} */
	let cleanupSnap;

	const navItems = [
		{ label: "Home", href: resolve("/") },
		{ label: "Projects", href: resolve("/projects") },
		{ label: "Experiences", href: resolve("/experiences") }
	];

	onMount(() => {
		let mounted = true;
		const sectionHash = window.location.hash.slice(1);
		/** @type {HTMLElement[]} */
		let navLinesStore = [];

		document.body.classList.add(BODY_SCROLL_LOCK);

		loadAllImages((/** @type {number} */ pct) => {
			if (!mounted) return;
			progress = pct;
		})
			.then(() => document.fonts.ready)
			.then(async () => {
				// --- GSAP setup: initial state only, before preloader fades ---
				if (!mounted) return;

				const navLinkEls = navEl
					? [...navEl.querySelectorAll(":scope > div:first-of-type a")]
					: [];
				if (!navLinkEls.length || !themeBtn) return;

				const { SplitText } = await import("gsap/SplitText");
				gsap.registerPlugin(SplitText);

				SplitText.create(navLinkEls, {
					type: "lines",
					linesClass: "line",
					mask: "lines",
					autoSplit: true
				});
				navLinesStore = /** @type {HTMLElement[]} */ (navLinkEls.flatMap(a => [...a.querySelectorAll(".line")]));

				if (reducedMotion) {
					gsap.set(navLinesStore, { y: "0%" });
					gsap.set(themeBtn, { opacity: 1, scale: 1 });
					if (hamburgerBtn) gsap.set(hamburgerBtn, { opacity: 1, scale: 1 });
					return;
				}

				gsap.set(navLinesStore, { opacity: 0, y: "125%" });
				gsap.set(themeBtn, { opacity: 0, scale: 0.8 });
				if (hamburgerBtn) {
					gsap.set(hamburgerBtn, { opacity: 0, scale: 0.8 });
				}
			})
			.then(() => {
				if (!mounted) return;
				return new Promise((resolve) =>
					requestAnimationFrame(resolve)
				).then(() => {
					return new Promise((resolve) => {
						if (preloaderDone) return resolve(undefined);
						const check = () =>
							requestAnimationFrame(() => {
								if (preloaderDone) resolve(undefined);
								else check();
							});
						check();
					});
				});
			})
			.then(() => {
				preloaderVisible = false;
				if (reducedMotion || !navLinesStore.length || sectionHash) {
					if (sectionHash && navLinesStore.length) {
						gsap.set(navLinesStore, { opacity: 1, y: "0%" });
						if (themeBtn) gsap.set(themeBtn, { opacity: 1, scale: 1 });
						if (hamburgerBtn) gsap.set(hamburgerBtn, { opacity: 1, scale: 1 });
					}
					headingStart = true;
					return;
				}
				return new Promise(r => setTimeout(r, 800));
			})
			.then(() => {
				// --- Timeline plays after preloader fully faded + buffer ---
				if (!mounted || !navLinesStore.length || !themeBtn) return;

				const tl = gsap.timeline();
				tl.to(navLinesStore, { opacity: 1, y: "0%", duration: 1, stagger: STAGGER_FAST, ease: "power3.out" }, 0);
				tl.fromTo(
					themeBtn,
					{ opacity: 0, scale: 0.8 },
					{ opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" },
					0
				);
				if (hamburgerBtn) {
					tl.fromTo(
						hamburgerBtn,
						{ opacity: 0, scale: 0.8 },
						{ opacity: 1, scale: 1, duration: 1, ease: "power3.out" },
						0
					);
				}
				navTl = tl;
				navTl.then(() => { headingStart = true; });
			})
			.catch(() => {
				preloaderVisible = false;
			})
			.finally(() => {
				if (!mounted) return;
				document.body.classList.remove(BODY_SCROLL_LOCK);
				cleanupSnap = createSectionSnap();
				setTimeout(() => { headingStart = true; }, 900);

				if (sectionHash) {
					requestAnimationFrame(() => {
						document.getElementById(sectionHash)
							?.scrollIntoView({ behavior: "instant" });
					});
				}
			});

		return () => {
			mounted = false;
			navTl?.kill();
			cleanupSnap?.();
			document.body.classList.remove(BODY_SCROLL_LOCK);
		};
	});
</script>

<svelte:head>
	<title>Experiences — anir183</title>
</svelte:head>

{#if preloaderVisible}
	<div transition:fade={{ duration: reducedMotion ? 0 : 500 }} class="relative z-50">
		<Preloader bind:progress bind:done={preloaderDone} />
	</div>
{/if}

<DotGrid headingSelector="#experiences-heading" />
<Navbar bind:navEl bind:themeBtn bind:hamburgerBtn {navItems} />
<ExperiencesSection {reducedMotion} {headingStart} />
<Footer />
