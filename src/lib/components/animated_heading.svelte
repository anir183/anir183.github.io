<script>
	import { gsap } from "gsap";

	let {
		tag = "h1",
		class: className = "",
		start = false,
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

	let initialized = $state(false);
	/** @type {any} */
	let st;
	/** @type {any} */
	let split;

	async function initAnimation() {
		const { SplitText: SplitTextPlugin } = await import("gsap/SplitText");
		const { ScrollTrigger: ScrollTriggerPlugin } =
			await import("gsap/ScrollTrigger");

		gsap.registerPlugin(SplitTextPlugin, ScrollTriggerPlugin);

		if (!el) return;

		split = new SplitTextPlugin(el, {
			type: "chars",
			charsClass: "char"
		});

		const chars = split.chars;

		gsap.set(chars, {
			x: fromX,
			opacity: 0,
			skewX: fromSkew
		});

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

	$effect(() => {
		if (start && el && !initialized) {
			initialized = true;
			initAnimation();
		}
	});

	$effect(() => {
		return () => {
			st?.kill();
			split?.revert();
		};
	});
</script>

{#if tag === "h1"}
	<h1 bind:this={el} class={className}>
		{@render children()}
	</h1>
{:else if tag === "h2"}
	<h2 bind:this={el} class={className}>
		{@render children()}
	</h2>
{:else if tag === "h3"}
	<h3 bind:this={el} class={className}>
		{@render children()}
	</h3>
{:else if tag === "h4"}
	<h4 bind:this={el} class={className}>
		{@render children()}
	</h4>
{/if}
