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
	<title>anir183 // portfolio</title>
	<link rel="icon" type="image/svg+xml" href="/assets/branding/logo_w_bg.svg" />
	<script>
		// NOTE: this is used to mitigate theme flicker on loads, caused by
		//       delay before onMount() is called

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

{#if crash.occurred}
	<section
		class="flex min-h-screen flex-col items-center justify-center bg-bg"
	>
		<h1 class="text-7xl font-unbounded font-black tracking-tight text-error">
			{crash.error ? crash.error.name : "unknown error"}
		</h1>

		<p class="mt-4 font-ubuntu text-xl text-muted">
			{crash.error ? crash.error.message : "something went wrong"}
		</p>
	</section>
{:else}
	<div
		class="relative min-h-screen bg-bg text-text antialiased"
	>
		{@render children()}
	</div>
{/if}
