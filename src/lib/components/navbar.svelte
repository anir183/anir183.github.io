<script>
	import { resolve } from "$app/paths";
	import { theme, toggleTheme } from "$lib";

	let {
		navEl = $bindable(),
		themeBtn = $bindable(),
	} = $props();
</script>

<nav
	bind:this={navEl}
	class="fixed top-0 left-0 z-20 grid w-full grid-cols-[1fr_auto_1fr] items-start p-8 max-[1000px]:px-6"
>
	<div class="nav-logo justify-self-start">
		<a href={resolve("/")} class="text-c-neutral-0 underline underline-offset-4"> 183 </a>
	</div>

	<div class="nav-items flex gap-16 justify-self-center max-[1000px]:gap-8">
		<a href={resolve("/")} class="text-c-neutral-0 underline underline-offset-4">Projects</a>
		<a href={resolve("/")} class="text-c-neutral-0 underline underline-offset-4">Skills</a>
		<a href={resolve("/")} class="text-c-neutral-0 underline underline-offset-4">About</a>
		<a href={resolve("/")} class="text-c-neutral-0 underline underline-offset-4">Contact</a>
	</div>

	<div class="nav-actions flex items-center justify-self-end">
		<button
			bind:this={themeBtn}
			onclick={toggleTheme}
			aria-label="Toggle theme"
			class="
				translate-y-[-0.4rem]
				cursor-pointer
				rounded-full
				border
				border-c-border/40
				bg-c-bg-2/30
				px-4
				py-2
				text-c-neutral-0
				opacity-0
				backdrop-blur-xl
				transition-all
				duration-300
				will-change-transform
				hover:border-c-border
				hover:bg-c-bg-2/50
			"
		>
			{theme.current}
		</button>
	</div>
</nav>
