<script>
	import { onMount } from "svelte";
	import { gsap } from "gsap";
	import { staggerRotateTiles, GRID_COLS, GRID_ROWS } from "$lib";

	let { activeImage = null, cols = GRID_COLS, rows = GRID_ROWS } = $props();

	/** @type {HTMLDivElement | undefined} */
	let gridEl = $state();

	let revealCount = 0;
	let isAnimating = false;
	/** @type {string | null} */
	let queuedImage = null;

	/** @type {Array<{el: HTMLDivElement, front: HTMLDivElement | null, rear: HTMLDivElement | null, col: number, row: number}>} */
	let tileMeta = [];

	/** @type {gsap.core.Tween[]} */
	let breathingTweens = [];

	let firstEffectRun = true;

	let tileIndices = $derived(Array.from({ length: rows * cols }, (_, i) => i));

	function getTileDimensions() {
		if (!gridEl) return { w: 0, h: 0 };
		const rect = gridEl.getBoundingClientRect();
		return { w: rect.width / cols, h: rect.height / rows };
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

		tileMeta.forEach((t) => {
			const target = face === "front" ? t.front : t.rear;
			if (!target) return;
			target.style.backgroundImage = `url("${image}")`;
			target.style.backgroundSize = `${fullW}px ${fullH}px`;
			target.style.backgroundPosition = `-${t.col * w}px -${t.row * h}px`;
		});
	}

	function startBreathing() {
		tileMeta.forEach((t) => {
			const tw = gsap.to(t.el, {
				z: gsap.utils.random(-40, 100),
				rotationZ: gsap.utils.random(-0.5, 0.5),
				duration: gsap.utils.random(1.5, 3),
				repeat: -1,
				yoyo: true,
				ease: "sine.inOut",
				delay: gsap.utils.random(0, 2)
			});
			breathingTweens.push(tw);
		});
	}

	function stopBreathing() {
		breathingTweens.forEach((t) => t.kill());
		breathingTweens = [];
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
		staggerRotateTiles(cubes, cols, rows, onTransitionComplete);
	}

	onMount(() => {
		const els = /** @type {HTMLDivElement[]} */ (
			[...(gridEl?.querySelectorAll("[data-tile-index]") ?? [])]
		);
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

		if (activeImage) {
			paintFaces(activeImage, "front");
		}

		startBreathing();
	});

	$effect(() => {
		if (activeImage && tileMeta.length > 0) {
			if (firstEffectRun) {
				firstEffectRun = false;
				return;
			}
			transitionTo(activeImage);
		}
	});

	$effect(() => {
		return () => {
			stopBreathing();
		};
	});
</script>

<div
	bind:this={gridEl}
	class="cube-grid h-full w-full"
	style="perspective: 1200px; display: grid; grid-template-columns: repeat({cols}, 1fr); grid-template-rows: repeat({rows}, 1fr)"
>
	{#each tileIndices as i (i)}
		<div
			data-tile-index={i}
			class="cube-tile relative"
			style="transform-style: preserve-3d; will-change: transform"
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
