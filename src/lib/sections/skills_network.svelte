<script>
	import { onMount, tick } from "svelte";
	import { fade, scale } from "svelte/transition";
	import { gsap } from "gsap";
	import { resolve } from "$app/paths";
	import {
		skills,
		skillConnections,
		AnimatedHeading,
		AccentLink,
		LG_BREAKPOINT
	} from "$lib";
	import { inertOffscreen } from "$lib/actions/inert_offscreen.js";

	let sectionEl = $state();
	let svgEl = $state();
	let svgContainerEl = $state();
	/** @type {HTMLParagraphElement | undefined} */
	let paraEl = $state();
	/** @type {HTMLAnchorElement | undefined} */
	let buttonEl = $state();
	let isMobile = $state(false);
	let reducedMotion = $state(false);
	let selectedId = $state(/** @type {string | null} */ (null));
	let hoveredId = $state(/** @type {string | null} */ (null));
	let tooltipX = $state(0);
	let tooltipY = $state(0);
	let mobileDetailSkill = $state(
		/** @type {import("$lib/utils/skills_data.svelte.js").Skill | null} */ (
			null
		)
	);

	let floatTweens = /** @type {gsap.core.Tween[]} */ ([]);
	let packetTweens = /** @type {gsap.core.Tween[]} */ ([]);
	let pulseTween = /** @type {gsap.core.Tween | null} */ (null);
	let scrollTrigger =
		/** @type {import("gsap/ScrollTrigger").ScrollTrigger | null} */ (null);
	let packetEls = /** @type {SVGCircleElement[]} */ ([]);

	let edgePathLengths = /** @type {number[]} */ ([]);
	let edgeTweens = /** @type {gsap.core.Tween[]} */ ([]);
	let nodeTweens = /** @type {gsap.core.Tween[]} */ ([]);
	let edgePositions =
		/** @type {{ from: { x: number, y: number }, to: { x: number, y: number }, cx: number, cy: number }[]} */ ([]);

	let displaySkills = $derived(skills);
	let displayEdges = $derived(skillConnections);

	let activeSkill = $derived(
		displaySkills.find((s) => s.id === (selectedId ?? hoveredId)) ?? null
	);

	let nodePositions = $derived(
		displaySkills.map(
			(/** @type {import("$lib/utils/skills_data.svelte.js").Skill} */ s) => ({
				x: s.position.x * 1000,
				y: s.position.y * 700
			})
		)
	);

	let floatOffsets = $state(skills.map(() => ({ x: 0, y: 0 })));

	let effectivePositions = $derived(
		nodePositions.map(
			(
				/** @type {{ x: number, y: number }} */ bp,
				/** @type {number} */ i
			) => ({
				x: bp.x + floatOffsets[i].x,
				y: bp.y + floatOffsets[i].y
			})
		)
	);

	let skillIndex = $derived(new Map(displaySkills.map((s, i) => [s.id, i])));

	let edgePaths = $derived(
		displayEdges.map((pair) => {
			const [from, to] = pair;
			const fi = skillIndex.get(from);
			const ti = skillIndex.get(to);
			if (fi === undefined || ti === undefined) return "";
			const a = effectivePositions[fi];
			const b = effectivePositions[ti];
			if (!a || !b) return "";
			const mx = (a.x + b.x) / 2;
			const my = (a.y + b.y) / 2;
			const cx = mx;
			const cy = my + 20;
			return `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`;
		})
	);

	let edgePosDat = $derived(
		displayEdges.map((pair) => {
			const [from, to] = pair;
			const fi = skillIndex.get(from);
			const ti = skillIndex.get(to);
			if (fi === undefined || ti === undefined) return null;
			const a = effectivePositions[fi];
			const b = effectivePositions[ti];
			if (!a || !b) return null;
			const mx = (a.x + b.x) / 2;
			const my = (a.y + b.y) / 2;
			return { from: a, to: b, cx: mx, cy: my + 20 };
		})
	);

	/** @returns {{ x: number, y: number } | null} */
	function getTooltipPos() {
		if (!activeSkill || !svgEl || !svgContainerEl) return null;
		const idx = skillIndex.get(activeSkill.id);
		if (idx === undefined) return null;

		const pos = effectivePositions[idx];
		const svgPt = svgEl.createSVGPoint();
		svgPt.x = pos.x;
		svgPt.y = pos.y;
		const ctm = svgEl.getScreenCTM();
		if (!ctm) return null;
		const screenPt = svgPt.matrixTransform(ctm);

		const containerRect = svgContainerEl.getBoundingClientRect();
		const rx = screenPt.x - containerRect.left;
		const ry = screenPt.y - containerRect.top;
		const cw = containerRect.width;

		const tooltipW = 320;
		const gap = 20;
		const flip = rx + gap + tooltipW > cw - 16;

		return {
			x: flip ? rx - gap - tooltipW : rx + gap,
			y: ry
		};
	}

	function updateTooltip() {
		const p = getTooltipPos();
		if (p) {
			tooltipX = p.x;
			tooltipY = p.y;
		}
	}

	/**
	 * @param {string} id
	 */
	function onNodeEnter(id) {
		if (isMobile || selectedId) return;
		hoveredId = id;
		if (!reducedMotion) animateToActive(id);
	}

	function onNodeLeave() {
		if (isMobile || selectedId) return;
		hoveredId = null;
		if (!reducedMotion) animateToRest();
	}

	/**
	 * @param {string} id
	 */
	function onNodeClick(id) {
		if (isMobile) {
			const skill = displaySkills.find((s) => s.id === id);
			if (skill) mobileDetailSkill = skill;
			return;
		}
		if (selectedId === id) {
			selectedId = null;
			if (!reducedMotion) animateToRest();
		} else {
			selectedId = id;
			if (!reducedMotion) animateToActive(id);
		}
		if (selectedId !== id) return;
		updateTooltip();
	}

	function onSvgBgClick() {
		if (isMobile) return;
		selectedId = null;
		hoveredId = null;
		if (!reducedMotion) animateToRest();
	}

	function closeMobileDetail() {
		mobileDetailSkill = null;
	}

	function startFloats() {
		floatTweens = skills.map((_, i) =>
			gsap.to(floatOffsets[i], {
				y: 8 + Math.random() * 4,
				duration: 3.5 + Math.random() * 2,
				repeat: -1,
				yoyo: true,
				ease: "sine.inOut",
				delay: Math.random() * 3
			})
		);
		skills.forEach((_, i) => {
			floatTweens.push(
				gsap.to(floatOffsets[i], {
					x: (Math.random() - 0.5) * 6,
					duration: 4 + Math.random() * 2,
					repeat: -1,
					yoyo: true,
					ease: "sine.inOut",
					delay: Math.random() * 3
				})
			);
		});
	}

	function startPackets() {
		if (!svgEl) return;

		const pathEls = svgEl.querySelectorAll("[data-edge]");

		skillConnections.forEach((_e, i) => {
			const path = /** @type {SVGPathElement | undefined} */ (pathEls[i]);
			if (!path) return;

			const len = path.getTotalLength();
			const count = 1 + Math.floor(Math.random() * 1);

			for (let j = 0; j < count; j++) {
				const initialT = Math.random();
				const initPt = path.getPointAtLength(initialT * len);

				/* eslint-disable svelte/no-dom-manipulating */
				const circle = document.createElementNS(
					"http://www.w3.org/2000/svg",
					"circle"
				);
				circle.setAttribute("cx", String(initPt.x));
				circle.setAttribute("cy", String(initPt.y));
				circle.setAttribute("r", "2.5");
				circle.classList.add("fill-c-accent-0");
				circle.style.opacity = "0";
				circle.style.pointerEvents = "none";
				circle.dataset.packetEdge = String(i);
				svgEl.appendChild(circle);
				/* eslint-enable svelte/no-dom-manipulating */
				packetEls.push(circle);

				const packetDelay = Math.random() * 10;

				/** @type {{ t: number, path: SVGPathElement, len: number, el: SVGCircleElement }} */
				const data = {
					t: initialT,
					path,
					len,
					el: circle
				};

				const tween = gsap.to(data, {
					t: 1,
					duration: 4 + Math.random() * 4,
					repeat: -1,
					ease: "none",
					delay: packetDelay,
					onUpdate: function () {
						const pt = data.path.getPointAtLength(data.t * data.len);
						data.el.setAttribute("cx", String(pt.x));
						data.el.setAttribute("cy", String(pt.y));
					},
					onRepeat: function () {
						gsap.fromTo(
							circle,
							{ opacity: 0 },
							{ opacity: 0.7, duration: 1, ease: "power2.out", overwrite: true }
						);
					}
				});
				packetTweens.push(tween);

				gsap.to(circle, {
					opacity: 0.7,
					duration: 1,
					delay: packetDelay,
					ease: "power2.out",
					overwrite: true
				});
			}
		});
	}

	/**
	 * @param {string} id
	 */
	function animateToActive(id) {
		if (!svgEl) return;
		edgeTweens.forEach((t) => t.kill());
		edgeTweens = [];
		nodeTweens.forEach((t) => t.kill());
		nodeTweens = [];

		const set = reducedMotion ? gsap.set : gsap.to;
		const dur = reducedMotion ? 0 : 0.45;

		displayEdges.forEach((edge, i) => {
			const pathEl = svgEl.querySelector(`[data-edge="${i}"]`);
			if (!pathEl) return;

			const connected = edge[0] === id || edge[1] === id;
			const len = edgePathLengths[i] || 1;

			if (connected) {
				const sourceFirst = edge[0] === id;
				const rev = edgePosDat[i];
				const d = rev
					? sourceFirst
						? `M ${rev.from.x} ${rev.from.y} Q ${rev.cx} ${rev.cy} ${rev.to.x} ${rev.to.y}`
						: `M ${rev.to.x} ${rev.to.y} Q ${rev.cx} ${rev.cy} ${rev.from.x} ${rev.from.y}`
					: "";

				const tween = gsap.fromTo(
					pathEl,
					{
						strokeDasharray: len + 2,
						strokeDashoffset: len,
						stroke: "var(--color-c-border)",
						opacity: 0.3,
						attr: { d: pathEl.getAttribute("d") }
					},
					{
						strokeDashoffset: 0,
						stroke: "var(--color-c-accent-0)",
						opacity: 0.7,
						duration: dur,
						ease: "power2.out",
						attr: { d }
					}
				);
				edgeTweens.push(tween);
			} else {
				const tween = set(pathEl, {
					opacity: 0.1,
					stroke: "var(--color-c-border)",
					duration: dur,
					ease: "power2.out"
				});
				edgeTweens.push(tween);
			}
		});

		displaySkills.forEach((skill) => {
			const circle = svgEl.querySelector(
				`[data-node-id="${skill.id}"] circle:first-child`
			);
			if (!circle) return;

			if (skill.id === id) {
				const tween = set(circle, {
					stroke: "var(--color-c-accent-0)",
					duration: dur,
					ease: "power2.out"
				});
				nodeTweens.push(tween);
			} else {
				const connected = displayEdges.some(
					(e) =>
						(e[0] === id && e[1] === skill.id) ||
						(e[0] === skill.id && e[1] === id)
				);
				const tween = set(circle, {
					opacity: connected ? 1 : 0.35,
					stroke: "var(--color-c-border)",
					duration: dur,
					ease: "power2.out"
				});
				nodeTweens.push(tween);
			}
		});
	}

	function animateToRest() {
		if (!svgEl) return;
		edgeTweens.forEach((t) => t.kill());
		edgeTweens = [];
		nodeTweens.forEach((t) => t.kill());
		nodeTweens = [];

		const set = reducedMotion ? gsap.set : gsap.to;
		const dur = reducedMotion ? 0 : 0.35;

		displayEdges.forEach((_edge, i) => {
			const pathEl = svgEl.querySelector(`[data-edge="${i}"]`);
			if (!pathEl) return;
			const tween = set(pathEl, {
				strokeDasharray: "none",
				stroke: "var(--color-c-border)",
				opacity: 0.3,
				duration: dur,
				ease: "power2.out"
			});
			edgeTweens.push(tween);
		});

		displaySkills.forEach((skill) => {
			const circle = svgEl.querySelector(
				`[data-node-id="${skill.id}"] circle:first-child`
			);
			if (!circle) return;
			const tween = set(circle, {
				opacity: 1,
				stroke: "var(--color-c-border)",
				duration: dur,
				ease: "power2.out"
			});
			nodeTweens.push(tween);
		});
	}

	function updatePackets() {
		const active = hoveredId ?? selectedId;
		packetEls.forEach((el) => {
			const edgeIdx = parseInt(el.dataset.packetEdge ?? "", 10);
			if (isNaN(edgeIdx)) return;
			const edge = displayEdges[edgeIdx];
			if (!edge) return;
			const isConnected = active
				? edge[0] === active || edge[1] === active
				: true;
			el.setAttribute("r", isConnected ? "3" : "2");
		});
	}

	function killAll() {
		pulseTween?.kill();
		floatTweens.forEach((t) => t.kill());
		packetTweens.forEach((t) => t.kill());
		scrollTrigger?.kill();
		packetEls.forEach((el) => el.remove());
		packetEls = [];
	}

	async function initAnimations() {
		await tick();

		if (!sectionEl || !svgEl) return;

		const { ScrollTrigger } = await import("gsap/ScrollTrigger");
		gsap.registerPlugin(ScrollTrigger);

		const nodeEls = sectionEl.querySelectorAll("[data-node-id]");
		const pathEls = svgEl.querySelectorAll("[data-edge]");

		edgePathLengths = displayEdges.map((_, i) => {
			const p = pathEls[i];
			return p ? p.getTotalLength() : 1;
		});

		gsap.set(nodeEls, { scale: 0, opacity: 0 });
		pathEls.forEach(
			/** @param {SVGPathElement} p */ (p) => {
				const len = p.getTotalLength();
				p.style.strokeDasharray = String(len);
				p.style.strokeDashoffset = String(len);
			}
		);

		const dur = reducedMotion ? 0 : undefined;

		if (paraEl) gsap.set(paraEl, { y: 40, opacity: 0, scale: 0.97 });
		if (buttonEl) gsap.set(buttonEl, { y: 20, opacity: 0 });

		const tl = gsap.timeline();

		if (paraEl) {
			tl.to(paraEl, {
				y: 0,
				opacity: 1,
				scale: 1,
				duration: dur ?? 0.8,
				ease: "power3.out"
			});
		}

		if (buttonEl) {
			tl.to(
				buttonEl,
				{
					y: 0,
					opacity: 1,
					duration: dur ?? 0.5,
					ease: "power3.out"
				},
				"-=0.1"
			);
		}

		tl.to(
			pathEls,
			{
				strokeDashoffset: 0,
				duration: 1.2,
				stagger: 0.02,
				ease: "power3.inOut"
			},
			"-=0.6"
		);

		tl.to(
			nodeEls,
			{
				scale: 1,
				opacity: 1,
				duration: 0.6,
				stagger: 0.05,
				ease: "back.out(1.7)",
				onComplete: () => {
					nodeEls.forEach(
						/** @param {Element} el */ (el) => {
							if (el instanceof HTMLElement || el instanceof SVGElement) {
								el.style.removeProperty("opacity");
								el.style.removeProperty("scale");
								el.style.removeProperty("transform");
							}
						}
					);
					pathEls.forEach(
						/** @param {Element} p */ (p) => {
							if (p instanceof SVGPathElement) {
								p.style.removeProperty("strokeDasharray");
								p.style.removeProperty("strokeDashoffset");
							}
						}
					);
				}
			},
			"-=0.3"
		);

		tl.call(() => {
			if (!reducedMotion) {
				startFloats();
				startPackets();
			}
		});

		scrollTrigger = ScrollTrigger.create({
			trigger: sectionEl,
			start: "top 20%",
			once: true,
			animation: tl
		});
	}

	$effect(() => {
		if (isMobile) return;
		const active = selectedId;
		updatePackets();

		if (!active) {
			pulseTween?.kill();
			pulseTween = null;
			svgEl
				?.querySelectorAll(`[data-pulse]`)
				.forEach(
					/** @param {Element} el */ (el) =>
						gsap.set(el, { scale: 1, opacity: 0 })
				);
			return;
		}

		pulseTween?.kill();
		svgEl
			?.querySelectorAll(`[data-pulse]`)
			.forEach(
				/** @param {Element} el */ (el) =>
					gsap.set(el, { scale: 1, opacity: 0 })
			);

		tick().then(() => {
			const ring = svgEl?.querySelector(`[data-pulse="${active}"]`);
			if (!ring) return;

			gsap.set(ring, { scale: 1, opacity: 0.5 });
			pulseTween = gsap.to(ring, {
				scale: 1.3,
				opacity: 0,
				duration: 2,
				repeat: -1,
				yoyo: true,
				ease: "sine.inOut"
			});
		});
	});

	$effect(() => {
		if (!isMobile && activeSkill) {
			updateTooltip();
		}
	});

	onMount(() => {
		isMobile = window.innerWidth < LG_BREAKPOINT;
		reducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)"
		).matches;

		if (reducedMotion) {
			return;
		}

		requestAnimationFrame(() => initAnimations());

		return killAll;
	});
</script>

<section
	bind:this={sectionEl}
	use:inertOffscreen
	id="skills"
	class="relative flex min-h-screen w-full flex-col lg:flex-row"
>
	<!-- SVG graph panel (left on desktop, top on mobile) -->
	<div
		class="flex w-full items-center justify-center px-4 max-lg:max-h-[75vh] max-lg:min-h-[45vh] max-lg:flex-1 max-lg:pt-44 lg:sticky lg:top-0 lg:h-screen lg:w-3/5 lg:px-8"
	>
		<!-- mobile heading above graph -->
		<div
			class="absolute top-0 left-0 z-10 w-full bg-gradient-to-b from-c-bg-0/90 via-c-bg-0/60 to-transparent px-6 pt-24 pb-12 lg:hidden"
		>
			<AnimatedHeading
				tag="h2"
				class="font-c-unbounded text-4xl font-black text-c-neutral-0"
			>
				Some <span class="text-c-accent-0">skills</span> I have honed.
			</AnimatedHeading>
		</div>
		<div bind:this={svgContainerEl} class="relative h-full w-full">
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<svg
				bind:this={svgEl}
				viewBox="0 0 1000 700"
				class="h-full w-full"
				preserveAspectRatio="xMidYMid meet"
				role="img"
				aria-label="Skills network graph"
				onclick={onSvgBgClick}
				onkeydown={(e) => {
					if (e.key === "Escape") onSvgBgClick();
				}}
			>
				{#each edgePaths as d, i (i)}
					<path
						{d}
						data-edge={i}
						fill="none"
						stroke-linecap="round"
						stroke="var(--color-c-border)"
						stroke-width="1.5"
						opacity="0.3"
					/>
				{/each}

				{#each displaySkills as skill, i (skill.id)}
					<g
						transform="translate({effectivePositions[i].x}, {effectivePositions[
							i
						].y})"
						data-node-id={skill.id}
						class="cursor-pointer"
						role="button"
						tabindex="0"
						onclick={(e) => {
							e.stopPropagation();
							onNodeClick(skill.id);
						}}
						onkeydown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								e.stopPropagation();
								onNodeClick(skill.id);
							}
							if (e.key === "Escape") {
								onSvgBgClick();
							}
						}}
						onmouseenter={() => onNodeEnter(skill.id)}
						onmouseleave={onNodeLeave}
					>
						<circle
							r={isMobile ? 46 : 26}
							class="fill-c-bg-2/50"
							stroke-width="1.5"
							stroke="var(--color-c-border)"
						/>
						{#if !isMobile}
							<circle
								r="30"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								class="pointer-events-none text-c-accent-0"
								data-pulse={skill.id}
								opacity="0"
							/>
						{/if}
						<text
							text-anchor="middle"
							dominant-baseline="central"
							class="pointer-events-none fill-c-neutral-0 text-base select-none max-lg:text-3xl"
						>
							{skill.icon}
						</text>
					</g>
				{/each}
			</svg>

			<!-- desktop tooltip overlay -->
			{#if !isMobile && activeSkill && (hoveredId || selectedId)}
				<div
					class="pointer-events-none absolute z-10"
					style="left: {tooltipX}px; top: {tooltipY}px; transform: translateY(-50%);"
					transition:fade={{ duration: 120 }}
				>
					<div
						class="w-80 rounded-2xl border border-c-border/40 bg-c-bg-2/90 px-6 py-5 shadow-lg backdrop-blur-xl"
					>
						<div class="flex items-center gap-3">
							<span class="text-4xl">{activeSkill.icon}</span>
							<div>
								<p class="font-c-unbounded text-lg font-bold text-c-neutral-0">
									{activeSkill.name}
								</p>
								<span
									class="font-c-bebas text-sm tracking-widest text-c-neutral-1 uppercase"
								>
									{activeSkill.category}
								</span>
							</div>
						</div>
						<p
							class="mt-3 font-c-ubuntu text-base leading-relaxed text-c-neutral-1"
						>
							{activeSkill.description}
						</p>
						<div class="mt-3">
							<span
								class="font-c-bebas text-sm tracking-widest text-c-neutral-1 uppercase"
							>
								{activeSkill.experience}
							</span>
						</div>
						{#if activeSkill.relatedTechnologies.length > 0}
							<div class="mt-3 flex flex-wrap gap-1.5">
								{#each activeSkill.relatedTechnologies as tech (tech)}
									<span
										class="rounded-full border border-c-border/30 px-2.5 py-0.5 font-c-ubuntu text-sm text-c-neutral-0"
									>
										{tech}
									</span>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- content panel (right on desktop, bottom on mobile) -->
	<div
		class="flex w-full flex-col justify-center gap-6 px-6 pb-12 max-lg:pointer-events-none max-lg:absolute max-lg:bottom-0 max-lg:left-0 max-lg:z-10 max-lg:w-full max-lg:justify-end max-lg:bg-gradient-to-tr max-lg:from-c-bg-0/95 max-lg:via-c-bg-0/75 max-lg:to-c-bg-0/0 max-lg:px-6 max-lg:pt-20 max-lg:pb-8 lg:w-2/5 lg:gap-10 lg:px-12 lg:pb-24 lg:pl-16"
	>
		<AnimatedHeading
			tag="h2"
			start={!isMobile}
			class="font-c-unbounded text-3xl font-black text-c-neutral-0 max-lg:hidden lg:text-6xl"
		>
			Some <span class="text-c-accent-0">skills</span> I have honed.
		</AnimatedHeading>

		<p
			bind:this={paraEl}
			class="font-c-ubuntu text-xl leading-relaxed text-c-neutral-1 lg:text-2xl"
		>
			A collection of technologies and tools I've worked with across frontend
			and backend development, cloud infrastructure, and design. Each node
			represents a skill — hover to see details, or click to pin the info open.
		</p>

		<AccentLink
			href={resolve("/experiences")}
			class="-translate-x-3 px-4 py-1.5 font-c-unbounded text-base font-bold max-lg:pointer-events-auto lg:text-lg"
			bind:el={buttonEl}
		>
			Experiences
		</AccentLink>
	</div>
</section>

<!-- mobile detail popover -->
{#if mobileDetailSkill}
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
		onclick={closeMobileDetail}
		onkeydown={(e) => e.key === "Escape" && closeMobileDetail()}
		role="dialog"
		tabindex="0"
		transition:fade={{ duration: 150 }}
	>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			class="w-full max-w-lg rounded-2xl border border-c-border/40 bg-c-bg-0 p-10 shadow-xl backdrop-blur-xl"
			role="document"
			onclick={(e) => e.stopPropagation()}
			onkeydown={() => {}}
			transition:scale={{ start: 0.92, duration: 150 }}
		>
			<div class="flex items-center gap-4">
				<span class="text-5xl">{mobileDetailSkill.icon}</span>
				<div>
					<h3 class="font-c-unbounded text-2xl text-c-neutral-0">
						{mobileDetailSkill.name}
					</h3>
					<span
						class="font-c-bebas text-base tracking-widest text-c-neutral-1 uppercase"
					>
						{mobileDetailSkill.category}
					</span>
				</div>
			</div>
			<p class="mt-4 font-c-ubuntu text-lg leading-relaxed text-c-neutral-1">
				{mobileDetailSkill.description}
			</p>
			<div class="mt-4">
				<span
					class="font-c-bebas text-base tracking-widest text-c-neutral-1 uppercase"
				>
					Experience
				</span>
				<p class="font-c-ubuntu text-lg text-c-neutral-0">
					{mobileDetailSkill.experience}
				</p>
			</div>
			{#if mobileDetailSkill.relatedTechnologies.length > 0}
				<div class="mt-4">
					<span
						class="font-c-bebas text-base tracking-widest text-c-neutral-1 uppercase"
					>
						Related
					</span>
					<div class="mt-2 flex flex-wrap gap-2">
						{#each mobileDetailSkill.relatedTechnologies as tech (tech)}
							<span
								class="rounded-full border border-c-border/30 px-3 py-1 font-c-ubuntu text-base text-c-neutral-0"
							>
								{tech}
							</span>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}
