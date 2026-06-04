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
</script>

<div
	class="group relative inline-flex w-fit items-center overflow-hidden {className}"
>
	<a
		bind:this={el}
		{href}
		class="relative text-c-neutral-0 no-underline transition-colors duration-200 group-hover:text-c-bg-0"
	>
		<span class="relative z-10">
			{@render children()}
		</span>
		<span
			class="absolute inset-y-[-4px] right-0 left-0 -z-10 -translate-x-[calc(100%+32px)] -skew-x-6 bg-c-accent-0 transition-transform duration-[400ms] ease-out group-hover:translate-x-0"
		></span>
	</a>
</div>
