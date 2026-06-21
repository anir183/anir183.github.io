<script>
	import { gsap } from "gsap";

	let {
		tag = "h1",
		class: className = "",
		start = false,
		reducedMotion = false,
		stagger = 0.05,
		fromX = 100,
		fromSkew = 10,
		duration = 0.6,
		ease = "power3.out",
		triggerOffset = "top 85%",
		sectionId,
		triggerEl = undefined,
		children
	} = $props();

	/** @type {HTMLElement | undefined} */
	let el = $state();

	let copied = $state(false);
	let copyEnabled = $state(false);
	/** @type {ReturnType<typeof setTimeout> | undefined} */
	let copiedTimer;
	let isMobilePlatform =
		typeof window !== "undefined" &&
		window.matchMedia("(hover: none) and (pointer: coarse)").matches;

	function copy() {
		if (!sectionId) return;
		const url = `${window.location.origin}${window.location.pathname}#${sectionId}`;
		navigator.clipboard.writeText(url).catch(() => {});
		copied = true;
		clearTimeout(copiedTimer);
		copiedTimer = setTimeout(() => copied = false, 1500);
		if (!reducedMotion && chars) {
			gsap.timeline()
				.to(chars, { y: -12, opacity: 0, duration: 0.2, stagger: 0.05, ease: "power2.in" })
				.to(chars, { y: 12, duration: 0, stagger: 0.05 }, 0.2)
				.to(chars, { y: 0, opacity: 1, duration: 0.2, stagger: 0.05, ease: "power2.out" }, 0.2);
		}
	}

	/** @param {KeyboardEvent} e */
	function handleKeydown(e) {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			copy();
		}
	}

	let alive = true;
	let setupDone = false;
	/** @type {any} */
	let chars;
	/** @type {any} */
	let st;
	/** @type {any} */
	let split;

	async function initAnimation() {
		const { SplitText: SplitTextPlugin } = await import("gsap/SplitText");
		const { ScrollTrigger: ScrollTriggerPlugin } =
			await import("gsap/ScrollTrigger");

		gsap.registerPlugin(SplitTextPlugin, ScrollTriggerPlugin);

		if (!el || !alive) return;

		// Phase 1: split text and set initial invisible state
		if (!setupDone) {
			const splitType = isMobilePlatform ? "words" : "chars,words";
			split = new SplitTextPlugin(el, {
				type: splitType,
				charsClass: "char",
				charsTag: "span",
				wordsClass: "word",
				wordsTag: "span"
			});

			chars = isMobilePlatform ? split.words : split.chars;

			el.style.whiteSpace = "normal";

			gsap.set(chars, {
				x: fromX,
				opacity: 0,
				skewX: isMobilePlatform ? 0 : fromSkew
			});

			setupDone = true;
		}

		// Wait for start signal if not ready
		if (!start) return;

		// Phase 2: create ScrollTrigger animation
		if (st) return;

		const trigger = triggerEl ?? el;
		if (!trigger) return;

		const animStagger = isMobilePlatform ? 0.08 : stagger;
		const animDuration = isMobilePlatform ? 0.5 : duration;

		st = ScrollTriggerPlugin.create({
			trigger,
			start: triggerOffset,
			animation: gsap.to(chars, {
				x: 0,
				opacity: 1,
				skewX: 0,
				stagger: animStagger,
				duration: animDuration,
				ease,
				onComplete: () => { copyEnabled = true; }
			}),
			once: true
		});
	}

	// Phase 1: split text + initial state when el is ready
	$effect(() => {
		if (el && !setupDone && !reducedMotion) {
			initAnimation();
		}
	});

	// Phase 2: create ScrollTrigger when start becomes true
	$effect(() => {
		if (start && setupDone && !st && (triggerEl ?? el) && !reducedMotion) {
			initAnimation();
		}
	});

	$effect(() => {
		if (reducedMotion) copyEnabled = true;
	});

	$effect(() => {
		return () => {
			alive = false;
			st?.kill();
			split?.revert();
		};
	});
</script>

<svelte:element
	this={tag}
	bind:this={el}
	class={className}
	class:cursor-pointer={!!sectionId && copyEnabled}
	title={sectionId && copyEnabled ? "copy link to this section" : undefined}
	onclick={sectionId && copyEnabled ? copy : undefined}
	onkeydown={sectionId && copyEnabled ? handleKeydown : undefined}
	role={sectionId && copyEnabled ? "button" : undefined}
	tabindex={sectionId && copyEnabled ? 0 : undefined}
>
	{@render children()}
	{#if sectionId}
		<span class="copy-icon" class:copy-enabled={copyEnabled} aria-hidden="true">
			{#if copied}
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
			{:else}
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
			{/if}
		</span>
	{/if}
</svelte:element>

<style>
	:global(.word) {
		white-space: nowrap;
	}

	.copy-icon {
		display: inline-flex;
		align-items: center;
		vertical-align: middle;
		margin-left: 0.5rem;
		margin-right: calc(-0.5rem - 20px);
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.15s ease;
	}

	.copy-icon.copy-enabled {
		pointer-events: auto;
	}

	.cursor-pointer:hover .copy-icon,
	.cursor-pointer:focus-visible .copy-icon {
		opacity: 0.4;
	}

	.copy-icon:hover {
		opacity: 1 !important;
	}
</style>
