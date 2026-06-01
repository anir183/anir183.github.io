<script>
	let { progress = $bindable() } = $props();

	let dots = $state("");
	let showDots = $derived(progress === undefined);

	const DOT_INTERVAL_MS = 500;

	$effect(() => {
		if (!showDots) return;
		const interval = setInterval(() => {
			dots = dots.length >= 3 ? "" : dots + ".";
		}, DOT_INTERVAL_MS);

		return () => clearInterval(interval);
	});
</script>

<div
	class="fixed inset-0 z-100 flex flex-col items-center justify-center bg-c-bg-0"
>
	<p class="font-c-unbounded text-2xl text-c-neutral-0">
		{showDots ? `Loading${dots}` : `${Math.round(progress * 100)}%`}
	</p>
</div>
