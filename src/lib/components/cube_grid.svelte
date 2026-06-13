<script>
	import { onMount, tick } from "svelte";
	import { gsap } from "gsap";
	import { staggerRotateTiles } from "$lib";

	let { activeImage = null, entryActive = $bindable(true) } = $props();

	let reducedMotion = $state(typeof window !== 'undefined' && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

	/** @type {HTMLDivElement | undefined} */
	let gridEl = $state();

	let cols = $state(12);
	let rows = $state(9);

	let revealCount = 0;
	let isAnimating = false;
	/** @type {string | null} */
	let queuedImage = null;

	/** @type {Array<{el: HTMLDivElement, front: HTMLDivElement | null, rear: HTMLDivElement | null, col: number, row: number}>} */
	let tileMeta = [];

	/** @type {gsap.core.Tween[]} */
	let breathingTweens = [];

	/** @type {IntersectionObserver | null} */
	let breathingObserver = null;

	let firstEffectRun = true;

	// proximity dimming
	const DIM_FAR = 80;
	const DIM_STRENGTH = 0.15;

	/** @type {number[]} */
	let tileApplied = [];
	/** @type {boolean[]} */
	let tileWasNear = [];

	/** @type {{ cx: number, cy: number }[]} */
	let cachedTileCenters = [];

	/** @type {number | null} */
	let moveRafId = null;
	let lastMoveX = 0;
	let lastMoveY = 0;

	let tileIndices = $derived(Array.from({ length: rows * cols }, (_, i) => i));

	/** @type {ResizeObserver | null} */
	let ro = null;
	/** @type {ReturnType<typeof setTimeout> | undefined} */
	let roTimer;
	/** @type {boolean} */
	let rebuildingGrid = false;
	let resizeKey = $state(0);

	function computeGridDimensions() {
		if (!gridEl) return;
		const w = gridEl.clientWidth;
		const h = gridEl.clientHeight;
		if (!w || !h) return;
		const aspect = w / h;
		const targetN = 144;
		cols = Math.max(Math.round(Math.sqrt(targetN * aspect)), 4);
		rows = Math.max(Math.round(Math.sqrt(targetN / aspect)), 3);
	}

	function getTileDimensions() {
		if (!gridEl) return { w: 0, h: 0 };
		const rect = gridEl.getBoundingClientRect();
		return { w: rect.width / cols, h: rect.height / rows };
	}

	/**
	 * @param {string} src
	 * @returns {HTMLImageElement | null}
	 */
	function findImageElement(src) {
		for (const img of document.querySelectorAll("img")) {
			if (img.getAttribute("src") === src) return img;
		}
		return null;
	}

	/**
	 * @param {string} src
	 * @returns {Promise<boolean>}
	 */
	function ensureImageLoaded(src) {
		const el = findImageElement(src);
		if (!el) return Promise.resolve(false);
		if (el.complete) return Promise.resolve(el.naturalWidth > 0);
		return new Promise((resolve) => {
			el.addEventListener("load", () => resolve(true), { once: true });
			el.addEventListener("error", () => resolve(false), { once: true });
		});
	}

	/**
	 * @param {string} src
	 * @returns {{ w: number, h: number } | null}
	 */
	function getImageDimensions(src) {
		const el = findImageElement(src);
		if (el && el.complete && el.naturalWidth) {
			return { w: el.naturalWidth, h: el.naturalHeight };
		}
		return null;
	}

	/**
	 * @param {string} image
	 * @param {"front" | "rear"} face
	 */
	function paintFaces(image, face) {
		const { w, h } = getTileDimensions();
		if (!w || !h) return;
		const fullW = cols * w;
		const fullH = rows * h;

		const dims = getImageDimensions(image);
		if (!dims) return;
		const imgAspect = dims.w / dims.h;
		const gridAspect = fullW / fullH;

		let bgW, bgH, offsetX, offsetY;

		if (imgAspect > gridAspect) {
			bgH = fullH;
			bgW = bgH * imgAspect;
			offsetX = (bgW - fullW) / 2;
			offsetY = 0;
		} else {
			bgW = fullW;
			bgH = bgW / imgAspect;
			offsetX = 0;
			offsetY = (bgH - fullH) / 2;
		}

		tileMeta.forEach((t) => {
			const target = face === "front" ? t.front : t.rear;
			if (!target) return;
			target.style.backgroundImage = `url("${image}")`;
			target.style.backgroundSize = `${bgW}px ${bgH}px`;
			target.style.backgroundPosition = `-${t.col * w + offsetX}px -${t.row * h + offsetY}px`;
		});
	}

	/** @param {MouseEvent} e */
	function onGridMove(e) {
		lastMoveX = e.clientX;
		lastMoveY = e.clientY;
		if (moveRafId) return;
		moveRafId = requestAnimationFrame(processGridMove);
	}

	function processGridMove() {
		moveRafId = null;
		if (!gridEl) return;
		const gridRect = gridEl.getBoundingClientRect();
		const gx = gridRect.left;
		const gy = gridRect.top;
		const gw = gridRect.width;
		const gh = gridRect.height;

		const farSq = DIM_FAR * DIM_FAR;

		for (let i = 0; i < tileMeta.length; i++) {
			const c = cachedTileCenters[i];
			const cx = gx + c.cx * gw;
			const cy = gy + c.cy * gh;
			const dx = lastMoveX - cx;
			const dy = lastMoveY - cy;
			const distSq = dx * dx + dy * dy;

			if (distSq < farSq) {
				tileWasNear[i] = true;
				if (tileApplied[i] !== DIM_STRENGTH) {
					tileApplied[i] = DIM_STRENGTH;
					const t = tileMeta[i];
					gsap.killTweensOf([t.front, t.rear], "opacity");
					gsap.set([t.front, t.rear], { opacity: DIM_STRENGTH });
				}
			} else if (tileWasNear[i]) {
				tileWasNear[i] = false;
				tileApplied[i] = 1;
				const t = tileMeta[i];
				gsap.to([t.front, t.rear], {
					opacity: 1,
					duration: 3,
					ease: "power2.out"
				});
			}
		}
	}

	function onGridLeave() {
		for (let i = 0; i < tileMeta.length; i++) {
			if (tileApplied[i] < 1) {
				tileWasNear[i] = false;
				tileApplied[i] = 1;
				const t = tileMeta[i];
				gsap.to([t.front, t.rear], {
					opacity: 1,
					duration: 3,
					ease: "power2.out"
				});
			}
		}
	}

	function initProximityDim() {
		if (!gridEl || tileMeta.length === 0) return;
		tileApplied = new Array(tileMeta.length).fill(1);
		tileWasNear = new Array(tileMeta.length).fill(false);
		gridEl.addEventListener("mousemove", onGridMove);
		gridEl.addEventListener("mouseleave", onGridLeave);
	}

	function startBreathing() {
		tileMeta.forEach((t) => {
			const tw = gsap.to(t.el, {
				z: gsap.utils.random(-32, 80),
				rotationZ: gsap.utils.random(-0.5, 0.5),
				duration: gsap.utils.random(1.5, 3),
				repeat: -1,
				yoyo: true,
				ease: "sine.inOut",
				delay: gsap.utils.random(0, 2)
			});
			breathingTweens.push(tw);
		});
		setupBreathingOffscreenPause();
	}

	function stopBreathing() {
		breathingTweens.forEach((t) => t.kill());
		breathingTweens = [];
		breathingObserver?.disconnect();
		breathingObserver = null;
	}

	function setupBreathingOffscreenPause() {
		if (!gridEl || breathingObserver) return;
		const parent = gridEl.closest("section") || gridEl;
		breathingObserver = new IntersectionObserver(([entry]) => {
			const paused = !entry.isIntersecting;
			for (const t of breathingTweens) t.paused(paused);
		}, { threshold: 0 });
		breathingObserver.observe(parent);
	}

	function onTransitionComplete() {
		revealCount++;
		isAnimating = false;
		if (queuedImage) {
			const next = queuedImage;
			queuedImage = null;
			transitionTo(next);
		}
	}

	/** @param {string} image */
	function transitionTo(image) {
		if (isAnimating) {
			queuedImage = image;
			return;
		}
		isAnimating = true;

		const hiddenFace = revealCount % 2 === 0 ? "rear" : "front";
		paintFaces(image, hiddenFace);

		const cubes = tileMeta.map((t) => t.el);
		const baseRotation = revealCount % 2 === 0 ? 0 : 180;
		cubes.forEach(cube => {
			gsap.killTweensOf(cube, "rotationY");
			gsap.set(cube, { rotationY: baseRotation });
		});
		staggerRotateTiles(cubes, cols, rows, onTransitionComplete, reducedMotion);
	}

	async function setupGrid() {
		computeGridDimensions();
		await tick();

		const els = /** @type {HTMLDivElement[]} */ ([
			...(gridEl?.querySelectorAll("[data-tile-index]") ?? [])
		]);
		tileMeta = els.map((el, i) => {
			const col = i % cols;
			const row = Math.floor(i / cols);
			return {
				el,
				front: el.querySelector(".front"),
				rear: el.querySelector(".rear"),
				col,
				row
			};
		});

		cachedTileCenters = tileMeta.map(t => ({
			cx: (t.col + 0.5) / cols,
			cy: (t.row + 0.5) / rows
		}));

		if (!reducedMotion) {
			startBreathing();
			initProximityDim();
		}

		if (activeImage) {
			paintFaces(activeImage, "front");
		}
	}

	function rebuildCubeGrid() {
		if (rebuildingGrid || !gridEl) return;
		rebuildingGrid = true;
		if (moveRafId) { cancelAnimationFrame(moveRafId); moveRafId = null; }

		const oldCols = cols;
		const oldRows = rows;
		computeGridDimensions();

		if (cols === oldCols && rows === oldRows) {
			if (activeImage) {
				paintFaces(activeImage, "front");
			}
			stopBreathing();
			if (!reducedMotion) {
				startBreathing();
				initProximityDim();
			}
			rebuildingGrid = false;
			return;
		}

		stopBreathing();
		gridEl.removeEventListener("mousemove", onGridMove);
		gridEl.removeEventListener("mouseleave", onGridLeave);

		revealCount = 0;
		isAnimating = false;
		queuedImage = null;
		resizeKey++;
		setupGrid().finally(() => {
			const baseRot = revealCount % 2 === 0 ? 0 : 180;
			gsap.set(tileMeta.map(t => t.el), { rotationY: baseRot });
			if (!reducedMotion) {
				stopBreathing();
				startBreathing();
			}
			rebuildingGrid = false;
		});
	}

	onMount(async () => {
		await setupGrid();
		ro = new ResizeObserver(() => {
			clearTimeout(roTimer);
			roTimer = setTimeout(rebuildCubeGrid, 50);
		});
		if (gridEl) ro.observe(gridEl);
	});

	$effect(() => {
		const img = activeImage;
		if (firstEffectRun) {
			firstEffectRun = false;
			return;
		}
		if (entryActive) {
			if (img) queuedImage = img;
			return;
		}
		if (img && tileMeta.length > 0) {
			transitionTo(img);
		}
	});

	$effect(() => {
		if (entryActive) return;
		if (queuedImage) {
			const q = queuedImage;
			queuedImage = null;
			transitionTo(q);
		}
	});

	$effect(() => {
		return () => {
			if (moveRafId) cancelAnimationFrame(moveRafId);
			stopBreathing();
			clearTimeout(roTimer);
			ro?.disconnect();
		};
	});
</script>

<div
	bind:this={gridEl}
	class="cube-grid h-full w-full"
	style="perspective: 1200px; display: grid; grid-template-columns: repeat({cols}, 1fr); grid-template-rows: repeat({rows}, 1fr)"
>
	{#each tileIndices as i (resizeKey + '-' + i)}
		<div
			data-tile-index={i}
			class="cube-tile relative"
			style="transform-style: preserve-3d"
		>
			<div class="cube h-full w-full" style="transform-style: preserve-3d">
				<div
					class="cube-face front absolute inset-0"
					style="backface-visibility: hidden; transform: translateZ(1px)"
				></div>
				<div
					class="cube-face rear absolute inset-0"
					style="backface-visibility: hidden; transform: rotateY(180deg) translateZ(1px)"
				></div>
			</div>
		</div>
	{/each}
</div>
