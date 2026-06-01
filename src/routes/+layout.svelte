<script>
	import "./layout.css";

	import { onMount } from "svelte";

	import { initTheme, assert_failure, Crash } from "$lib";

	let { children } = $props();

	onMount(() => {
		initTheme();
	});
</script>

<svelte:head>
	<title>anir183</title>
	<link rel="icon" type="image/svg+xml" href="/assets/branding/logo_w_bg.svg" />
	<script>
		// NOTE: removes theme switch flicker due to delay before onMount
		const saved = localStorage.getItem("theme");
		const prefersDark = window.matchMedia(
			"(prefers-color-scheme: dark)"
		).matches;

		const root = document.documentElement;
		root.classList.remove("dark");

		if (saved === "dark" || (!saved && prefersDark)) {
			root.classList.add("dark");
		}
	</script>
</svelte:head>

{#if assert_failure.occurred}
	<Crash
		error={assert_failure.error?.name}
		details={assert_failure.error?.message}
	/>
{:else}
	<div class="relative min-h-screen bg-c-bg-0 text-c-neutral-0 antialiased">
		{@render children()}
	</div>
{/if}
