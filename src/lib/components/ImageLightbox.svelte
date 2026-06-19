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
	let isMobilePlatform =
		typeof window !== "undefined" &&
		window.matchMedia("(hover: none) and (pointer: coarse)").matches;
	let imgTransition = $state("none");
	let momentumRaf = /** @type {number | null} */ (null);
	let velocityX = 0;
	let velocityY = 0;
	let lastMovePanX = 0;
	let lastMovePanY = 0;
	let lastMoveTime = 0;
	let transitionTimeout =
		/** @type {ReturnType<typeof setTimeout> | undefined} */ (undefined);

	let lastTapTime = 0;
	let lastTapX = 0;
	let lastTapY = 0;
	let zoomedIn = $state(false);

	$effect(() => {
		const scrollY = window.scrollY;
		document.body.classList.add("overflow-hidden");
		document.body.style.top = `-${scrollY}px`;
		return () => {
			document.body.classList.remove("overflow-hidden");
			document.body.style.top = "";
			const html = document.documentElement;
			const origScrollBehavior = html.style.scrollBehavior;
			html.style.scrollBehavior = "auto";
			window.scrollTo(0, scrollY);
			html.style.scrollBehavior = origScrollBehavior;
		};
	});

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

	function onPointerDown(e) {
		if (e.button !== 0) return;
		if (isMobilePlatform && e.pointerType !== "touch") return;

		if (e.pointerType === "touch") {
			if (isMobilePlatform) {
				if (scale === 1) return;
				e.preventDefault();
			} else {
				const now = performance.now();
				const dx = Math.abs(e.clientX - lastTapX);
				const dy = Math.abs(e.clientY - lastTapY);
				const isDoubleTap = now - lastTapTime < 300 && dx < 40 && dy < 40;
				lastTapTime = now;
				lastTapX = e.clientX;
				lastTapY = e.clientY;
				if (isDoubleTap) {
					toggleZoom(e.clientX, e.clientY);
					e.preventDefault();
					return;
				}
			}
		}

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

	function close() {
		onclose?.();
	}

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
		if (isMobilePlatform) return;
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

	function onPointerMove(e) {
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

	function onPointerUp() {
		isDragging = false;
		if (
			!reducedMotion &&
			(Math.abs(velocityX) > 0.5 || Math.abs(velocityY) > 0.5)
		) {
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
	 * @param {KeyboardEvent} e
	 */
	function onBackdropKeydown(e) {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			close();
		}
	}
</script>

<svelte:window onkeydown={onKeydown} />

<div
	class="fixed inset-0 z-50 flex cursor-pointer items-center justify-center overflow-hidden bg-black/80"
	onclick={close}
	onkeydown={onBackdropKeydown}
	onpointermove={onPointerMove}
	onpointerup={onPointerUp}
	onpointerleave={onPointerUp}
	role="button"
	tabindex="0"
>
	<button
		class="absolute top-4 right-4 z-10 cursor-pointer text-2xl leading-none font-bold text-white"
		onclick={close}>&times;</button
	>
	<Picture
		{src}
		alt=""
		class="touch-action-none select-none max-h-[90vh] max-w-[90vw] cursor-grab object-contain {isDragging
			? 'cursor-grabbing'
			: ''}"
		style="transform: scale({scale}) translate({panX}px, {panY}px); transition: {imgTransition}"
		onwheel={onWheel}
		onpointerdown={onPointerDown}
		ondblclick={onDblClick}
		onclick={(/** @type {MouseEvent} */ e) => e.stopPropagation()}
		draggable={false}
	/>
</div>
