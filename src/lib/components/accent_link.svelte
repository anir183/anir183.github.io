<script>
	let {
		/** @type {string | undefined} */
		href = "#",
		/** @type {string} */
		class: className = "",
		/** @type {HTMLAnchorElement | undefined} */
		el = $bindable(),
		children
	} = $props();

	let isExternal = $derived(href.startsWith("http"));
</script>

<a
	bind:this={el}
	{href}
	target={isExternal ? "_blank" : undefined}
	rel={isExternal ? "noopener noreferrer" : undefined}
	class="group relative inline-flex w-fit items-center overflow-hidden text-c-neutral-0 no-underline transition-colors duration-200 hover:text-c-bg-0 {className}"
>
	<span class="relative">
		<span class="relative z-10">
			{@render children()}
		</span>
		<span
			class="absolute inset-y-[-4px] right-0 left-0 -z-10 -translate-x-[calc(100%+32px)] -skew-x-6 bg-c-accent-0 transition-transform duration-[400ms] ease-out group-hover:translate-x-0"
		></span>
	</span>
</a>
