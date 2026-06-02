<script>
	import { onMount } from "svelte";
	import { fade } from "svelte/transition";
	import {
		Preloader,
		Navbar,
		Hero,
		Projects,
		heroEntrySequence,
		loadAllImages,
		BODY_SCROLL_LOCK
	} from "$lib";

	let preloaderVisible = $state(true);
	let progress = $state(0);

	/** @type {HTMLElement | undefined} */
	let navEl = $state();
	/** @type {HTMLButtonElement | undefined} */
	let themeBtn = $state();
	/** @type {HTMLButtonElement | undefined} */
	let hamburgerBtn = $state();

	/** @type {HTMLDivElement[]} */
	let introImgs = $state([]);
	/** @type {HTMLHeadingElement | undefined} */
	let heroH1 = $state();

	/** @type {gsap.core.Timeline | undefined} */
	let tl;

	onMount(() => {
		let mounted = true;

		document.body.classList.add(BODY_SCROLL_LOCK);

		loadAllImages((/** @type {number} */ pct) => {
			if (!mounted) return;
			progress = pct;
		})
			.then(() =>
				heroEntrySequence({
					introImages: introImgs.filter(Boolean),
					heroHeadline: heroH1,
					navLinks: navEl ? [...navEl.querySelectorAll("a")] : [],
					themeButton: themeBtn,
					hamburgerButton: hamburgerBtn
				})
			)
			.then((/** @type {{tl: gsap.core.Timeline}} */ result) => {
				if (!mounted) {
					result.tl.kill();
					return;
				}
				tl = result.tl;
				preloaderVisible = false;
				return tl.then(() => {});
			})
			.catch((/** @type {Error} */ err) => {
				console.warn("hero animation failed:", err);
			})
			.finally(() => {
				if (!mounted) return;
				document.body.classList.remove(BODY_SCROLL_LOCK);
			});

		return () => {
			mounted = false;
			tl?.kill();
			document.body.classList.remove(BODY_SCROLL_LOCK);
		};
	});
</script>

{#if preloaderVisible}
	<div transition:fade={{ duration: 500 }}>
		<Preloader bind:progress />
	</div>
{/if}

<Navbar bind:navEl bind:themeBtn bind:hamburgerBtn />
<Hero bind:introImgs bind:heroH1 />
<Projects />
