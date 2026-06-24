<script>
	import "./layout.css";

	import { onMount } from "svelte";
	import { fade } from "svelte/transition";
	import { browser } from "$app/environment";
	import { beforeNavigate, afterNavigate, goto } from "$app/navigation";

	import "$lib/devicon-used.css";
	import { initTheme, assert_failure, Crash, markSpaNavigation } from "$lib";
	import { autoHideScrollbar } from "$lib/actions/scrollbar_hide.svelte.js";
	import CustomCursor from "$lib/components/CustomCursor.svelte";

	let { children } = $props();

	let reducedMotion = $state(
		browser && window.matchMedia("(prefers-reduced-motion: reduce)").matches
	);
	let overlayVisible = $state(false);
	let pendingUrl = $state(/** @type {string | null} */ (null));

	beforeNavigate(({ to, cancel }) => {
		if (!to) return;

		const current = window.location.pathname;
		const target = new URL(to.url).pathname;
		if (target === current) return;

		markSpaNavigation();

		if (pendingUrl !== null && pendingUrl === to.url.href) {
			pendingUrl = null;
			return;
		}

		cancel();
		overlayVisible = true;

		setTimeout(() => {
			pendingUrl = to.url.href;
			goto(to.url);
		}, 400);
	});

	afterNavigate(() => {
		overlayVisible = false;
	});

	onMount(() => {
		initTheme();
		document.documentElement.classList.add("scrollbar-thin");
		autoHideScrollbar(document.documentElement);
	});
</script>

<svelte:head>
	<link rel="icon" type="image/svg+xml" href="/assets/branding/logo_w_bg.svg" />
	<meta
		name="description"
		content="Anirban RoyChowdhury — full-stack developer & cyber security student. Portfolio showcasing projects, skills, and experience."
	/>
	<meta property="og:title" content="anir183" />
	<meta
		property="og:description"
		content="Anirban RoyChowdhury — full-stack developer & cyber security student. Portfolio showcasing projects, skills, and experience."
	/>
	<meta property="og:type" content="website" />
	<meta
		property="og:image"
		content="https://anir183.is-a.dev/assets/branding/banner.jpg"
	/>
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:type" content="image/jpeg" />
	<meta name="twitter:card" content="summary_large_image" />
	<link rel="canonical" href="https://anir183.is-a.dev" />
	<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "Person",
			"name": "Anirban RoyChowdhury",
			"url": "https://anir183.is-a.dev",
			"jobTitle": "Full-Stack Developer & Cyber Security Student",
			"sameAs": [
				"https://github.com/anir183",
				"https://www.linkedin.com/in/anir183"
			]
		}
	</script>
	<script>
		// NOTE: removes theme switch flicker due to delay before onMount
		if (typeof localStorage !== "undefined" && typeof window !== "undefined") {
			const saved = localStorage.getItem("theme");
			const prefersDark = window.matchMedia(
				"(prefers-color-scheme: dark)"
			).matches;

			const root = document.documentElement;
			root.classList.remove("dark");

			if (saved === "dark" || (!saved && prefersDark)) {
				root.classList.add("dark");
			}
		}
	</script>
</svelte:head>

{#if overlayVisible}
	<div
		in:fade={{ duration: reducedMotion ? 0 : 400 }}
		class="fixed inset-0 z-40 bg-c-bg-0"
	></div>
{/if}

<a
	href="#main-content"
	class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:bg-c-accent-0 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-c-bg-0"
	>Skip to content</a
>

{#if assert_failure.occurred}
	<Crash
		error={assert_failure.error?.name}
		details={assert_failure.error?.message}
		reload={true}
	/>
{:else}
	<main
		id="main-content"
		class="relative min-h-svh overflow-x-clip bg-c-bg-0 text-c-neutral-0 antialiased"
	>
		{@render children()}
	</main>
{/if}

<CustomCursor />
