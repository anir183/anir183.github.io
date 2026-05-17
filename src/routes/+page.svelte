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

	onMount(() => {
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

		/** @param {PointerEvent} e */
		const moveGlow = (e) => {
			const centerX = window.innerWidth / 2;
			const centerY = window.innerHeight / 2;

			const dx = (e.clientX - centerX) / centerX;

			const dy = (e.clientY - centerY) / centerY;

			gsap.to(glow, {
				x: dx * 120,
				y: dy * 120,
				duration: 1,
				ease: "power3.out"
			});
		};

		window.addEventListener("pointermove", moveGlow);

		return () => {
			window.removeEventListener("pointermove", moveGlow);
		};
	});
</script>

<section
	bind:this={hero}
	class="relative flex min-h-screen items-center overflow-hidden bg-bg px-4 py-16 text-text sm:px-6 lg:px-8"
>
	<button
		onclick={toggleTheme}
		class="absolute top-4 right-4 z-50 rounded-xl border border-border bg-surface-2 px-4 py-2 font-bebas text-sm font-medium text-text backdrop-blur-md transition-all duration-200 hover:bg-surface active:translate-y-0"
	>
		{theme.current}
	</button>

	<!-- glow -->
	<div
		bind:this={glow}
		class="pointer-events-none absolute top-1/2 left-1/2 h-96 w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl will-change-transform sm:h-128 sm:w-lg md:h-152 md:w-152"
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

	<div class="relative z-10 mx-auto w-full max-w-7xl">
		<div class="max-w-4xl">
			<p
				class="mb-4 font-bebas font-black text-xs tracking-[0.25em] text-muted uppercase sm:mb-6 sm:text-sm sm:tracking-[0.3em]"
			>
				Cybersecurity • Systems • Full Stack
			</p>

			<h1
				bind:this={title}
				class="font-unbounded text-5xl leading-none font-black tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
			>
				Hello!
				<br />
				I'm <span class="text-accent">Anirban</span>.
			</h1>

			<p
				bind:this={subtitle}
				class="mt-6 max-w-2xl font-ubuntu text-base leading-relaxed text-muted sm:mt-8 sm:text-lg md:text-xl"
			>
				B.Tech Computer Science (Cyber Security) student interested in low-level
				systems, modern web engineering, and creating fast interactive
				experiences.
			</p>

			<div bind:this={cta} class="mt-8 flex flex-wrap gap-3 sm:mt-10 sm:gap-4">
				<a
					href="https://github.com/anir183"
					target="_blank"
					rel="noopener noreferrer"
					class="rounded-xl bg-text font-ubuntu px-5 py-3 text-sm font-medium text-bg transition-transform duration-200 hover:-translate-y-1 sm:px-6 sm:text-base"
				>
					GitHub
				</a>
			</div>
		</div>
	</div>

	<!-- floating card -->
	<div
		class="absolute right-4 bottom-4 hidden w-64 rounded-2xl border border-border bg-white/5 p-4 backdrop-blur-xl md:right-6 md:bottom-6 md:w-72 md:p-5 lg:block"
	>
		<div class="flex items-center justify-between">
			<p class="font-bebas text-xs tracking-widest text-muted">STATUS</p>

			<div class="h-2 w-2 rounded-full bg-success"></div>
		</div>

		<p class="mt-4 text-base font-unbounded font-semibold md:text-lg">
			Curious.
		</p>

		<p class="mt-3 font-ubuntu text-sm leading-relaxed text-muted">
			Interested in web and app development, systems engineering, cybersecurity,
			and anything computers.
		</p>
	</div>
</section>
