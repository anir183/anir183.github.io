<script>
	import { page } from "$app/state";
	import { resolve } from "$app/paths";

	import { Crash } from "$lib";
</script>

<Crash error={page.status.toString()} details={page.error?.message} />

<a
	href={resolve("/")}
	class="fixed bottom-8 left-1/2 z-10 -translate-x-1/2 rounded-full border border-c-border/40 bg-c-bg-2/30 px-8 py-4 font-c-ubuntu text-base text-c-neutral-0 backdrop-blur-xl transition-all duration-300 hover:border-c-border hover:bg-c-bg-2/50"
>
	← Go Home
</a>
