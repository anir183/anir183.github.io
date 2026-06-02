<script>
	import { onMount, tick } from "svelte";
	import { fade, scale } from "svelte/transition";
	import { gsap } from "gsap";
	import { resolve } from "$app/paths";
	import {
		skills,
		featuredSkills,
		skillConnections,
		featuredConnections,
		AnimatedHeading,
		LG_BREAKPOINT
	} from "$lib";

	let sectionEl = $state();
	let svgEl = $state();
	let svgContainerEl = $state();
	let isMobile = $state(false);
	let reducedMotion = $state(false);
	let selectedId = $state(/** @type {string | null} */ (null));
	let hoveredId = $state(/** @type {string | null} */ (null));
	let tooltipX = $state(0);
	let tooltipY = $state(0);
	let mobileDetailSkill =
		$state(/** @type {import("$lib/utils/skills_data.svelte.js").Skill | null} */ (null));

	let floatTweens = /** @type {gsap.core.Tween[]} */ ([]);
	let packetTweens = /** @type {gsap.core.Tween[]} */ ([]);
	let pulseTween = /** @type {gsap.core.Tween | null} */ (null);
	let scrollTrigger =
		/** @type {import("gsap/ScrollTrigger").ScrollTrigger | null} */ (null);
	let packetEls = /** @type {SVGCircleElement[]} */ ([]);

	let displaySkills = $derived(isMobile ? featuredSkills : skills);
	let displayEdges = $derived(isMobile ? featuredConnections : skillConnections);

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
			(/** @type {{ x: number, y: number }} */ bp, /** @type {number} */ i) => ({
				x: bp.x + floatOffsets[i].x,
				y: bp.y + floatOffsets[i].y
			})
		)
	);

	let skillIndex = $derived(
		new Map(displaySkills.map((s, i) => [s.id, i]))
	);

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
			return `M ${a.x} ${a.y} Q ${mx} ${my + 20} ${b.x} ${b.y}`;
		})
	);

	/**
	 * @param {string} id
	 * @returns {number}
	 */
	function getNodeOpacity(id) {
		const active = hoveredId ?? selectedId;
		if (!active) return 1;
		if (id === active) return 1;
		const connected = displayEdges.some(
			(e) =>
				(e[0] === active && e[1] === id) || (e[0] === id && e[1] === active)
		);
		return connected ? 1 : 0.35;
	}

	/**
	 * @param {number} i
	 * @returns {number}
	 */
	function getEdgeOpacity(i) {
		const active = hoveredId ?? selectedId;
		if (!active) return 0.3;
		return displayEdges[i][0] === active || displayEdges[i][1] === active
			? 0.7
			: 0.1;
	}

	/**
	 * @param {number} i
	 * @returns {string}
	 */
	function getEdgeColor(i) {
		const active = hoveredId ?? selectedId;
		if (!active) return "var(--color-c-border)";
		return displayEdges[i][0] === active || displayEdges[i][1] === active
			? "var(--color-c-accent-0)"
			: "var(--color-c-border)";
	}

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

		const tooltipW = 256;
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
	}

	function onNodeLeave() {
		if (isMobile || selectedId) return;
		hoveredId = null;
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
		if (selectedId === id) selectedId = null;
		else selectedId = id;
		if (selectedId !== id) return;
		updateTooltip();
	}

	function onSvgBgClick() {
		if (isMobile) return;
		selectedId = null;
		hoveredId = null;
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
			const count = 1 + Math.floor(Math.random() * 2);

			for (let j = 0; j < count; j++) {
				/* eslint-disable svelte/no-dom-manipulating */
				const circle = document.createElementNS(
					"http://www.w3.org/2000/svg",
					"circle"
				);
				circle.setAttribute("r", "2.5");
				circle.classList.add("fill-c-accent-0");
				circle.style.opacity = "0.5";
				circle.style.pointerEvents = "none";
				circle.dataset.packetEdge = String(i);
				svgEl.appendChild(circle);
				/* eslint-enable svelte/no-dom-manipulating */
				packetEls.push(circle);

				/** @type {{ t: number, path: SVGPathElement, len: number, el: SVGCircleElement }} */
				const data = {
					t: Math.random(),
					path,
					len,
					el: circle
				};

				const tween = gsap.to(data, {
					t: 1,
					duration: 4 + Math.random() * 4,
					repeat: -1,
					ease: "none",
					delay: Math.random() * 5,
					onUpdate: function () {
						const pt = data.path.getPointAtLength(data.t * data.len);
						data.el.setAttribute("cx", String(pt.x));
						data.el.setAttribute("cy", String(pt.y));
					}
				});
				packetTweens.push(tween);
			}
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
			el.style.opacity = isConnected ? "0.7" : "0.12";
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

		gsap.set(nodeEls, { scale: 0, opacity: 0 });
		pathEls.forEach(
			/** @param {SVGPathElement} p */ (p) => {
				const len = p.getTotalLength();
				p.style.strokeDasharray = String(len);
				p.style.strokeDashoffset = String(len);
			}
		);

		const tl = gsap.timeline();

		tl.to(pathEls, {
			strokeDashoffset: 0,
			duration: 1.2,
			stagger: 0.02,
			ease: "power3.inOut"
		});

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
			start: "top 85%",
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
			return;
		}

		tick().then(() => {
			const ring = svgEl?.querySelector(`[data-pulse="${active}"]`);
			if (!ring) return;

			pulseTween?.kill();
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

		if (isMobile || reducedMotion) {
			if (!reducedMotion) {
				import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
					gsap.registerPlugin(ScrollTrigger);
				});
			}
			return;
		}

		requestAnimationFrame(() => initAnimations());

		return killAll;
	});
</script>

<section
	bind:this={sectionEl}
	id="skills"
	class="relative flex min-h-screen w-full flex-col lg:flex-row"
>
	<!-- SVG graph panel (left on desktop, top on mobile) -->
	<div
		class="flex w-full items-center justify-center px-4 max-lg:h-[55vh] lg:sticky lg:top-0 lg:h-screen lg:w-3/5 lg:px-8"
	>
		<div
			bind:this={svgContainerEl}
			class="relative h-full w-full"
		>
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
						stroke="currentColor"
						stroke-width="1.5"
						style="color: {getEdgeColor(i)}; opacity: {getEdgeOpacity(i)}"
					/>
				{/each}

				{#each displaySkills as skill, i (skill.id)}
					<g
						transform="translate({effectivePositions[i]
							.x}, {effectivePositions[i].y})"
						data-node-id={skill.id}
						style:opacity={getNodeOpacity(skill.id)}
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
							r={isMobile ? 36 : 30}
							class="fill-c-bg-2/50"
							stroke-width="1.5"
							stroke="currentColor"
							style="transition: color 0.3s; color: {selectedId ===
								skill.id || hoveredId === skill.id
								? 'var(--color-c-accent-0)'
								: 'var(--color-c-border)'}"
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
							class="pointer-events-none fill-c-neutral-0 text-xl select-none"
						>
							{skill.icon}
						</text>
					</g>
				{/each}
			</svg>

			<!-- desktop tooltip overlay -->
			{#if !isMobile && activeSkill && (hoveredId || selectedId)}
				<div
					class="absolute pointer-events-none z-10"
					style="left: {tooltipX}px; top: {tooltipY}px; transform: translateY(-50%);"
					transition:fade={{ duration: 120 }}
				>
					<div
						class="w-64 rounded-2xl border border-c-border/40 bg-c-bg-2/90 px-5 py-4 backdrop-blur-xl shadow-lg"
					>
						<div class="flex items-center gap-3">
							<span class="text-2xl">{activeSkill.icon}</span>
							<div>
								<p class="font-c-unbounded text-sm font-bold text-c-neutral-0">
									{activeSkill.name}
								</p>
								<span
									class="font-c-bebas text-xs tracking-widest text-c-neutral-1 uppercase"
								>
									{activeSkill.category}
								</span>
							</div>
						</div>
						<p class="mt-3 font-c-ubuntu text-xs leading-relaxed text-c-neutral-1">
							{activeSkill.description}
						</p>
						<div class="mt-3">
							<span class="font-c-bebas text-xs tracking-widest text-c-neutral-1 uppercase">
								{activeSkill.experience}
							</span>
						</div>
						{#if activeSkill.relatedTechnologies.length > 0}
							<div class="mt-3 flex flex-wrap gap-1.5">
								{#each activeSkill.relatedTechnologies as tech (tech)}
									<span
										class="rounded-full border border-c-border/30 px-2.5 py-0.5 font-c-ubuntu text-[11px] text-c-neutral-0"
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
		class="flex w-full flex-col justify-center gap-6 px-6 pb-12 lg:w-2/5 lg:px-12 lg:pb-24 lg:pl-16"
	>
		<AnimatedHeading
			tag="h2"
			start={!isMobile}
			class="font-c-unbounded text-4xl font-black text-c-neutral-0 lg:text-6xl"
		>
			Skills
		</AnimatedHeading>

		<p class="font-c-ubuntu text-base leading-relaxed text-c-neutral-1">
			A collection of technologies and tools I've worked with across frontend
			and backend development, cloud infrastructure, and design. Each node
			represents a skill — hover to see details, or click to pin the info open.
		</p>

		<a
			href={resolve("/experiences")}
			class="group inline-flex w-fit items-center gap-3 rounded-full border border-c-border/40 bg-c-bg-2/30 px-8 py-3 font-c-ubuntu text-sm text-c-neutral-0 backdrop-blur-xl transition-all duration-300 hover:border-c-border hover:bg-c-bg-2/50 lg:px-8 lg:py-4 lg:text-base"
		>
			<span>Experiences</span>
			<span
				class="text-lg transition-transform duration-300 group-hover:translate-x-1"
				>→</span
			>
		</a>
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
			class="w-full max-w-sm rounded-2xl border border-c-border/40 bg-c-bg-0 p-6 backdrop-blur-xl shadow-xl"
			role="document"
			onclick={(e) => e.stopPropagation()}
			onkeydown={() => {}}
			transition:scale={{ start: 0.92, duration: 150 }}
		>
			<div class="flex items-center gap-3">
				<span class="text-3xl">{mobileDetailSkill.icon}</span>
				<div>
					<h3 class="font-c-unbounded text-lg text-c-neutral-0">
						{mobileDetailSkill.name}
					</h3>
					<span
						class="font-c-bebas text-xs tracking-widest text-c-neutral-1 uppercase"
					>
						{mobileDetailSkill.category}
					</span>
				</div>
			</div>
			<p class="mt-4 font-c-ubuntu text-sm leading-relaxed text-c-neutral-1">
				{mobileDetailSkill.description}
			</p>
			<div class="mt-4">
				<span class="font-c-bebas text-xs tracking-widest text-c-neutral-1 uppercase">
					Experience
				</span>
				<p class="font-c-ubuntu text-sm text-c-neutral-0">
					{mobileDetailSkill.experience}
				</p>
			</div>
			{#if mobileDetailSkill.relatedTechnologies.length > 0}
				<div class="mt-4">
					<span class="font-c-bebas text-xs tracking-widest text-c-neutral-1 uppercase">
						Related
					</span>
					<div class="mt-2 flex flex-wrap gap-2">
						{#each mobileDetailSkill.relatedTechnologies as tech (tech)}
							<span
								class="rounded-full border border-c-border/30 px-3 py-1 font-c-ubuntu text-xs text-c-neutral-0"
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
