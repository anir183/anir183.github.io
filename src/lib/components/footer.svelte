<script>
	import { onMount } from "svelte";
	import { gsap } from "gsap";

	let {
		pageLinks = [
			{ label: "Home", href: "/" },
			{ label: "Projects", href: "/projects" },
			{ label: "Experiences", href: "/experiences" },
			{ label: "Blog", href: "https://anir183.is-a.dev/blog" }
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
			gsap.set(el, { opacity: 0, y: 13 });
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					observer.disconnect();
					if (reducedMotion || canceled) return;

					const textElements = el.querySelectorAll("h3, p, a[href]");
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
						gsap.set(allLines, { y: "125%" });

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
						}, "-=0.4");
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
	class="border-t border-c-border/10 bg-c-bg-0 px-5 py-6 text-xs text-c-neutral-1/60 min-[1100px]:px-12 min-[1100px]:py-8 min-[1100px]:text-xs"
>
	<div class="grid grid-cols-1 gap-8 min-[1100px]:grid-cols-3 min-[1100px]:gap-5">
		<!-- left: image licensing -->
		<div class="flex flex-col gap-2.5 min-[1100px]:text-left">
			<h3 class="font-c-bebas text-xs tracking-widest text-c-neutral-0/40 min-[1100px]:text-xs">
				Image Credits
			</h3>
			<p>
				Images used on this site fall under the
				<a
					href="https://pixabay.com"
					target="_blank"
					rel="noopener noreferrer"
					class="transition-colors hover:text-c-accent-0/75"
				>Pixabay</a>
				<a
					href="https://pixabay.com/service/license-summary"
					target="_blank"
					rel="noopener noreferrer"
					class="text-c-accent-0/55 transition-colors hover:text-c-accent-0/75"
				>Content License</a>.
			</p>
			<div class="space-y-1 leading-relaxed">
				<p>
					<a
						href="https://pixabay.com/photos/sunset-skyscrapers-buildings-city-8214498"
						target="_blank"
						rel="noopener noreferrer"
						class="transition-colors hover:text-c-accent-0/75"
					>"Sunset Skyscrapers Buildings City"</a> by <a
						href="https://pixabay.com/users/soultrain-7283580"
						target="_blank"
						rel="noopener noreferrer"
						class="text-c-accent-0/55 transition-colors hover:text-c-accent-0/75"
					>Denis Fedotov</a>
				</p>
				<p>
					<a
						href="https://pixabay.com/photos/laptop-coffee-notebook-pen-glasses-1478822"
						target="_blank"
						rel="noopener noreferrer"
						class="transition-colors hover:text-c-accent-0/75"
					>"Laptop Coffee Notebook Pen Glasses"</a> by <a
						href="https://pixabay.com/users/freephotocc-2275370"
						target="_blank"
						rel="noopener noreferrer"
						class="text-c-accent-0/55 transition-colors hover:text-c-accent-0/75"
					>Free Photos</a>
				</p>
				<p>
					<a
						href="https://pixabay.com/photos/austria-fog-nature-landscape-4936672"
						target="_blank"
						rel="noopener noreferrer"
						class="transition-colors hover:text-c-accent-0/75"
					>"Austria Fog Nature"</a> by <a
						href="https://pixabay.com/users/julius_silver-4371822"
						target="_blank"
						rel="noopener noreferrer"
						class="text-c-accent-0/55 transition-colors hover:text-c-accent-0/75"
					>Julius Silver</a>
				</p>
				<p>
					<a
						href="https://pixabay.com/photos/austria-gazebo-pavilion-landscape-6934162"
						target="_blank"
						rel="noopener noreferrer"
						class="transition-colors hover:text-c-accent-0/75"
					>"Austria Gazebo Pavilion"</a> by <a
						href="https://pixabay.com/users/chriszwettler-23331959"
						target="_blank"
						rel="noopener noreferrer"
						class="text-c-accent-0/55 transition-colors hover:text-c-accent-0/75"
					>chriszwettler</a>
				</p>
			</div>
		</div>

		<!-- middle: license + joke -->
		<div class="flex flex-col gap-2.5 min-[1100px]:text-center">
			<h3 class="font-c-bebas text-xs tracking-widest text-c-neutral-0/40 min-[1100px]:text-xs">
				License
			</h3>
			<div class="flex flex-col gap-0.5 min-[1100px]:flex-1 min-[1100px]:justify-between">
				<p class="leading-relaxed">
					This site is
					<a
						href="https://opensource.org/licenses/MIT"
						target="_blank"
						rel="noopener noreferrer"
						class="text-c-accent-0/55 transition-colors hover:text-c-accent-0/75"
					>MIT licensed</a>.
				</p>
				<div>
					<p class="leading-relaxed">
					Made with 🧡 Pain and Suffering
					</p>
					<p class="leading-relaxed">
					Developed by Anirban "anir183" RoyChowdhury
					</p>
				</div>
			</div>
		</div>

		<!-- right: nav links -->
		<div class="flex flex-col gap-2.5 min-[1100px]:text-right">
			<h3 class="font-c-bebas text-xs tracking-widest text-c-neutral-0/40 min-[1100px]:text-xs">
				Navigate
			</h3>
			<div class="flex flex-col gap-1 min-[1100px]:items-end">
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
