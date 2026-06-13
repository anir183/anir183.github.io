<script>
	import "./layout.css";

	import { onMount } from "svelte";
	import { fade } from "svelte/transition";
	import { browser } from "$app/environment";
	import { beforeNavigate, afterNavigate, goto } from "$app/navigation";

	import { initTheme, assert_failure, Crash, markSpaNavigation, DotGrid } from "$lib";

	let { children } = $props();

	let reducedMotion = $state(browser && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
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
	});
</script>

<svelte:head>
	<title>anir183</title>
	<link rel="icon" type="image/svg+xml" href="/assets/branding/logo_w_bg.svg" />
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

{#if assert_failure.occurred}
	<Crash
		error={assert_failure.error?.name}
		details={assert_failure.error?.message}
		reload={true}
	/>
{:else}
	<div class="relative min-h-screen overflow-x-clip bg-c-bg-0 text-c-neutral-0 antialiased">
		<DotGrid {reducedMotion} />
		{@render children()}
	</div>
{/if}
