<script>
	import { onMount } from "svelte";
	import { fade } from "svelte/transition";
	import { browser } from "$app/environment";
	import {
		Preloader,
		Navbar,
		Hero,
		About,
		Projects,
		SkillsNetwork,
		Socials,
		Footer,
		heroEntrySequence,
		loadAllImages,
		BODY_SCROLL_LOCK,
		createSectionSnap,
		isSpaNavigation
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
	/** @type {HTMLElement | undefined} */
	let logoEl = $state();

	/** @type {HTMLHeadingElement | undefined} */
	let heroH1 = $state();

	/** @type {gsap.core.Timeline | undefined} */
	let tl;

	/** @type {(() => void) | undefined} */
	let cleanupSnap;

	onMount(() => {
		let mounted = true;

		const spaNav = isSpaNavigation();

		if (spaNav) {
			document.body.classList.remove(BODY_SCROLL_LOCK);
		} else {
			document.body.classList.add(BODY_SCROLL_LOCK);
		}

		loadAllImages((/** @type {number} */ pct) => {
			if (!mounted) return;
			progress = pct;
		})
			.then(() => document.fonts.ready)
			.then(() => {
				const introImgEls = /** @type {NodeListOf<HTMLElement>} */ (
					document.querySelectorAll(".intro-img")
				);
				const introImgs = [...introImgEls];
				const navLinkEls = /** @type {NodeListOf<HTMLElement> | undefined} */ (
					navEl?.querySelectorAll(":scope > div:first-of-type a")
				);
				const navLinks = navLinkEls ? [...navLinkEls] : [];
				return heroEntrySequence({
					introImages: introImgs,
					heroHeadline: heroH1,
					navLinks,
					themeButton: themeBtn,
					hamburgerButton: hamburgerBtn,
					logoEl,
					skipImageAnimation: spaNav,
					reducedMotion
				});
			})
			.then((/** @type {{tl: gsap.core.Timeline}} */ result) => {
				const entryTl = result.tl;
				if (!mounted) {
					entryTl.kill();
					return;
				}
				tl = entryTl;
				console.log("[page] GSAP setup done, waiting one frame");
				return new Promise(resolve => requestAnimationFrame(resolve)).then(() => {
					console.log("[page] frame flushed, waiting for counter to reach 100%");
					return new Promise(resolve => {
						if (preloaderDone) return resolve(undefined);
						const check = () => requestAnimationFrame(() => {
							if (preloaderDone) resolve(undefined);
							else check();
						});
						check();
					});
				}).then(() => {
					console.log("[page] fading preloader");
					preloaderVisible = false;
					return entryTl.then();
				});
			})
			.catch((/** @type {Error} */ err) => {
				console.warn("[page] hero animation failed:", err);
				preloaderVisible = false;
			})
			.finally(() => {
				if (!mounted) return;
				document.body.classList.remove(BODY_SCROLL_LOCK);
				cleanupSnap = createSectionSnap();
			});

		return () => {
			mounted = false;
			tl?.kill();
			document.body.classList.remove(BODY_SCROLL_LOCK);
			cleanupSnap?.();
		};
	});
</script>

{#if preloaderVisible}
	<div transition:fade={{ duration: reducedMotion ? 0 : 500 }} class="relative z-50">
		<Preloader bind:progress bind:done={preloaderDone} />
	</div>
{/if}

<Navbar bind:navEl bind:themeBtn bind:hamburgerBtn bind:logoEl />
<Hero bind:heroH1 />
<Projects />
<SkillsNetwork />
<About />
<Socials />
<Footer />
