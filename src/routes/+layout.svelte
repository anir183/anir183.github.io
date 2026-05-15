<script>
	import "./layout.css";
	import { initTheme } from "$lib/theme.svelte.js";
	import { onMount } from "svelte";

	let { children } = $props();

	onMount(() => {
		initTheme();
	});
</script>

<svelte:head>
	<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg" />
</svelte:head>

<div
	class="relative min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] antialiased"
>
	{@render children()}
</div>
