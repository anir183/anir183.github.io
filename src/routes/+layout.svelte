<script>
	import "./layout.css";
	import { initTheme } from "$lib/utils/theme.svelte.js";
	import { crash } from "$lib/utils/assert.svelte";
	import { onMount } from "svelte";

	let { children } = $props();

	onMount(() => {
		initTheme();
	});
</script>

<svelte:head>
	<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg" />
	<script>
		// NOTE: this is used to mitigate theme flicker on loads, caused by
		//       delay before onMount() is called

		const saved = localStorage.getItem("theme");
		const prefersLight = window.matchMedia(
			"(prefers-color-scheme: light)"
		).matches;
		const prefersDark = window.matchMedia(
			"(prefers-color-scheme: dark)"
		).matches;

		const root = document.documentElement;
		root.classList.remove("light", "dark");

		if (saved === "light" || prefersLight) {
			root.classList.add("light");
		}

		if (saved === "dark" || prefersDark) {
			root.classList.add("dark");
		}
	</script>
</svelte:head>

{#if crash.occurred}
	<section
		class="flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg)]"
	>
		<h1 class="text-7xl font-black tracking-tight text-[var(--color-error)]">
			{crash.error ? crash.error.name : "unknown error"}
		</h1>

		<p class="mt-4 text-xl text-[var(--color-muted)]">
			{crash.error ? crash.error.message : "something went wrong"}
		</p>
	</section>
{:else}
	<div
		class="relative min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] antialiased"
	>
		{@render children()}
	</div>
{/if}
