<script>
	import { onMount } from "svelte";
	import { gsap } from "gsap";

	let {
		pageLinks = [
			{ label: "Home", href: "/" },
			{ label: "Experiences", href: "/experiences" },
			{ label: "Projects", href: "/projects" }
		]
	} = $props();

	/** @type {HTMLElement | undefined} */
	let footerEl = $state();

	let reducedMotion = $state(false);

	/** @type {any[]} */
	let splitInstances = [];

	/** @type {gsap.core.Timeline | undefined} */
	let tl;

	onMount(() => {
		reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

		const el = footerEl;
		if (!el) return;

		let canceled = false;

		if (!reducedMotion) {
			gsap.set(el, { opacity: 0, y: 16 });
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					observer.disconnect();
					if (reducedMotion || canceled) return;

					const textElements = el.querySelectorAll("h3, p, a[href^='/']");
					if (!textElements.length) {
						gsap.to(el, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" });
						return;
					}

					import("gsap/SplitText").then(({ SplitText }) => {
						if (canceled) return;
						gsap.registerPlugin(SplitText);

						const splits = [...textElements].map(
							(el) => new SplitText(el, {
								type: "lines",
								linesClass: "line",
								mask: "lines",
								autoSplit: true
							})
						);
						splitInstances = splits;

						const allLines = [...el.querySelectorAll(".line")];
						gsap.set(allLines, { y: "125%", willChange: "transform" });

						tl = gsap.timeline();
						tl.to(el, {
							y: 0,
							opacity: 1,
							duration: 1.0,
							ease: "power3.out"
						});
						tl.to(allLines, {
							y: "0%",
							duration: 1.2,
							stagger: 0.08,
							ease: "power3.out"
						}, "+=0.05");
					});
				}
			},
			{ threshold: 0.3 }
		);

		observer.observe(el);

		return () => {
			canceled = true;
			observer.disconnect();
			tl?.kill();
			splitInstances.forEach((s) => s.revert());
		};
	});
</script>

<footer
	bind:this={footerEl}
	class="border-t border-c-border/10 bg-c-bg-0 px-6 py-8 text-xs text-c-neutral-1/60 min-[1100px]:px-16 min-[1100px]:py-10 min-[1100px]:text-base"
>
	<div class="grid grid-cols-1 gap-10 min-[1100px]:grid-cols-3 min-[1100px]:gap-6">
		<!-- left: image licensing -->
		<div class="flex flex-col gap-3 min-[1100px]:text-left">
			<h3 class="font-c-bebas text-sm tracking-widest text-c-neutral-0/40 min-[1100px]:text-base">
				Image Credits
			</h3>
			<p>
				Images used on this site fall under the
				<a
					href="https://pixabay.com/service/license-summary/"
					target="_blank"
					rel="noopener noreferrer"
					class="text-c-accent-0/55 transition-colors hover:text-c-accent-0/75"
				>Pixabay Content License</a>.
			</p>
			<div class="space-y-1 leading-relaxed">
				<p>
					Image by <a
						href="https://pixabay.com/users/soultrain-7283580/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=8214498"
						target="_blank"
						rel="noopener noreferrer"
						class="text-c-accent-0/55 transition-colors hover:text-c-accent-0/75"
					>Denis Fedotov</a> from <a
						href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=8214498"
						target="_blank"
						rel="noopener noreferrer"
						class="text-c-accent-0/55 transition-colors hover:text-c-accent-0/75"
					>Pixabay</a>
				</p>
				<p>
					Image by <a
						href="https://pixabay.com/users/freephotocc-2275370/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=1478822"
						target="_blank"
						rel="noopener noreferrer"
						class="text-c-accent-0/55 transition-colors hover:text-c-accent-0/75"
					>Free Photos</a> from <a
						href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=1478822"
						target="_blank"
						rel="noopener noreferrer"
						class="text-c-accent-0/55 transition-colors hover:text-c-accent-0/75"
					>Pixabay</a>
				</p>
				<p>
					Image by <a
						href="https://pixabay.com/users/julius_silver-4371822/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=4936672"
						target="_blank"
						rel="noopener noreferrer"
						class="text-c-accent-0/55 transition-colors hover:text-c-accent-0/75"
					>Julius Silver</a> from <a
						href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=4936672"
						target="_blank"
						rel="noopener noreferrer"
						class="text-c-accent-0/55 transition-colors hover:text-c-accent-0/75"
					>Pixabay</a>
				</p>
				<p>
					Image by <a
						href="https://pixabay.com/users/chriszwettler-23331959/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=6934162"
						target="_blank"
						rel="noopener noreferrer"
						class="text-c-accent-0/55 transition-colors hover:text-c-accent-0/75"
					>chriszwettler</a> from <a
						href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=6934162"
						target="_blank"
						rel="noopener noreferrer"
						class="text-c-accent-0/55 transition-colors hover:text-c-accent-0/75"
					>Pixabay</a>
				</p>
			</div>
		</div>

		<!-- middle: license + joke -->
		<div class="flex flex-col gap-3 min-[1100px]:text-center">
			<h3 class="font-c-bebas text-sm tracking-widest text-c-neutral-0/40 min-[1100px]:text-base">
				License
			</h3>
			<div class="flex flex-col gap-1 min-[1100px]:flex-1 min-[1100px]:justify-between">
				<p class="leading-relaxed">
					This site is
					<a
						href="https://opensource.org/licenses/MIT"
						target="_blank"
						rel="noopener noreferrer"
						class="text-c-accent-0/55 transition-colors hover:text-c-accent-0/75"
					>MIT licensed</a>.
				</p>
				<p class="leading-relaxed">
					Made with  ❤️  Pain and Suffering
				</p>
			</div>
		</div>

		<!-- right: nav links -->
		<div class="flex flex-col gap-3 min-[1100px]:text-right">
			<h3 class="font-c-bebas text-sm tracking-widest text-c-neutral-0/40 min-[1100px]:text-base">
				Navigate
			</h3>
			<div class="flex flex-col gap-1.5 min-[1100px]:items-end">
				{#each pageLinks as link (link.label)}
					<a
						href={link.href}
						class="transition-colors hover:text-c-accent-0/75"
					>{link.label}</a
					>
				{/each}
			</div>
		</div>
	</div>
</footer>
