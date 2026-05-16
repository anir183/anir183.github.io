<script>
	import "./layout.css";
	import { initTheme } from "$lib/theme.svelte.js";
	import { crash } from "$lib/utils/assert.svelte";
	import { onMount } from "svelte";

	let { children } = $props();

	onMount(() => {
		initTheme();
	});
</script>

<svelte:head>
	<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg" />
</svelte:head>

{#if crash.occurred}
	<section
		class="flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg)]"
	>
		<h1 class="text-7xl font-black tracking-tight text-[var(--color-text)]">
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
