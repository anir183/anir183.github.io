<script>
	import { page } from "$app/state";

	import { Crash } from "$lib";
</script>

<svelte:head>
	<title>{page.status.toString()} — :/</title>
</svelte:head>

<Crash error={page.status.toString()} details={page.error?.message} />
