<script>
	import { onMount } from "svelte";
	import gsap from "gsap";

	import { toggleTheme, theme } from "$lib/utils/theme.svelte";

	/** @type {gsap.core.Timeline} */
	let tl;

	onMount(() => {
		let mounted = true;

		(async () => {
			const { SplitText } = await import("gsap/SplitText");
			const { CustomEase } = await import("gsap/CustomEase");

			if (!mounted) return;

			gsap.registerPlugin(SplitText, CustomEase);

			CustomEase.create("hop", "0.9, 0, 0.1, 1");
			CustomEase.create("glide", "0.8, 0, 0.2, 1");

			// wait for images
			await Promise.all(
				Array.from(document.images).map((img) => {
					if (img.complete) return Promise.resolve();

					return new Promise((resolve) => {
						img.onload = resolve;
						img.onerror = resolve;
					});
				})
			);

			SplitText.create("nav a, .hero-header h1", {
				type: "lines",
				linesClass: "line",
				mask: "lines",
				autoSplit: true
			});

			gsap.set(".line", {
				y: "125%"
			});

			/** @type {NodeListOf<HTMLElement>} */
			const introImages = document.querySelectorAll(".intro-img");

			const introImgScale = 0.85;
			const introImgGap = 40;
			const introImgRotations = [-15, 5, -7.5, 10, -2.5];

			const introImgWidth = introImages[0].getBoundingClientRect().width;

			const totalWidth =
				introImgWidth * introImages.length +
				introImgGap * (introImages.length - 1);

			const startX = -totalWidth / 2 + introImgWidth / 2;

			introImages.forEach((img, i) => {
				const centeredX = startX + i * (introImgWidth + introImgGap);

				const offScreenX = centeredX - window.innerWidth * 1.2;

				gsap.set(img, {
					xPercent: -50,
					yPercent: -50,
					x: offScreenX,
					scale: introImgScale,
					rotation: introImgRotations[i],
					borderRadius: "2rem"
				});

				img.dataset.centeredX = centeredX.toString();
			});

			tl = gsap.timeline({ delay: 0.5 });

			// preloader wipe in
			tl.to(".preloader", {
				scaleX: 1,
				duration: 0.5,
				ease: "glide",
				onComplete: () => {
					gsap.set(".preloader", {
						transformOrigin: "right"
					});
				}
			});

			// preloader wipe out
			tl.to(".preloader", {
				scaleX: 0,
				duration: 1.25,
				ease: "hop"
			});

			// overlay reveal
			tl.to(
				".preloader-overlay",
				{
					clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
					duration: 1,
					ease: "hop"
				},
				"<0.75"
			);

			// images slide in
			introImages.forEach((img) => {
				tl.to(
					img,
					{
						x: parseFloat(img.dataset.centeredX || "0"),
						duration: 1.5,
						ease: "glide"
					},
					"<0.05"
				);
			});

			// left images move away
			tl.to(
				".intro-img:nth-child(1), .intro-img:nth-child(2)",
				{
					x: "-=1200",
					duration: 1.5,
					ease: "glide"
				},
				"spread"
			);

			// right images move away
			tl.to(
				".intro-img:nth-child(4), .intro-img:nth-child(5)",
				{
					x: "+=1200",
					duration: 1.5,
					ease: "glide"
				},
				"spread"
			);

			// center image expands
			tl.to(
				".hero-img",
				{
					scale: 1,
					x: 0,
					y: 0,
					rotation: 0,
					width: "100vw",
					height: "100svh",
					borderRadius: 0,
					duration: 1.5,
					ease: "glide"
				},
				"<"
			);

			// nav reveal
			tl.to(
				"nav .line",
				{
					y: "0%",
					duration: 1,
					stagger: 0.1,
					ease: "power3.out"
				},
				"<1"
			);

			// button reveal
			tl.fromTo(
				".nav-actions button",
				{
					opacity: 0,
					y: 0,
					scale: 0.8
				},
				{
					opacity: 1,
					y: -7,
					scale: 1,
					duration: 1,
					ease: "power3.out"
				},
				"<0.2"
			);

			// hero text reveal
			tl.to(
				".hero-header .line",
				{
					y: "0%",
					duration: 1,
					stagger: 0.1,
					ease: "power3.out"
				},
				"<"
			);
		})();

		return () => {
			mounted = false;
			tl?.kill();
		};
	});
</script>

<section class="page bg-c-bg-0 font-c-ubuntu text-c-neutral-0">
	<div class="preloader-overlay fixed inset-0 z-100 bg-c-bg-0">
		<div
			class="preloader absolute top-0 left-0 h-2 w-full origin-left scale-x-0 bg-c-accent-0"
		></div>
	</div>

	<nav
		class="fixed top-0 left-0 z-20 grid w-full grid-cols-[1fr_auto_1fr] items-start p-8"
	>
		<div class="nav-logo justify-self-start">
			<a href="/" class="text-c-neutral-0 underline underline-offset-4">
				183
			</a>
		</div>

		<div class="nav-items flex gap-16 justify-self-center">
			<a href="/" class="text-c-neutral-0 underline underline-offset-4">
				Projects
			</a>

			<a href="/" class="text-c-neutral-0 underline underline-offset-4">
				Skills
			</a>

			<a href="/" class="text-c-neutral-0 underline underline-offset-4">
				About
			</a>

			<a href="/" class="text-c-neutral-0 underline underline-offset-4">
				Contact
			</a>
		</div>

		<div class="nav-actions flex items-center justify-self-end">
			<button
				onclick={toggleTheme}
				aria-label="Toggle theme"
				class="
					translate-y-[-0.4rem]
					cursor-pointer
					rounded-full
					border
					border-c-border/40
					bg-c-bg-2/30
					px-4
					py-2
					text-c-neutral-0
					opacity-0
					backdrop-blur-xl
					transition-all
					duration-300
					will-change-transform
					hover:border-c-border
					hover:bg-c-bg-2/50
				"
			>
				{theme.current}
			</button>
		</div>
	</nav>

	<section class="hero relative h-svh w-full overflow-hidden">
		<div
			class="intro-img absolute top-1/2 left-1/2 z-2 aspect-video w-[20vw] overflow-hidden rounded-4xl will-change-transform max-[1000px]:w-[35vw]"
		>
			<img
				src="/assets/hero_images/random_0.jpg"
				alt=""
				class="block h-full w-full object-cover"
			/>
		</div>

		<div
			class="intro-img absolute top-1/2 left-1/2 z-2 aspect-video w-[20vw] overflow-hidden rounded-4xl will-change-transform max-[1000px]:w-[35vw]"
		>
			<img
				src="/assets/hero_images/random_1.jpg"
				alt=""
				class="block h-full w-full object-cover"
			/>
		</div>

		<div
			class="intro-img hero-img absolute left-1/2 top-1/2 z-1 aspect-video w-[20vw] overflow-hidden rounded-4xl will-change-transform max-[1000px]:w-[35vw]"
		>
			<img
				src="/assets/hero_images/portrait_bg_light.png"
				alt=""
				class="
					absolute inset-0 block h-full w-full object-cover
					transition-opacity duration-700
					{theme.current === 'light'
						? 'opacity-100'
						: 'opacity-0'}
				"
			/>

			<img
				src="/assets/hero_images/portrait_bg_dark.png"
				alt=""
				class="
					absolute inset-0 block h-full w-full object-cover
					transition-opacity duration-700
					{theme.current === 'dark'
						? 'opacity-100'
						: 'opacity-0'}
				"
			/>
		</div>

		<div
			class="intro-img absolute top-1/2 left-1/2 z-2 aspect-video w-[20vw] overflow-hidden rounded-4xl will-change-transform max-[1000px]:w-[35vw]"
		>
			<img
				src="/assets/hero_images/random_2.jpg"
				alt=""
				class="block h-full w-full object-cover"
			/>
		</div>

		<div
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
					class="
						filter-drop-shadow(0_4px_24px_var(--color-c-neutral-0))
						font-c-unbounded
						text-[clamp(3.5rem,8vw,9rem)]
						leading-[0.9]
						font-black
						text-c-neutral-0
						drop-shadow-[0_4px_24px_rgba(0,0,0,0.55)]
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
</section>

<style>
	:global(body) {
		margin: 0;
		overflow: hidden;
	}

	.line {
		will-change: transform;
	}
</style>
