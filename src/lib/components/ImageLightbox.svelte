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
	let lastTouchDist = $state(0);
	let reducedMotion = $state(
		typeof window !== "undefined" &&
			window.matchMedia("(prefers-reduced-motion: reduce)").matches
	);
	let imgTransition = $state("none");
	let momentumRaf = /** @type {number | null} */ (null);
	let velocityX = 0;
	let velocityY = 0;
	let lastMovePanX = 0;
	let lastMovePanY = 0;
	let lastMoveTime = 0;
	let transitionTimeout = /** @type {ReturnType<typeof setTimeout> | undefined} */ (undefined);

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
		if (e.button !== 0) return;
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

	/**
	 * @param {TouchEvent} e
	 */
	function onTouchStart(e) {
		if (e.touches.length === 1) {
			killMomentum();
			clearTimeout(transitionTimeout);
			imgTransition = "none";
			isDragging = true;
			dragStartX = e.touches[0].clientX;
			dragStartY = e.touches[0].clientY;
			dragStartPanX = panX;
			dragStartPanY = panY;
		} else if (e.touches.length === 2) {
			killMomentum();
			clearTimeout(transitionTimeout);
			imgTransition = "none";
			const dx = e.touches[0].clientX - e.touches[1].clientX;
			const dy = e.touches[0].clientY - e.touches[1].clientY;
			lastTouchDist = Math.hypot(dx, dy);
		}
	}

	/**
	 * @param {TouchEvent} e
	 */
	function onTouchMove(e) {
		if (e.touches.length === 1 && isDragging) {
			const newPanX = dragStartPanX + (e.touches[0].clientX - dragStartX);
			const newPanY = dragStartPanY + (e.touches[0].clientY - dragStartY);
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
		} else if (e.touches.length === 2) {
			isDragging = false;
			const dx = e.touches[0].clientX - e.touches[1].clientX;
			const dy = e.touches[0].clientY - e.touches[1].clientY;
			const dist = Math.hypot(dx, dy);
			if (lastTouchDist > 0) {
				const newScale = Math.min(5, Math.max(1, scale * (dist / lastTouchDist)));
				const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
				const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
				const mx = cx - window.innerWidth / 2;
				const my = cy - window.innerHeight / 2;
				const imgX = (mx - panX) / scale;
				const imgY = (my - panY) / scale;
				panX = mx - imgX * newScale;
				panY = my - imgY * newScale;
				scale = newScale;
			}
			lastTouchDist = dist;
		}
	}

	function onTouchEnd() {
		isDragging = false;
		lastTouchDist = 0;
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
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 cursor-pointer overflow-hidden touch-action-none"
	onclick={close}
	onmousemove={onMouseMove}
	onmouseup={onMouseUp}
	onmouseleave={onMouseUp}
	ontouchstart={onTouchStart}
	ontouchmove={onTouchMove}
	ontouchend={onTouchEnd}
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
		class="max-h-[90vh] max-w-[90vw] object-contain cursor-grab touch-action-none {isDragging ? 'cursor-grabbing' : ''}"
		style="transform: scale({scale}) translate({panX}px, {panY}px); transition: {imgTransition}"
		onwheel={onWheel}
		onmousedown={onMouseDown}
		onclick={(/** @type {MouseEvent} */ e) => e.stopPropagation()}
		draggable={false}
	/>
</div>
