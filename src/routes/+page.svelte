<script>
	import { theme, toggleTheme } from "$lib";
	import { onMount } from "svelte";
	import { gsap } from "gsap";

	/** @type {HTMLElement} */
	let hero;

	/** @type {HTMLHeadingElement} */
	let title;

	/** @type {HTMLParagraphElement} */
	let subtitle;

	/** @type {HTMLDivElement} */
	let cta;

	/** @type {HTMLDivElement} */
	let glow;

	/** @type {HTMLDivElement} */
	let pfpContainer;

	/** @type {HTMLImageElement} */
	let layer1;

	/** @type {HTMLImageElement} */
	let layer2;

	/** @type {HTMLDivElement} */
	let layer3;

	onMount(() => {
		/* ---------------- intro animation ---------------- */

		const tl = gsap.timeline({
			defaults: {
				ease: "power3.out"
			}
		});

		tl.from(hero, {
			opacity: 0,
			duration: 0.6
		});

		tl.from(
			title,
			{
				y: 80,
				opacity: 0,
				duration: 1
			},
			"-=0.2"
		);

		tl.from(
			subtitle,
			{
				y: 24,
				opacity: 0,
				duration: 0.8
			},
			"-=0.6"
		);

		tl.from(
			cta,
			{
				y: 20,
				opacity: 0,
				duration: 0.6
			},
			"-=0.5"
		);

		/* ---------------- glow ---------------- */

		/** @param {PointerEvent} e */
		const moveGlow = (e) => {
			const centerX = window.innerWidth / 2;
			const centerY = window.innerHeight / 2;

			const dx = (e.clientX - centerX) / centerX;
			const dy = (e.clientY - centerY) / centerY;

			gsap.to(glow, {
				x: dx * 100,
				y: dy * 100,
				duration: 1.2,
				ease: "power3.out",
				overwrite: "auto"
			});
		};

		window.addEventListener("pointermove", moveGlow);

		/* ---------------- portrait parallax ---------------- */

		const mouse = {
			x: 0,
			y: 0
		};

		const current = {
			x: 0,
			y: 0
		};

		/** @param {PointerEvent} e */
		const movePointer = (e) => {
			if (!pfpContainer) return;

			const rect = pfpContainer.getBoundingClientRect();

			const centerX = rect.left + rect.width / 2;
			const centerY = rect.top + rect.height / 2;

			mouse.x = (e.clientX - centerX) / rect.width;
			mouse.y = (e.clientY - centerY) / rect.height;
		};

		window.addEventListener("pointermove", movePointer);

		/*
			layer1 = foreground subject
			layer2 = table
			layer3 = halo
		*/

		const layers = [
			{
				el: layer1,
				rotate: 9,
				move: 17,
				rotateEnabled: true
			},
			{
				el: layer2,
				rotate: 6,
				move: 11,
				rotateEnabled: true
			},
			{
				el: layer3,
				rotate: 2,
				move: 8,
				rotateEnabled: false
			}
		];

		let frame;

		const animate = () => {
			/* smooth interpolation */

			current.x += (mouse.x - current.x) * 0.05;
			current.y += (mouse.y - current.y) * 0.05;

			layers.forEach((layer) => {
				const tx = current.x * layer.move;
				const ty = current.y * layer.move;

				if (layer.rotateEnabled) {
					const rx = -current.y * layer.rotate;
					const ry = current.x * layer.rotate;

					layer.el.style.transform = `
						translate3d(${tx}px, ${ty}px, 60px)
						rotateX(${rx}deg)
						rotateY(${ry}deg)
					`;
				} else {
					layer.el.style.transform = `
						translate3d(${tx}px, ${ty}px, -80px)
						scale(1.08)
					`;
				}
			});

			frame = requestAnimationFrame(animate);
		};

		animate();

		/* ---------------- idle floating ---------------- */

		gsap.to(pfpContainer, {
			y: "+=10",
			duration: 4,
			repeat: -1,
			yoyo: true,
			ease: "sine.inOut"
		});

		return () => {
			window.removeEventListener("pointermove", moveGlow);

			window.removeEventListener("pointermove", movePointer);

			cancelAnimationFrame(frame);
		};
	});
</script>

<section
	bind:this={hero}
	class="relative flex min-h-screen items-center overflow-hidden bg-bg px-4 py-16 text-text sm:px-6 lg:px-8"
>
	<!-- theme toggle -->
	<button
		onclick={toggleTheme}
		class="absolute top-4 right-4 z-50 rounded-xl border border-border bg-surface-2 px-4 py-2 font-bebas text-sm font-medium text-text backdrop-blur-md transition-all duration-200 hover:bg-surface"
	>
		{theme.current}
	</button>

	<!-- background glow -->
	<div
		bind:this={glow}
		class="pointer-events-none absolute top-1/2 right-[12rem] h-[34rem] w-[34rem] -translate-y-1/2 rounded-full bg-accent/14 blur-[110px] will-change-transform"
	></div>

	<!-- grid -->
	<div
		class="absolute inset-0 opacity-[0.08]"
		style="
			background-image:
				linear-gradient(
					to right,
					var(--color-muted) 1px,
					transparent 1px
				),
				linear-gradient(
					to bottom,
					var(--color-muted) 1px,
					transparent 1px
				);

			background-size: 64px 64px;
		"
	></div>

	<!-- content -->
	<div
		class="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-2"
	>
		<div class="max-w-2xl">
			<p class="mb-4 font-bebas text-xs tracking-[0.3em] text-muted uppercase">
				Cybersecurity • Systems • Full Stack
			</p>

			<h1
				bind:this={title}
				class="font-unbounded leading-none font-black tracking-tight sm:text-6xl md:text-6xl lg:text-7xl"
			>
				Hello!
				<br />
				I'm <span class="text-accent">Anirban</span>.
			</h1>

			<p
				bind:this={subtitle}
				class="mt-6 max-w-2xl font-ubuntu text-base leading-relaxed text-muted sm:text-lg md:text-xl"
			>
				B.Tech Computer Science (Cyber Security) student interested in low-level
				systems, modern web engineering, and creating fast interactive
				experiences.
			</p>

			<div bind:this={cta} class="mt-8 flex flex-wrap gap-4">
				<a
					href="https://github.com/anir183"
					target="_blank"
					rel="noopener noreferrer"
					class="rounded-xl bg-text px-6 py-3 font-ubuntu text-sm font-medium text-bg transition-transform duration-200 hover:-translate-y-1 sm:text-base"
				>
					GitHub
				</a>
			</div>
		</div>
	</div>

	<!-- portrait -->
	<div
		bind:this={pfpContainer}
		class="absolute top-1/2 right-20 hidden h-[560px] w-[440px] -translate-y-1/2 lg:block xl:right-60"
		style="
			perspective: 1400px;
			transform-style: preserve-3d;
			isolation: isolate;
		"
	>
		<div class="relative h-full w-full" style="transform-style: preserve-3d;">
			<!-- procedural halo -->
			<div
				bind:this={layer3}
				class="absolute top-1/2 left-1/2 z-10 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-[60%] will-change-transform"
			>
				<!-- main disc -->
				<div
					class="absolute inset-0 rounded-full"
					style="
			background:
				linear-gradient(
					180deg,
					color-mix(in srgb, var(--color-accent) 90%, black) 0%,
					color-mix(in srgb, var(--color-accent) 50%, transparent) 42%,
					transparent 80%
				);

			filter: blur(1px);
		"
				></div>

				<!-- soft outer bloom -->
				<div
					class="absolute inset-[-12%] rounded-full opacity-70"
					style="
			background:
				radial-gradient(
					circle,
					color-mix(in srgb, var(--color-accent) 34%, transparent) 0%,
					transparent 72%
				);

			filter: blur(42px);
		"
				></div>
			</div>

			<!-- table -->
			<img
				bind:this={layer2}
				src="/assets/pfp/pfp-layer-2.png"
				alt=""
				draggable="false"
				class="absolute inset-0 z-20 h-full w-full translate-y-1 object-contain will-change-transform select-none backface-hidden"
			/>

			<!-- foreground subject -->
			<img
				bind:this={layer1}
				src="/assets/pfp/pfp-layer-1.png"
				alt=""
				draggable="false"
				class="absolute inset-0 z-30 h-full w-full object-contain will-change-transform select-none backface-hidden"
			/>
		</div>
	</div>
</section>

<style>
	:global(img) {
		user-select: none;
		-webkit-user-drag: none;
	}

	.backface-hidden {
		backface-visibility: hidden;
		transform-style: preserve-3d;
	}

	.halo-mask {
		mask-image: radial-gradient(circle, white 55%, transparent 72%);
		-webkit-mask-image: radial-gradient(circle, white 55%, transparent 72%);
	}
</style>
