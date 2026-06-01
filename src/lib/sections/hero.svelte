<script>
	import { onMount } from "svelte";
	import { fade } from "svelte/transition";
	import { theme, Preloader, Navbar, heroEntrySequence } from "$lib";

	let preloaderVisible = $state(true);

	/** @type {HTMLDivElement | undefined} */
	let introImg0;
	/** @type {HTMLDivElement | undefined} */
	let introImg1;
	/** @type {HTMLDivElement | undefined} */
	let introImg2;
	/** @type {HTMLDivElement | undefined} */
	let introImg3;
	/** @type {HTMLDivElement | undefined} */
	let introImg4;
	/** @type {HTMLHeadingElement | undefined} */
	let heroH1;
	/** @type {HTMLElement | undefined} */
	let navEl = $state();
	/** @type {HTMLButtonElement | undefined} */
	let themeBtn = $state();

	/** @type {gsap.core.Timeline | undefined} */
	let tl;

	onMount(() => {
		let mounted = true;

		document.body.classList.add("overflow-hidden");

		(/** @type {(config: any) => Promise<any>} */ (heroEntrySequence))({
			introImages: [
				introImg0,
				introImg1,
				introImg2,
				introImg3,
				introImg4,
			],
			heroHeadline: heroH1,
			navLinks: navEl ? [...navEl.querySelectorAll("a")] : [],
			themeButton: themeBtn,
		})
			.then((result) => {
				if (!mounted) {
					result.tl.kill();
					return;
				}
				tl = result.tl;
			})
			.catch((err) => {
				console.warn("hero animation failed:", err);
			})
			.finally(() => {
				if (!mounted) return;
				preloaderVisible = false;
				document.body.classList.remove("overflow-hidden");
			});

		return () => {
			mounted = false;
			tl?.kill();
			document.body.classList.remove("overflow-hidden");
		};
	});
</script>

{#if preloaderVisible}
	<div transition:fade={{ duration: 500 }}>
		<Preloader />
	</div>
{/if}

<Navbar bind:navEl={navEl} bind:themeBtn={themeBtn} />

<section class="hero relative h-svh w-full overflow-hidden">
	<div
		bind:this={introImg0}
		class="intro-img absolute top-1/2 left-1/2 z-2 aspect-video w-[20vw] overflow-hidden rounded-4xl will-change-transform max-[1000px]:w-[35vw]"
	>
		<img
			src="/assets/hero_images/random_0.jpg"
			alt=""
			class="block h-full w-full object-cover"
		/>
	</div>

	<div
		bind:this={introImg1}
		class="intro-img absolute top-1/2 left-1/2 z-2 aspect-video w-[20vw] overflow-hidden rounded-4xl will-change-transform max-[1000px]:w-[35vw]"
	>
		<img
			src="/assets/hero_images/random_1.jpg"
			alt=""
			class="block h-full w-full object-cover"
		/>
	</div>

	<div
		bind:this={introImg2}
		class="intro-img absolute top-1/2 left-1/2 z-1 aspect-video w-[20vw] overflow-hidden rounded-4xl will-change-transform max-[1000px]:w-[35vw]"
	>
		<img
			src="/assets/hero_images/portrait_bg_light.png"
			alt=""
			class="absolute inset-0 block h-full w-full object-cover transition-opacity duration-700 {theme.current === 'light' ? 'opacity-100' : 'opacity-0'}"
		/>

		<img
			src="/assets/hero_images/portrait_bg_dark.png"
			alt=""
			class="absolute inset-0 block h-full w-full object-cover transition-opacity duration-700 {theme.current === 'dark' ? 'opacity-100' : 'opacity-0'}"
		/>
	</div>

	<div
		bind:this={introImg3}
		class="intro-img absolute top-1/2 left-1/2 z-2 aspect-video w-[20vw] overflow-hidden rounded-4xl will-change-transform max-[1000px]:w-[35vw]"
	>
		<img
			src="/assets/hero_images/random_2.jpg"
			alt=""
			class="block h-full w-full object-cover"
		/>
	</div>

	<div
		bind:this={introImg4}
		class="intro-img absolute top-1/2 left-1/2 z-2 aspect-video w-[20vw] overflow-hidden rounded-4xl will-change-transform max-[1000px]:w-[35vw]"
	>
		<img
			src="/assets/hero_images/random_3.jpg"
			alt=""
			class="block h-full w-full object-cover"
		/>
	</div>

	<div
		class="hero-content absolute bottom-0 left-0 z-10 box-border w-full p-8 max-[1000px]:px-6 max-[1000px]:pb-8"
	>
		<div class="hero-header max-w-[70%] max-[1000px]:max-w-full">
			<h1
				bind:this={heroH1}
				class="
					font-c-unbounded
					text-[clamp(3.5rem,8vw,9rem)]
					leading-[0.9]
					font-black
					text-c-neutral-0
					drop-shadow-[0_4px_24px_rgba(0,0,0,0.35)]
					max-[1000px]:text-[clamp(3rem,14vw,6rem)]
				"
			>
				Hello!<br />
				I'm
				<span class="text-c-accent-0"> Anirban. </span>
			</h1>
		</div>
	</div>
</section>
