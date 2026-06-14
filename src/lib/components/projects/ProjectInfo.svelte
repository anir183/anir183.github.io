<script>
	import { gsap } from "gsap";
	import { AccentLink } from "$lib";

	let {
		number = "",
		title = "",
		description = "",
		tags = [],
		link = "",
		sectionId,
		reducedMotion = false
	} = $props();

	/** @type {HTMLElement | undefined} */
	let h3El = $state();

	/** @type {any} */
	let splitInstance = $state(null);

	let copied = $state(false);
	/** @type {ReturnType<typeof setTimeout> | undefined} */
	let copiedTimer;

	$effect(() => {
		if (h3El && !splitInstance) initSplit();
	});

	async function initSplit() {
		const el = h3El;
		if (!el) return;
		const { SplitText } = await import("gsap/SplitText");
		const s = new SplitText(el, { type: "chars,words", charsClass: "char", charsTag: "span", wordsClass: "word", wordsTag: "span" });
		el.style.whiteSpace = "normal";
		for (const w of /** @type {HTMLElement[]} */ (s.words)) {
			w.style.whiteSpace = "nowrap";
		}
		splitInstance = s;
	}

	function copy() {
		if (!sectionId) return;
		const url = `${window.location.origin}${window.location.pathname}#${sectionId}`;
		navigator.clipboard.writeText(url).catch(() => {});
		copied = true;
		clearTimeout(copiedTimer);
		copiedTimer = setTimeout(() => copied = false, 1500);
		if (!reducedMotion && splitInstance) {
			gsap.timeline()
				.to(splitInstance.chars, { y: -12, opacity: 0, duration: 0.2, stagger: 0.05, ease: "power2.in" })
				.to(splitInstance.chars, { y: 12, duration: 0, stagger: 0.05 }, 0.2)
				.to(splitInstance.chars, { y: 0, opacity: 1, duration: 0.2, stagger: 0.05, ease: "power2.out" }, 0.2);
		}
	}

	/** @param {KeyboardEvent} e */
	function handleKeydown(e) {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			copy();
		}
	}
</script>

<div class="flex flex-col gap-4 lg:gap-6">
	<span
		data-pi="number"
		class="block font-c-jetbrains text-[clamp(1.5rem,6vw,3rem)] font-black text-c-accent-0/60 leading-none select-none"
	>
		{number}
	</span>

	<h3
		bind:this={h3El}
		data-pi="title"
		class="font-c-unbounded text-[clamp(1.5rem,5vw,2.75rem)] font-black leading-tight text-c-neutral-0"
		class:cursor-pointer={!!sectionId}
		title={sectionId ? "Copy link" : undefined}
		onclick={sectionId ? copy : undefined}
		onkeydown={sectionId ? handleKeydown : undefined}
		role={sectionId ? "button" : undefined}
		tabindex={sectionId ? 0 : undefined}
	>
		{title}
		{#if sectionId}
			<span class="copy-icon" aria-hidden="true">
				{#if copied}
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
				{:else}
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
				{/if}
			</span>
		{/if}
	</h3>

	<p data-pi="desc" class="text-base max-sm:text-xs leading-relaxed text-c-neutral-1 font-c-ubuntu lg:text-xl max-w-prose">
		{description}
	</p>

	{#if tags.length}
		<div data-pi="tags" class="flex flex-wrap gap-1.5">
			{#each tags as tag}
				<span
					class="rounded-full border border-c-accent-0/15 px-2.5 py-0.5 text-xs text-c-accent-0 font-c-ubuntu"
				>
					{tag}
				</span>
			{/each}
		</div>
	{/if}

	{#if link}
		<div data-pi="link">
			<AccentLink href={link} class="-translate-x-3 px-3 py-1 font-c-unbounded text-xs font-bold lg:text-sm">
				View Project
			</AccentLink>
		</div>
	{/if}
</div>

<style>
	.copy-icon {
		display: inline-flex;
		align-items: center;
		vertical-align: middle;
		margin-left: 0.5rem;
		opacity: 0;
		transition: opacity 0.15s ease;
	}

	.cursor-pointer:hover .copy-icon,
	.cursor-pointer:focus-visible .copy-icon {
		opacity: 0.4;
	}

	.copy-icon:hover {
		opacity: 1 !important;
	}
</style>

