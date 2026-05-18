<script>
	import { page } from "$app/state";

	import { Crash } from "$lib";
</script>

<Crash error={page.status.toString()} details={page.error?.message} />
