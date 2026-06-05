<script>
	let {
		/** @type {string} */
		class: className = "",
		onclick = undefined,
		/** @type {HTMLElement | undefined} */
		el = $bindable(),
		children
	} = $props();
</script>

<div
	class="group relative inline-flex w-fit items-center overflow-hidden {className}"
>
	<button
		bind:this={el}
		{onclick}
		class="relative cursor-pointer text-c-neutral-0 outline-none transition-colors duration-200 hover:text-c-bg-0"
	>
		<span class="relative z-10">
			{@render children()}
		</span>
		<span
			class="absolute inset-y-[-4px] right-0 left-0 -z-10 -translate-x-[calc(100%+32px)] -skew-x-6 bg-c-accent-0 transition-transform duration-[400ms] ease-out group-hover:translate-x-0"
		></span>
	</button>
</div>
