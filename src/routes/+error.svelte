<script>
	import { page } from "$app/state";

	import { Crash } from "$lib";
</script>

<title>{page.status.toString()} — :/</title>

<Crash error={page.status.toString()} details={page.error?.message} />
