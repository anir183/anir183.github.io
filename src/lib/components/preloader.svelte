<script>
	let { progress = $bindable() } = $props();

	let displayProgress = $state(0);
	let dots = $state("");
	let showDots = $derived(progress === undefined);

	const DOT_INTERVAL_MS = 500;
	$effect(() => {
		let rafId = 0;
		function tick() {
			if (progress !== undefined) {
				const diff = progress - displayProgress;
				if (diff > 0.005) {
					displayProgress = Math.min(
						displayProgress + Math.max(0.02, diff * 0.4),
						progress
					);
				} else {
					displayProgress = progress;
				}
			}
			rafId = requestAnimationFrame(tick);
		}
		rafId = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(rafId);
	});

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
	<p
		class="font-c-unbounded text-2xl text-c-neutral-0"
		role="status"
		aria-live="polite"
	>
		{showDots ? `Loading${dots}` : `${Math.round(displayProgress * 100)}%`}
	</p>
</div>
