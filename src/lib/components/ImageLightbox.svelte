<script>
	import { Picture } from "$lib";
	let {
		src = "",
		onclose = /** @type {(() => void) | undefined} */ (undefined)
	} = $props();

	let scale = $state(1);
	let panX = $state(0);
	let panY = $state(0);
	let isDragging = $state(false);
	let dragStartX = $state(0);
	let dragStartY = $state(0);
	let dragStartPanX = $state(0);
	let dragStartPanY = $state(0);
	let reducedMotion = $state(
		typeof window !== "undefined" &&
			window.matchMedia("(prefers-reduced-motion: reduce)").matches
	);
	let isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
	let imgTransition = $state("none");
	let momentumRaf = /** @type {number | null} */ (null);
	let velocityX = 0;
	let velocityY = 0;
	let lastMovePanX = 0;
	let lastMovePanY = 0;
	let lastMoveTime = 0;
	let transitionTimeout = /** @type {ReturnType<typeof setTimeout> | undefined} */ (undefined);

	let lastTapTime = 0;
	let lastTapX = 0;
	let lastTapY = 0;
	let zoomedIn = $state(false);

	/**
	 * @param {number} cx
	 * @param {number} cy
	 */
	function toggleZoom(cx, cy) {
		zoomedIn = !zoomedIn;
		if (zoomedIn) {
			const mx = cx - window.innerWidth / 2;
			const my = cy - window.innerHeight / 2;
			const imgX = (mx - panX) / scale;
			const imgY = (my - panY) / scale;
			scale = 2;
			panX = mx - imgX * scale;
			panY = my - imgY * scale;
		} else {
			scale = 1;
			panX = 0;
			panY = 0;
		}
		if (!reducedMotion) {
			imgTransition = "transform 0.25s ease-out";
			clearTimeout(transitionTimeout);
			transitionTimeout = setTimeout(() => {
				imgTransition = "none";
			}, 300);
		}
	}

	/**
	 * @param {TouchEvent} e
	 */
	function onTouchStart(e) {
		if (e.touches.length !== 1) {
			lastTapTime = 0;
			return;
		}
		const now = performance.now();
		const dx = Math.abs(e.touches[0].clientX - lastTapX);
		const dy = Math.abs(e.touches[0].clientY - lastTapY);
		const isDoubleTap = (now - lastTapTime) < 300 && dx < 40 && dy < 40;

		lastTapTime = now;
		lastTapX = e.touches[0].clientX;
		lastTapY = e.touches[0].clientY;

		if (isDoubleTap) {
			toggleZoom(e.touches[0].clientX, e.touches[0].clientY);
			e.preventDefault();
		}
	}

	/**
	 * @param {MouseEvent} e
	 */
	function onDblClick(e) {
		e.preventDefault();
		toggleZoom(e.clientX, e.clientY);
	}

	function killMomentum() {
		if (momentumRaf !== null) {
			cancelAnimationFrame(momentumRaf);
			momentumRaf = null;
		}
	}

	function close() { onclose?.(); }

	/**
	 * @param {KeyboardEvent} e
	 */
	function onKeydown(e) {
		if (e.key === "Escape") close();
	}

	/**
	 * @param {WheelEvent} e
	 */
	function onWheel(e) {
		if (isTouchDevice) return;
		e.preventDefault();
		killMomentum();
		const delta = e.deltaY > 0 ? 1 : -1;
		const newScale = Math.min(5, Math.max(1, scale * (1 - delta * 0.1)));
		const mx = e.clientX - window.innerWidth / 2;
		const my = e.clientY - window.innerHeight / 2;
		const imgX = (mx - panX) / scale;
		const imgY = (my - panY) / scale;
		panX = mx - imgX * newScale;
		panY = my - imgY * newScale;
		scale = newScale;
		if (!reducedMotion) {
			clearTimeout(transitionTimeout);
			imgTransition = "transform 0.2s ease-out";
			transitionTimeout = setTimeout(() => {
				imgTransition = "none";
			}, 250);
		}
	}

	/**
	 * @param {MouseEvent} e
	 */
	function onMouseDown(e) {
		if (isTouchDevice || e.button !== 0) return;
		e.preventDefault();
		killMomentum();
		clearTimeout(transitionTimeout);
		imgTransition = "none";
		isDragging = true;
		dragStartX = e.clientX;
		dragStartY = e.clientY;
		dragStartPanX = panX;
		dragStartPanY = panY;
	}

	/**
	 * @param {MouseEvent} e
	 */
	function onMouseMove(e) {
		if (!isDragging) return;
		const newPanX = dragStartPanX + (e.clientX - dragStartX);
		const newPanY = dragStartPanY + (e.clientY - dragStartY);
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
	}

	function onMouseUp() {
		isDragging = false;
		if (!reducedMotion && (Math.abs(velocityX) > 0.5 || Math.abs(velocityY) > 0.5)) {
			const friction = 0.92;
			const minV = 0.5;
			let vx = velocityX;
			let vy = velocityY;
			function step() {
				panX += vx;
				panY += vy;
				vx *= friction;
				vy *= friction;
				const maxX = (scale - 1) * window.innerWidth * 0.4;
				const maxY = (scale - 1) * window.innerHeight * 0.4;
				panX = Math.max(-maxX, Math.min(maxX, panX));
				panY = Math.max(-maxY, Math.min(maxY, panY));
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

</script>

<svelte:window onkeydown={onKeydown} />

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 cursor-pointer overflow-hidden"
	onclick={close}
	onmousemove={onMouseMove}
	onmouseup={onMouseUp}
	onmouseleave={onMouseUp}
	role="button"
	tabindex="0"
>
	<button
		class="absolute top-4 right-4 text-white text-2xl font-bold leading-none cursor-pointer z-10"
		onclick={close}
	>&times;</button>
	<Picture
		src={src}
		alt=""
		class="max-h-[90vh] max-w-[90vw] object-contain cursor-grab {isDragging ? 'cursor-grabbing' : ''}"
		style="transform: scale({scale}) translate({panX}px, {panY}px); transition: {imgTransition}"
		onwheel={onWheel}
		onmousedown={onMouseDown}
		ondblclick={onDblClick}
		ontouchstart={onTouchStart}
		onclick={(/** @type {MouseEvent} */ e) => e.stopPropagation()}
		draggable={false}
	/>
</div>
