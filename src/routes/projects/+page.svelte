<script>
	import { onMount } from "svelte";
	import { fade } from "svelte/transition";
	import { browser } from "$app/environment";
	import { resolve } from "$app/paths";
	import { gsap } from "gsap";
	import {
		Navbar,
		Footer,
		Preloader,
		loadAllImages,
		BODY_SCROLL_LOCK,
		STAGGER_FAST,
		AnimatedHeading,
		ProjectSection,
		projects
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

	const navItems = [
		{ label: "Home", href: resolve("/") },
		{ label: "Experiences", href: resolve("/experiences") },
		{ label: "Projects", href: resolve("/projects") }
	];

	onMount(() => {
		let mounted = true;
		/** @type {HTMLElement[]} */
		let navLinesStore = [];

		document.body.classList.add(BODY_SCROLL_LOCK);

		loadAllImages((/** @type {number} */ pct) => {
			if (!mounted) return;
			progress = pct;
		})
			.then(() => document.fonts.ready)
			.then(async () => {
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

				gsap.set(navLinesStore, { opacity: 0, y: "125%", willChange: "transform" });
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
				if (reducedMotion || !navLinesStore.length) {
					headingStart = true;
					return;
				}
				return new Promise(r => setTimeout(r, 800));
			})
			.then(() => {
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
				setTimeout(() => { headingStart = true; }, 3000);
			});

		return () => {
			mounted = false;
			navTl?.kill();
			document.body.classList.remove(BODY_SCROLL_LOCK);
		};
	});
</script>

<svelte:head>
	<title>Projects — anir183</title>
</svelte:head>

{#if preloaderVisible}
	<div transition:fade={{ duration: reducedMotion ? 0 : 500 }} class="relative z-50">
		<Preloader bind:progress bind:done={preloaderDone} />
	</div>
{/if}

<Navbar bind:navEl bind:themeBtn bind:hamburgerBtn {navItems} />

<section class="relative z-10 flex min-h-screen items-center px-5 max-lg:px-3">
	<div class="mx-auto w-full max-w-4xl">
		<AnimatedHeading
			tag="h2"
			start={headingStart}
			{reducedMotion}
			class="font-c-unbounded text-5xl max-sm:text-2xl font-black text-center lg:text-7xl"
		>Projects</AnimatedHeading>
	</div>
</section>

{#each projects as project (project.id)}
	<ProjectSection {project} {reducedMotion} />
{/each}

<Footer />
