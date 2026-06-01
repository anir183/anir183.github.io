<script>
	let dots = $state("");

	const DOT_INTERVAL_MS = 500;

	$effect(() => {
		const interval = setInterval(() => {
			dots = dots.length >= 3 ? "" : dots + ".";
		}, DOT_INTERVAL_MS);

		return () => clearInterval(interval);
	});
</script>

<div
	class="fixed inset-0 z-100 flex flex-col items-center justify-center gap-4 bg-c-bg-0"
>
	<p class="font-c-unbounded text-2xl text-c-neutral-0">
		Loading{dots}
	</p>
</div>
