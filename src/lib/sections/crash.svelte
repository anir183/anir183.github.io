<script>
	import { gsap } from "gsap";
	import { onMount } from "svelte";
	import { AccentLink, AccentButton } from "$lib";

	let { error = "unknown error", details = "something went wrong", reload = false } = $props();

	/** @type {HTMLHeadingElement | undefined} */
	let title = $state();

	/** @type {HTMLParagraphElement | undefined} */
	let subtitle = $state();

	/** @type {HTMLElement | undefined} */
	let sectionEl = $state();

	/** @type {HTMLElement | undefined} */
	let glowEl = $state();

	/** @type {HTMLElement | undefined} */
	let ctaEl = $state();

	let reducedMotion = $state(false);
	let hidden = $state(true);

	/** @type {gsap.core.Timeline | undefined} */
	let tl;

	/** @type {any} */
	let errorSplit;

	/** @type {any} */
	let detailsSplit;

	/** @type {() => void} */
	let cleanupGlow;

	onMount(() => {
		reducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)"
		).matches;

		if (reducedMotion) {
			hidden = false;
			return;
		}

		initSplitText();

		initGlow();

		return () => {
			tl?.kill();
			errorSplit?.revert();
			detailsSplit?.revert();
			cleanupGlow?.();
		};
	});

	async function initSplitText() {
		if (!title || !subtitle) return;

		const { SplitText } = await import("gsap/SplitText");
		gsap.registerPlugin(SplitText);

		errorSplit = new SplitText(title, {
			type: "lines",
			linesClass: "line",
			mask: "lines",
			autoSplit: true
		});

		detailsSplit = new SplitText(subtitle, {
			type: "lines",
			linesClass: "line",
			mask: "lines",
			autoSplit: true
		});

		const titleLines = [...title.querySelectorAll(".line")];
		const detailsLines = [...subtitle.querySelectorAll(".line")];

		gsap.set([...titleLines, ...detailsLines], {
			y: "125%",
			willChange: "transform"
		});

		if (ctaEl) gsap.set(ctaEl, { y: 20, opacity: 0 });

		hidden = false;

		tl = gsap.timeline();

		tl.to(titleLines, {
			y: "0%",
			duration: 0.8,
			stagger: 0.1,
			ease: "power3.out"
		});

		tl.to(
			detailsLines,
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
	}

	function initGlow() {
		if (!sectionEl) return;

		const glow = document.createElement("div");
		glow.className = "glow-trail";
		glow.style.cssText = `
			position: fixed;
			pointer-events: none;
			width: 600px;
			height: 600px;
			border-radius: 50%;
			background: radial-gradient(circle at center, color-mix(in srgb, var(--color-c-error) 15%, transparent) 0%, transparent 70%);
			z-index: 0;
			will-change: transform;
		`;
		sectionEl.prepend(glow);
		glowEl = glow;

		const toX = gsap.quickTo(glow, "x", {
			duration: 1.4,
			ease: "power3.out"
		});
		const toY = gsap.quickTo(glow, "y", {
			duration: 1.4,
			ease: "power3.out"
		});

		/**
		 * @param {PointerEvent} e
		 */
		function onMove(e) {
			toX(e.clientX);
			toY(e.clientY);
		}

		function onLeave() {
			gsap.to(glow, {
				opacity: 0,
				duration: 0.4,
				ease: "power2.out"
			});
		}

		function onEnter() {
			gsap.to(glow, {
				opacity: 1,
				duration: 0.4,
				ease: "power2.out"
			});
		}

		window.addEventListener("pointermove", onMove, { passive: true });
		window.addEventListener("pointerleave", onLeave, { passive: true });
		window.addEventListener("pointerenter", onEnter, { passive: true });

		gsap.set(glow, { opacity: 0 });

		cleanupGlow = () => {
			window.removeEventListener("pointermove", onMove);
			window.removeEventListener("pointerleave", onLeave);
			window.removeEventListener("pointerenter", onEnter);
			glow.remove();
		};
	}
</script>

<section
	bind:this={sectionEl}
	class="relative flex min-h-screen flex-col overflow-hidden bg-c-bg-0"
	class:opacity-0={hidden}
>
	<div class="flex flex-1 flex-col items-center justify-center gap-8 px-4 text-center">
		<h1
			bind:this={title}
			class="relative z-10 font-c-unbounded text-8xl font-black tracking-tight text-c-error max-lg:text-6xl"
		>
			{error}
		</h1>

		<p
			bind:this={subtitle}
			class="relative z-10 max-w-xl font-c-ubuntu text-2xl text-c-neutral-1 max-lg:text-lg"
		>
			{details}
		</p>
	</div>

	<div bind:this={ctaEl} class="flex justify-center pb-12">
		{#if reload}
			<AccentButton
				onclick={() => location.reload()}
				class="-translate-x-3 px-4 py-1.5 font-c-unbounded text-base font-bold underline lg:text-lg"
			>
				Reload Site
			</AccentButton>
		{:else}
			<AccentLink
				href="/"
				class="-translate-x-3 px-4 py-1.5 font-c-unbounded text-base font-bold lg:text-lg"
			>
				Back to Home
			</AccentLink>
		{/if}
	</div>
</section>
