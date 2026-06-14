<script>
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
		const delta = e.deltaY > 0 ? 1 : -1;
		const newScale = Math.min(5, Math.max(1, scale * (1 - delta * 0.1)));
		const mx = e.clientX - window.innerWidth / 2;
		const my = e.clientY - window.innerHeight / 2;
		const imgX = (mx - panX) / scale;
		const imgY = (my - panY) / scale;
		panX = mx - imgX * newScale;
		panY = my - imgY * newScale;
		scale = newScale;
	}

	/**
	 * @param {MouseEvent} e
	 */
	function onMouseDown(e) {
		if (e.button !== 0) return;
		e.preventDefault();
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
		panX = dragStartPanX + (e.clientX - dragStartX);
		panY = dragStartPanY + (e.clientY - dragStartY);
	}

	function onMouseUp() { isDragging = false; }

	/**
	 * @param {TouchEvent} e
	 */
	function onTouchStart(e) {
		if (e.touches.length === 1) {
			isDragging = true;
			dragStartX = e.touches[0].clientX;
			dragStartY = e.touches[0].clientY;
			dragStartPanX = panX;
			dragStartPanY = panY;
		} else if (e.touches.length === 2) {
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
			panX = dragStartPanX + (e.touches[0].clientX - dragStartX);
			panY = dragStartPanY + (e.touches[0].clientY - dragStartY);
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
	}
</script>

<svelte:window onkeydown={onKeydown} />

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 cursor-pointer overflow-hidden"
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
	<img
		src={src}
		alt=""
		class="max-h-[90vh] max-w-[90vw] object-contain cursor-grab touch-action-none"
		class:cursor-grabbing={isDragging}
		style="transform: scale({scale}) translate({panX}px, {panY}px)"
		onwheel={onWheel}
		onmousedown={onMouseDown}
		onclick={(e) => e.stopPropagation()}
		draggable={false}
	/>
</div>
