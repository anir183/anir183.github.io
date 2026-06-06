<script>
	import { onMount } from "svelte";
	import { fade } from "svelte/transition";
	import {
		Wip,
		Footer,
		Preloader,
		loadAllImages,
		BODY_SCROLL_LOCK
	} from "$lib";

	let preloaderVisible = $state(true);
	let progress = $state(0);
	let preloaderDone = $state(false);

	onMount(() => {
		let mounted = true;

		document.body.classList.add(BODY_SCROLL_LOCK);

		loadAllImages((/** @type {number} */ pct) => {
			if (!mounted) return;
			progress = pct;
		})
			.then(() => document.fonts.ready)
			.then(() => {
				if (!mounted) return;
				return new Promise((resolve) =>
					requestAnimationFrame(resolve)
				).then(() => {
					return new Promise((resolve) => {
						if (preloaderDone) return resolve(undefined);
						const check = () =>
							requestAnimationFrame(() => {
								if (preloaderDone) resolve(undefined);
								else check();
							});
						check();
					});
				});
			})
			.then(() => {
				preloaderVisible = false;
			})
			.catch(() => {
				preloaderVisible = false;
			})
			.finally(() => {
				if (!mounted) return;
				document.body.classList.remove(BODY_SCROLL_LOCK);
			});

		return () => {
			mounted = false;
			document.body.classList.remove(BODY_SCROLL_LOCK);
		};
	});
</script>

<svelte:head>
	<title>Projects — anir183</title>
</svelte:head>

{#if preloaderVisible}
	<div transition:fade={{ duration: 500 }} class="relative z-50">
		<Preloader bind:progress bind:done={preloaderDone} />
	</div>
{/if}

<Wip animationDelay={700} />
<Footer />
