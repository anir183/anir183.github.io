<script>
	import { onMount, tick } from "svelte";
	import { resolve } from "$app/paths";
	import { browser } from "$app/environment";
	import { fade, fly } from "svelte/transition";
	import {
		theme,
		themes,
		toggleTheme,
		staggerWipeIn,
		STAGGER_FAST
	} from "$lib";

	let {
		navEl = $bindable(),
		themeBtn = $bindable(),
		hamburgerBtn = $bindable(),
		logoEl = $bindable(),
		navItems = [
			{ label: "Projects", href: resolve("/#projects") },
			{ label: "Skills", href: resolve("/#skills") },
			{ label: "About", href: resolve("/#about") },
			{ label: "Socials", href: resolve("/#socials") }
		]
	} = $props();

	let reducedMotion = $state(browser && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
	let mobileMenuOpen = $state(false);
	/** @type {HTMLElement | undefined} */
	let mobilePanelEl = $state();
	/** @type {HTMLElement | undefined} */
	let mobileLinksEl = $state();
	let scrolled = $state(false);

	/** @type {gsap.core.Tween | undefined} */
	let mobileTween;

	$effect(() => {
		if (mobileMenuOpen) {
			tick().then(() => {
				if (!mobileMenuOpen || !mobileLinksEl) return;
				const links = [...mobileLinksEl.querySelectorAll("a")];
				mobileTween = staggerWipeIn({
					targets: links,
					from: "bottom",
					stagger: STAGGER_FAST,
					duration: 0.5,
					delay: 0.1,
					reducedMotion
				});
				mobilePanelEl?.focus();
			});
		} else {
			mobileTween?.kill();
			mobileTween = undefined;
		}
	});

	$effect(() => {
		if (mobileMenuOpen) {
			const handler = (/** @type {KeyboardEvent} */ e) => {
				if (e.key === "Escape") mobileMenuOpen = false;
			};
			window.addEventListener("keydown", handler);
			return () => window.removeEventListener("keydown", handler);
		}
	});

	onMount(() => {
		scrolled = window.scrollY > 10;
		const onScroll = () => {
			scrolled = window.scrollY > 10;
		};
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	});

</script>

<nav
	bind:this={navEl}
	class="fixed top-0 left-0 z-30 flex w-full items-center justify-between border-b px-8 py-4 transition-all duration-500 max-lg:px-6 max-lg:py-3 {scrolled
		? 'border-c-border/20 bg-c-bg-0/70 backdrop-blur-xl'
		: 'border-transparent'}"
>
	<a
		bind:this={logoEl}
		href={resolve("/")}
		class="flex shrink-0 items-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
		aria-label="anir183"
	>
		<div class="relative h-10 w-10 translate-y-[1px] max-lg:h-9 max-lg:w-9">
			<img
				src="/assets/branding/logo_light.svg"
				alt=""
				class="absolute inset-0 block h-full w-full transition-opacity duration-700 {theme.current ===
				themes.DARK
					? 'opacity-100'
					: 'opacity-0'}"
			/>
			<img
				src="/assets/branding/logo_dark.svg"
				alt=""
				class="absolute inset-0 block h-full w-full transition-opacity duration-700 {theme.current ===
				themes.LIGHT
					? 'opacity-100'
					: 'opacity-0'}"
			/>
		</div>
	</a>

	<div class="mr-8 ml-auto flex items-center gap-2 max-lg:hidden">
		{#each navItems as item (item.label)}
			<a
				href={item.href}
				class="group relative overflow-hidden px-7 py-3 no-underline"
			>
				<span
					class="relative inline-flex items-center overflow-hidden font-c-bebas text-lg font-bold tracking-widest text-c-neutral-0 transition-colors duration-200 group-hover:text-c-bg-0"
				>
					<span
						class="absolute inset-0 translate-y-full -skew-x-6 bg-c-accent-0 transition-transform duration-[400ms] ease-out group-hover:translate-y-0"
					></span>
					<span class="relative z-10">{item.label}</span>
				</span>
			</a>
		{/each}
	</div>
	<div class="flex items-center gap-2">
		<button
			bind:this={themeBtn}
			onclick={toggleTheme}
			aria-label="Toggle theme"
			class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-c-border/40 bg-c-bg-2/30 text-lg text-c-neutral-0 opacity-0 backdrop-blur-xl transition-all duration-300 hover:border-c-border hover:bg-c-bg-2/50 max-lg:h-9 max-lg:w-9"
		>
			<img
				src={theme.current === themes.DARK
					? "/assets/icons/sun_light.svg"
					: "/assets/icons/moon_dark.svg"}
				alt=""
				class="block h-[14px] w-[14px]"
			/>
		</button>

		<button
			bind:this={hamburgerBtn}
			onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
			class="relative ml-2 h-10 w-10 cursor-pointer opacity-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)] lg:hidden"
			aria-label="Toggle menu"
		>
			<span
				class="absolute left-1/2 block h-0.5 w-7 -translate-x-1/2 rounded-full bg-c-neutral-0 transition-all duration-300"
				class:top-[10px]={!mobileMenuOpen}
				class:top-[19px]={mobileMenuOpen}
				class:rotate-45={mobileMenuOpen}
			></span>
			<span
				class="absolute top-[19px] left-1/2 block h-0.5 w-7 -translate-x-1/2 rounded-full bg-c-neutral-0 transition-all duration-300"
				class:opacity-0={mobileMenuOpen}
			></span>
			<span
				class="absolute left-1/2 block h-0.5 w-7 -translate-x-1/2 rounded-full bg-c-neutral-0 transition-all duration-300"
				class:top-[28px]={!mobileMenuOpen}
				class:top-[19px]={mobileMenuOpen}
				class:-rotate-45={mobileMenuOpen}
			></span>
		</button>
	</div>
</nav>

{#if mobileMenuOpen}
	<div class="fixed inset-0 z-40">
		<div
			class="absolute inset-0 bg-black/40 backdrop-blur-sm"
			onclick={() => (mobileMenuOpen = false)}
			role="presentation"
			transition:fade={{ duration: reducedMotion ? 0 : 150 }}
		></div>

		<div
			bind:this={mobilePanelEl}
			tabindex="-1"
			class="absolute top-0 right-0 flex h-full w-80 flex-col items-center justify-center bg-c-bg-0 shadow-2xl outline-none max-sm:w-full"
			transition:fly={{ duration: reducedMotion ? 0 : 250, x: reducedMotion ? 0 : 400 }}
		>
			<button
				onclick={() => (mobileMenuOpen = false)}
				aria-label="Close menu"
				class="absolute top-6 right-6 z-20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-c-border/40 bg-c-bg-2/30 text-lg text-c-neutral-0 transition-all duration-300 hover:border-c-border hover:bg-c-bg-2/50"
			>
				✕
			</button>

			<div bind:this={mobileLinksEl} class="flex flex-col items-center gap-6">
		{#each navItems as item (item.label)}
				<a
					href={item.href}
					onclick={() => (mobileMenuOpen = false)}
					class="group relative px-8 py-4 no-underline"
				>
					<span
						class="relative inline-flex items-center overflow-hidden font-c-unbounded text-4xl font-black tracking-wide text-c-neutral-0 transition-colors duration-200 group-hover:text-c-bg-0"
					>
						<span
							class="absolute inset-0 translate-y-full -skew-x-6 bg-c-accent-0 transition-transform duration-[400ms] ease-out group-hover:translate-y-0"
						></span>
						<span class="relative z-10">{item.label}</span>
					</span>
				</a>
			{/each}
			</div>
		</div>
	</div>
{/if}
