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
	let reducedMotion = $state(typeof window !== 'undefined' && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
	let isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
	let containerWidth = $state(1000);
	let containerHeight = $state(700);
	let selectedId = $state(/** @type {string | null} */ (null));
	let hoveredId = $state(/** @type {string | null} */ (null));
	let tooltipX = $state(0);
	let tooltipY = $state(0);
	let mobileDetailSkill = $state(
		/** @type {import("$lib/utils/skills_data.svelte.js").Skill | null} */ (
			null
		)
	);

	let zoom = $state(1);
	let panX = $state(0);
	let panY = $state(0);
	let isDragging = $state(false);
	let dragOccurred = $state(false);
	let zoomEnabled = $state(false);
	/** @type {number} */
	let dragStartX = 0;
	/** @type {number} */
	let dragStartY = 0;
	/** @type {number} */
	let dragStartPanX = 0;
	/** @type {number} */
	let dragStartPanY = 0;
	/** @type {number} */
	let velocityX = 0;
	/** @type {number} */
	let velocityY = 0;
	/** @type {number} */
	let lastMovePanX = 0;
	/** @type {number} */
	let lastMovePanY = 0;
	/** @type {number} */
	let lastMoveTime = 0;
	/** @type {number | null} */
	let momentumRaf = null;

	let zoomedIn = $state(false);
	/** @type {number} */
	let lastTapTime = 0;
	/** @type {number} */
	let lastTapX = 0;
	/** @type {number} */
	let lastTapY = 0;

	let graphTransition = $state("none");
	/** @type {ReturnType<typeof setTimeout> | undefined} */
	let transitionTimeout = undefined;
	let resizeTimeout = /** @type {ReturnType<typeof setTimeout> | undefined} */ (undefined);

	function clampPan() {
		if (zoom <= 1) { panX = 0; panY = 0; return; }
		const minPanX = containerWidth / zoom - containerWidth;
		const minPanY = containerHeight / zoom - containerHeight;
		panX = Math.max(minPanX, Math.min(0, panX));
		panY = Math.max(minPanY, Math.min(0, panY));
	}

	function killMomentum() {
		if (momentumRaf !== null) {
			cancelAnimationFrame(momentumRaf);
			momentumRaf = null;
		}
	}

	/**
	 * @param {number} cx
	 * @param {number} cy
	 * @param {number} newZoom
	 * @param {number | undefined} duration
	 */
	function zoomToPoint(cx, cy, newZoom, duration) {
		newZoom = Math.max(1, Math.min(5, newZoom));
		const newPanX = panX + cx * (1 / newZoom - 1 / zoom);
		const newPanY = panY + cy * (1 / newZoom - 1 / zoom);
		zoom = newZoom;
		panX = newPanX;
		panY = newPanY;
		clampPan();
		if (!reducedMotion && duration) {
			graphTransition = `transform ${duration}s ease-out`;
			clearTimeout(transitionTimeout);
			transitionTimeout = setTimeout(() => { graphTransition = "none"; }, duration * 1000 + 50);
		}
	}

	/**
	 * @param {number} cx
	 * @param {number} cy
	 */
	function toggleZoom(cx, cy) {
		killMomentum();
		zoomedIn = !zoomedIn;
		if (zoomedIn) {
			zoomToPoint(cx, cy, 2, 0.25);
		} else {
			zoom = 1;
			panX = 0;
			panY = 0;
			if (!reducedMotion) {
				graphTransition = "transform 0.25s ease-out";
				clearTimeout(transitionTimeout);
				transitionTimeout = setTimeout(() => { graphTransition = "none"; }, 300);
			}
		}
	}

	/**
	 * @param {PointerEvent} e
	 */
	function onPointerDown(e) {
		if (e.button !== 0) return;

		// Touch double-tap detection (desktop double-click uses native ondblclick)
		if (e.pointerType === 'touch') {
			const now = performance.now();
			const dx = Math.abs(e.clientX - lastTapX);
			const dy = Math.abs(e.clientY - lastTapY);
			const isDoubleTap = (now - lastTapTime) < 300 && dx < 40 && dy < 40;
			lastTapTime = now;
			lastTapX = e.clientX;
			lastTapY = e.clientY;
			if (isDoubleTap) {
				const rect = svgContainerEl?.getBoundingClientRect();
				if (!rect) return;
				toggleZoom(e.clientX - rect.left, e.clientY - rect.top);
				e.preventDefault();
				return;
			}
		}

		if (!zoomEnabled) return;
		const target = /** @type {HTMLElement} */ (e.target);
		if (target.closest("[data-node-id]")) return;
		if (!isInGraphArea(e.clientX, e.clientY)) return;
		killMomentum();
		clearTimeout(transitionTimeout);
		graphTransition = "none";
		svgEl?.setPointerCapture(e.pointerId);
		isDragging = true;
		dragOccurred = false;
		dragStartX = e.clientX;
		dragStartY = e.clientY;
		dragStartPanX = panX;
		dragStartPanY = panY;
	}

	/**
	 * @param {PointerEvent} e
	 */
	function onPointerMove(e) {
		if (!isDragging) return;
		dragOccurred = true;
		const dx = (e.clientX - dragStartX) / zoom;
		const dy = (e.clientY - dragStartY) / zoom;
		const newPanX = dragStartPanX + dx;
		const newPanY = dragStartPanY + dy;
		const now = performance.now();
		if (lastMoveTime > 0) {
			const dt = now - lastMoveTime;
			if (dt > 0) {
				velocityX = (newPanX - lastMovePanX) / dt;
				velocityY = (newPanY - lastMovePanY) / dt;
			}
		}
		lastMoveTime = now;
		lastMovePanX = newPanX;
		lastMovePanY = newPanY;
		panX = newPanX;
		panY = newPanY;
		clampPan();
	}

	function onPointerUp() {
		isDragging = false;
		if (zoomEnabled && !reducedMotion && (Math.abs(velocityX) > 0.3 || Math.abs(velocityY) > 0.3)) {
			const friction = 0.92;
			const minV = 0.05;
			let vx = velocityX;
			let vy = velocityY;
			/**
			 * @param {number} _ts
			 */
		function step(_ts) {
			if (!sectionVisible) { momentumRaf = null; return; }
			panX += vx;
				panY += vy;
				vx *= friction;
				vy *= friction;
				clampPan();
				if (Math.abs(vx) > minV || Math.abs(vy) > minV) {
					momentumRaf = requestAnimationFrame(step);
				} else {
					momentumRaf = null;
				}
			}
			momentumRaf = requestAnimationFrame(step);
		}
		velocityX = 0;
		velocityY = 0;
		lastMoveTime = 0;
	}

	/**
	 * @param {WheelEvent} e
	 */
	function onWheel(e) {
		if (!zoomEnabled) return;
		if (!isInGraphArea(e.clientX, e.clientY)) return;
		e.preventDefault();
		killMomentum();
		const rect = svgContainerEl?.getBoundingClientRect();
		if (!rect) return;
		const cx = e.clientX - rect.left;
		const cy = e.clientY - rect.top;
		const delta = e.deltaY > 0 ? -0.1 : 0.1;
		zoomToPoint(cx, cy, zoom + delta, 0.2);
	}

	/**
	 * @param {MouseEvent} e
	 */
	function onDblClick(e) {
		if (!zoomEnabled) return;
		e.preventDefault();
		const rect = svgContainerEl?.getBoundingClientRect();
		if (!rect) return;
		toggleZoom(e.clientX - rect.left, e.clientY - rect.top);
	}

	const uncoloredDevicons = new Set(['linux-plain', 'github-original', 'vercel-original']);

	let graphBounds = $derived.by(() => {
		const positions = effectivePositions;
		if (positions.length === 0) return null;
		let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
		for (const p of positions) {
			if (p.x < minX) minX = p.x;
			if (p.y < minY) minY = p.y;
			if (p.x > maxX) maxX = p.x;
			if (p.y > maxY) maxY = p.y;
		}
		const padX = (maxX - minX) * 0.2;
		const padY = (maxY - minY) * 0.2;
		return { minX: minX - padX, minY: minY - padY, maxX: maxX + padX, maxY: maxY + padY };
	});

	let packetTweens = /** @type {gsap.core.Tween[]} */ ([]);
	let pulseTween = /** @type {gsap.core.Tween | null} */ (null);
	let scrollTrigger =
		/** @type {import("gsap/ScrollTrigger").ScrollTrigger | null} */ (null);
	let packetEls = /** @type {SVGCircleElement[]} */ ([]);
	let pauseObserver = /** @type {IntersectionObserver | null} */ (null);
	let sectionVisible = true;

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

	let viewBoxHeight = $derived(Math.max(600, Math.min(2000, 1000 * containerHeight / containerWidth)));

	let nodePositions = $derived(
		displaySkills.map(
			(/** @type {import("$lib/utils/skills_data.svelte.js").Skill} */ s) => ({
				x: s.position.x * 1000,
				y: s.position.y * viewBoxHeight
			})
		)
	);

	let effectivePositions = $derived(nodePositions);

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
			const cy = my + 16 * viewBoxHeight / 700;
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
			return { from: a, to: b, cx: mx, cy: my + 16 * viewBoxHeight / 700 };
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

		const tooltipW = 256;
		const gap = 16;
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
		animateToActive(id);
	}

	function onNodeLeave() {
		if (isMobile || selectedId) return;
		hoveredId = null;
		animateToRest();
	}

	/**
	 * @param {string} id
	 */
	function onNodeClick(id) {
		if (selectedId === id) {
			selectedId = null;
			animateToRest();
			return;
		}
		selectedId = id;
		animateToActive(id);
		if (isMobile) {
			const skill = displaySkills.find((s) => s.id === id);
			if (skill) mobileDetailSkill = skill;
			return;
		}
		updateTooltip();
	}

	function onSvgBgClick() {
		if (isMobile || dragOccurred) return;
		selectedId = null;
		hoveredId = null;
		animateToRest();
	}

	/**
	 * @param {number} clientX
	 * @param {number} clientY
	 */
	function isInGraphArea(clientX, clientY) {
		if (!svgEl || !graphBounds) return false;
		const ctm = svgEl.getScreenCTM();
		if (!ctm) return false;

		const tl = svgEl.createSVGPoint();
		tl.x = graphBounds.minX;
		tl.y = graphBounds.minY;
		const tlScreen = tl.matrixTransform(ctm);

		const br = svgEl.createSVGPoint();
		br.x = graphBounds.maxX;
		br.y = graphBounds.maxY;
		const brScreen = br.matrixTransform(ctm);

		return clientX >= tlScreen.x && clientX <= brScreen.x && clientY >= tlScreen.y && clientY <= brScreen.y;
	}

	function closeMobileDetail() {
		selectedId = null;
		animateToRest();
		mobileDetailSkill = null;
	}



	function startPackets() {
		if (!svgEl) return;

		const pathEls = svgEl.querySelectorAll("[data-edge]");
		const SAMPLE_COUNT = 100;

		skillConnections.forEach((_e, i) => {
			const path = /** @type {SVGPathElement | undefined} */ (pathEls[i]);
			if (!path) return;

			const len = path.getTotalLength();

			/** Pre-compute path points instead of calling getPointAtLength per frame. */
			const samples = new Array(SAMPLE_COUNT);
			for (let k = 0; k < SAMPLE_COUNT; k++) {
				samples[k] = path.getPointAtLength((k / (SAMPLE_COUNT - 1)) * len);
			}

			const count = 1 + Math.floor(Math.random() * 1);

			for (let j = 0; j < count; j++) {
				const initialT = Math.random();
				const initPt = samples[Math.round(initialT * (SAMPLE_COUNT - 1))];

				/* eslint-disable svelte/no-dom-manipulating */
				const circle = document.createElementNS(
					"http://www.w3.org/2000/svg",
					"circle"
				);
				circle.setAttribute("cx", String(initPt.x));
				circle.setAttribute("cy", String(initPt.y));
				circle.setAttribute("r", "1.2");
				circle.setAttribute("fill", "var(--color-c-accent-0)");
				circle.style.opacity = "0";
				circle.style.pointerEvents = "none";
				circle.dataset.packetEdge = String(i);
				svgEl.appendChild(circle);
				/* eslint-enable svelte/no-dom-manipulating */
				packetEls.push(circle);

				const packetDelay = Math.random() * 8;

				/** @type {{ t: number, samples: DOMPoint[], el: SVGCircleElement }} */
				const data = {
					t: initialT,
					samples,
					el: circle
				};

				const tween = gsap.to(data, {
					t: 1,
					duration: 4 + Math.random() * 4,
					repeat: -1,
					ease: "none",
					delay: packetDelay,
					onUpdate: function () {
						const t = data.t;
						const idx = t * (SAMPLE_COUNT - 1);
						const idx0 = Math.floor(idx);
						const idx1 = Math.min(idx0 + 1, SAMPLE_COUNT - 1);
						const frac = idx - idx0;
						const p0 = data.samples[idx0];
						const p1 = data.samples[idx1];
						data.el.setAttribute("cx", String(p0.x + (p1.x - p0.x) * frac));
						data.el.setAttribute("cy", String(p0.y + (p1.y - p0.y) * frac));
					},
					onRepeat: function () {
						gsap.fromTo(
							circle,
							{ opacity: 0 },
							{ opacity: 0.35, duration: 1, ease: "power2.out", overwrite: true }
						);
					}
				});
				packetTweens.push(tween);

				gsap.to(circle, {
					opacity: 0.35,
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
			el.setAttribute("r", isConnected ? "1.6" : "0.8");
		});
	}

	function killAll() {
		pauseObserver?.disconnect();
		pauseObserver = null;
		pulseTween?.kill();
		packetTweens.forEach((t) => t.kill());
		scrollTrigger?.kill();
		packetEls.forEach((el) => el.remove());
		packetEls = [];
	}

	function pauseAllTweens() {
		packetTweens.forEach((t) => t.pause());
		pulseTween?.pause();
	}

	function resumeAllTweens() {
		packetTweens.forEach((t) => t.resume());
		pulseTween?.resume();
	}

	function setupVisibilityPausing() {
		if (pauseObserver) pauseObserver.disconnect();
		if (!sectionEl) return;

		pauseObserver = new IntersectionObserver(
			([entry]) => {
				sectionVisible = entry.isIntersecting;
				if (entry.isIntersecting) resumeAllTweens();
				else pauseAllTweens();
			},
			{ threshold: 0 }
		);
		pauseObserver.observe(sectionEl);

		// Initial check: if section is off-screen when observer starts, pause immediately
		const rect = sectionEl.getBoundingClientRect();
		const vh = window.innerHeight;
		if (rect.bottom <= 0 || rect.top >= vh) {
			sectionVisible = false;
			pauseAllTweens();
		}
	}

	function rebuildGraph() {
		if (!svgEl || !sectionEl) return;

		zoomEnabled = false;

		packetTweens.forEach((t) => t.kill());
		packetTweens = [];
		packetEls.forEach((el) => el.remove());
		packetEls = [];
		svgEl.querySelectorAll("[data-packet-edge]").forEach(
			/** @param {Element} el */ (el) => el.remove()
		);

		pulseTween?.kill();
		pulseTween = null;
		killMomentum();

		const pathEls = svgEl.querySelectorAll("[data-edge]");
		pathEls.forEach(
			/** @param {SVGPathElement} p */ (p) => {
				if (p instanceof SVGPathElement) {
					p.style.removeProperty("strokeDasharray");
					p.style.removeProperty("strokeDashoffset");
					const len = p.getTotalLength();
					p.style.strokeDasharray = String(len);
					p.style.strokeDashoffset = String(len);
				}
			}
		);

		gsap.to(pathEls, {
			strokeDashoffset: 0,
			duration: 0.6,
			stagger: 0.02,
			ease: "power3.inOut",
			onComplete: () => {
				pathEls.forEach(
					/** @param {SVGPathElement} p */ (p) => {
						if (p instanceof SVGPathElement) {
							p.style.removeProperty("strokeDasharray");
							p.style.removeProperty("strokeDashoffset");
						}
					}
				);
				if (!isTouchDevice) zoomEnabled = true;
			}
		});

		if (!reducedMotion) {
			requestAnimationFrame(() => {
				startPackets();
				setupVisibilityPausing();
			});
		}
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

		if (paraEl) gsap.set(paraEl, { y: 32, opacity: 0, scale: 0.97 });
		if (buttonEl) gsap.set(buttonEl, { y: 16, opacity: 0 });

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
					if (!isTouchDevice) zoomEnabled = true;
				}
			},
			"-=0.3"
		);

		tl.call(() => {
			if (!reducedMotion) {
				startPackets();
			}
			setupVisibilityPausing();
		});

		scrollTrigger = ScrollTrigger.create({
			trigger: sectionEl,
			start: "top 20%",
			once: true,
			animation: tl
		});
	}

	$effect(() => {
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
		if (svgContainerEl) {
			const rect = svgContainerEl.getBoundingClientRect();
			containerWidth = rect.width;
			containerHeight = rect.height;
		}

		const mql = window.matchMedia(`(max-width: ${LG_BREAKPOINT - 1}px)`);
		isMobile = mql.matches;
		const onMqlChange = (/** @type {MediaQueryListEvent} */ e) => (isMobile = e.matches);
		mql.addEventListener("change", onMqlChange);

		let roFirst = true;
		const ro = new ResizeObserver(([entry]) => {
			if (roFirst) { roFirst = false; return; }
			const box = entry.contentBoxSize?.[0] ?? entry.borderBoxSize?.[0];
			if (box) {
				containerWidth = box.inlineSize;
				containerHeight = box.blockSize;
			} else {
				const rect = entry.target.getBoundingClientRect();
				containerWidth = rect.width;
				containerHeight = rect.height;
			}
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(rebuildGraph, 150);
		});
		if (svgContainerEl) ro.observe(svgContainerEl);

		if (reducedMotion) {
			if (!isTouchDevice) zoomEnabled = true;
			return () => {
				mql.removeEventListener("change", onMqlChange);
				ro.disconnect();
				clearTimeout(resizeTimeout);
			};
		}

		requestAnimationFrame(() => initAnimations());

		return () => {
			mql.removeEventListener("change", onMqlChange);
			ro.disconnect();
			clearTimeout(resizeTimeout);
			killAll();
		};
	});
</script>

<section
	bind:this={sectionEl}
	use:inertOffscreen
	id="skills"
	class="flex w-full max-lg:h-screen max-lg:flex-col max-lg:py-4 max-lg:pb-8 lg:min-h-screen lg:flex-row"
>
	<!-- mobile heading -->
	<div
		class="pt-20 pb-4 px-5 bg-c-bg-0 lg:hidden"
	>
		<AnimatedHeading
			tag="h2"
			start={true}
			reducedMotion={reducedMotion}
			class="font-c-unbounded text-3xl max-sm:text-xl font-black text-c-neutral-0"
			sectionId="skills"
		>
			Some <span class="text-c-accent-0">skills</span> I have honed.
		</AnimatedHeading>
	</div>

	<!-- SVG graph panel (left on desktop, top on mobile) -->
	<div
		class="flex w-full items-center justify-center px-3 max-lg:flex-1 max-lg:min-h-[40vh] lg:self-center lg:h-[70vh] lg:w-3/5 lg:px-6"
	>
	<div bind:this={svgContainerEl} class="relative h-full w-full overflow-hidden">
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<svg
				bind:this={svgEl}
				viewBox="0 0 1000 {viewBoxHeight}"
				class="h-full w-full"
				style="transform: scale({zoom}) translate({panX}px, {panY}px); transition: {graphTransition}; transform-origin: 0 0"
				preserveAspectRatio="xMidYMid meet"
				role="img"
				aria-label="Skills network graph"
				onclick={onSvgBgClick}
				onpointerdown={onPointerDown}
				onpointermove={onPointerMove}
				onpointerup={onPointerUp}
				onwheel={onWheel}
				ondblclick={onDblClick}
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
						stroke-width="1.2"
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
							r={isMobile ? 37 : 21}
							class="fill-c-bg-2/50"
							stroke-width="1.2"
							stroke="var(--color-c-border)"
						/>
						{#if !isMobile}
							<circle
								r="24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.6"
								class="pointer-events-none text-c-accent-0"
								data-pulse={skill.id}
								opacity="0"
							/>
						{/if}
						{#if skill.devicon}
							<foreignObject x="-16" y="-16" width="32" height="32">
								<div class="flex h-full w-full items-center justify-center leading-none">
									<i class="devicon-{skill.devicon} {!uncoloredDevicons.has(skill.devicon) && 'colored'} max-lg:text-4xl" style="font-size: 20px;"></i>
								</div>
							</foreignObject>
						{:else}
							<text
								text-anchor="middle"
								dominant-baseline="central"
								class="pointer-events-none fill-c-neutral-0 text-xs select-none max-lg:text-2xl"
							>
								{skill.icon}
							</text>
						{/if}
					</g>
				{/each}
			</svg>

			<!-- desktop tooltip overlay -->
			{#if !isMobile && activeSkill && (hoveredId || selectedId)}
				<div
					class="pointer-events-none absolute z-10"
					style="left: 0; top: 0; transform: translate({tooltipX}px, {tooltipY}px) translateY(-50%);"
					transition:fade={{ duration: reducedMotion ? 0 : 120 }}
				>
					<div
						class="w-64 rounded-2xl border border-c-border/40 bg-c-bg-2/90 px-5 py-4 shadow-lg backdrop-blur-xl"
					>
						<div class="flex items-center gap-2.5">
							{#if activeSkill.devicon}
								<i class="devicon-{activeSkill.devicon} {!uncoloredDevicons.has(activeSkill.devicon) && 'colored'} text-3xl shrink-0 leading-none"></i>
							{:else}
								<span class="text-3xl">{activeSkill.icon}</span>
							{/if}
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
						<p
							class="mt-2.5 font-c-ubuntu text-xs leading-relaxed text-c-neutral-1"
						>
							{activeSkill.description}
						</p>
						<div class="mt-2.5">
							<span
								class="font-c-bebas text-xs tracking-widest text-c-neutral-1 uppercase"
							>
								{activeSkill.experience}
							</span>
						</div>
						{#if activeSkill.relatedTechnologies.length > 0}
							<div class="mt-2.5 flex flex-wrap gap-1">
								{#each activeSkill.relatedTechnologies as tech (tech)}
									<span
										class="rounded-full border border-c-border/30 px-2 py-0.5 font-c-ubuntu text-xs text-c-neutral-0"
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
		class="flex w-full flex-col justify-center gap-5 px-5 max-lg:py-6 bg-c-bg-0 lg:w-2/5 lg:gap-8 lg:px-10 lg:py-20 lg:pl-12"
	>
		<AnimatedHeading
			tag="h2"
			start={!isMobile}
			reducedMotion={reducedMotion}
			class="font-c-unbounded text-2xl font-black text-c-neutral-0 max-lg:hidden lg:text-5xl"
			sectionId="skills"
		>
			Some <span class="text-c-accent-0">skills</span> I have honed.
		</AnimatedHeading>

		<p
			bind:this={paraEl}
			class="font-c-ubuntu text-base max-sm:text-xs leading-relaxed text-c-neutral-1 lg:text-xl"
		>
			A collection of technologies and tools I've worked with across frontend
			and backend development, cloud infrastructure, and design. Each node
			represents a skill — hover to see details, or click to pin the info open.
		</p>

		<AccentLink
			href={resolve("/experiences")}
			class="-translate-x-3 px-3 py-1 font-c-unbounded text-xs max-sm:text-xs font-bold max-lg:pointer-events-auto lg:text-sm"
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
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5"
		onclick={closeMobileDetail}
		onkeydown={(e) => e.key === "Escape" && closeMobileDetail()}
		role="dialog"
		tabindex="0"
		transition:fade={{ duration: reducedMotion ? 0 : 150 }}
	>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			class="w-full max-w-sm rounded-2xl border border-c-border/40 bg-c-bg-0 p-8 shadow-xl backdrop-blur-xl"
			role="document"
			onclick={(e) => e.stopPropagation()}
			onkeydown={() => {}}
			transition:scale={{ start: reducedMotion ? 1 : 0.92, duration: reducedMotion ? 0 : 150 }}
		>
			<div class="flex items-center gap-3">
				{#if mobileDetailSkill.devicon}
					<i class="devicon-{mobileDetailSkill.devicon} {!uncoloredDevicons.has(mobileDetailSkill.devicon) && 'colored'} text-4xl shrink-0 leading-none"></i>
				{:else}
					<span class="text-4xl">{mobileDetailSkill.icon}</span>
				{/if}
				<div>
					<h3 class="font-c-unbounded text-xl text-c-neutral-0">
						{mobileDetailSkill.name}
					</h3>
					<span
						class="font-c-bebas text-xs tracking-widest text-c-neutral-1 uppercase"
					>
						{mobileDetailSkill.category}
					</span>
				</div>
			</div>
			<p class="mt-3 font-c-ubuntu text-sm leading-relaxed text-c-neutral-1">
				{mobileDetailSkill.description}
			</p>
			<div class="mt-3">
				<span
					class="font-c-bebas text-xs tracking-widest text-c-neutral-1 uppercase"
				>
					Experience
				</span>
				<p class="font-c-ubuntu text-sm text-c-neutral-0">
					{mobileDetailSkill.experience}
				</p>
			</div>
			{#if mobileDetailSkill.relatedTechnologies.length > 0}
				<div class="mt-3">
					<span
						class="font-c-bebas text-xs tracking-widest text-c-neutral-1 uppercase"
					>
						Related
					</span>
					<div class="mt-1.5 flex flex-wrap gap-1.5">
						{#each mobileDetailSkill.relatedTechnologies as tech (tech)}
							<span
								class="rounded-full border border-c-border/30 px-2.5 py-0.5 font-c-ubuntu text-xs text-c-neutral-0"
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

