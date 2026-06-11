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
		children
	} = $props();

	/** @type {HTMLElement | undefined} */
	let el = $state();

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
			split = new SplitTextPlugin(el, {
				type: "chars,words",
				charsClass: "char",
				charsTag: "span",
				wordsClass: "word",
				wordsTag: "span"
			});

			chars = split.chars;

			gsap.set(chars, {
				x: fromX,
				opacity: 0,
				skewX: fromSkew
			});

			setupDone = true;
		}

		// Wait for start signal if not ready
		if (!start) return;

		// Phase 2: create ScrollTrigger animation
		if (st) return;

		st = ScrollTriggerPlugin.create({
			trigger: el,
			start: triggerOffset,
			animation: gsap.to(chars, {
				x: 0,
				opacity: 1,
				skewX: 0,
				stagger,
				duration,
				ease
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
		if (start && setupDone && !st && !reducedMotion) {
			initAnimation();
		}
	});

	$effect(() => {
		return () => {
			alive = false;
			st?.kill();
			split?.revert();
		};
	});
</script>

<svelte:element this={tag} bind:this={el} class={className}>
	{@render children()}
</svelte:element>

<style>
	:global(.word) {
		white-space: nowrap;
	}
</style>
