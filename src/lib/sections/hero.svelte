<script>
	import { onMount } from "svelte";
	import { fade } from "svelte/transition";
	import {
		theme,
		themes,
		Preloader,
		Navbar,
		heroEntrySequence,
		loadAllImages,
		BODY_SCROLL_LOCK
	} from "$lib";

	let preloaderVisible = $state(true);
	let progress = $state(0);

	/** @type {HTMLDivElement[]} */
	let introImgs = $state([]);
	/** @type {HTMLHeadingElement | undefined} */
	let heroH1 = $state();
	/** @type {HTMLElement | undefined} */
	let navEl = $state();
	/** @type {HTMLButtonElement | undefined} */
	let themeBtn = $state();
	/** @type {HTMLButtonElement | undefined} */
	let hamburgerBtn = $state();

	/** @type {gsap.core.Timeline | undefined} */
	let tl;

	const imageData = [
		{ src: "/assets/hero_images/random_0.jpg" },
		{ src: "/assets/hero_images/random_1.jpg" },
		{
			src: "/assets/hero_images/portrait_bg_light.png",
			portraitDark: "/assets/hero_images/portrait_bg_dark.png",
			z: "z-1"
		},
		{ src: "/assets/hero_images/random_2.jpg" },
		{ src: "/assets/hero_images/random_3.jpg" }
	];

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
			})
			.catch((/** @type {Error} */ err) => {
				console.warn("hero animation failed:", err);
			})
			.finally(() => {
				if (!mounted) return;
				preloaderVisible = false;
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

<section class="hero relative h-svh w-full overflow-hidden">
	{#each imageData as img, i (img.src)}
		<div
			bind:this={introImgs[i]}
			class="intro-img absolute top-1/2 left-1/2 {img.z ??
				'z-2'} aspect-video w-[20vw] overflow-hidden rounded-4xl will-change-transform max-intro:w-[35vw]"
		>
			{#if img.portraitDark}
				<img
					src={img.src}
					alt=""
					class="absolute inset-0 block h-full w-full object-cover transition-opacity duration-700 {theme.current ===
					themes.LIGHT
						? 'opacity-100'
						: 'opacity-0'}"
				/>
				<img
					src={img.portraitDark}
					alt=""
					class="absolute inset-0 block h-full w-full object-cover transition-opacity duration-700 {theme.current ===
					themes.DARK
						? 'opacity-100'
						: 'opacity-0'}"
				/>
			{:else}
				<img src={img.src} alt="" class="block h-full w-full object-cover" />
			{/if}
		</div>
	{/each}

	<div
		class="hero-content absolute bottom-0 left-0 z-10 box-border w-full p-8 max-intro:px-6 max-intro:pb-8"
	>
		<div class="hero-header max-w-[70%] max-intro:max-w-full">
			<h1
				bind:this={heroH1}
				class="
					font-c-unbounded
					text-[clamp(3.5rem,8vw,9rem)]
					leading-[0.9]
					font-black
					text-c-neutral-0
					drop-shadow-[0_4px_24px_rgba(0,0,0,0.35)]
					max-intro:text-[clamp(3rem,14vw,6rem)]
				"
			>
				Hello!<br />
				I'm
				<span class="text-c-accent-0 transition-colors duration-700">
					Anirban.
				</span>
			</h1>
		</div>
	</div>
</section>
