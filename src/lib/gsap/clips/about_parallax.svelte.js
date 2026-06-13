import { gsap } from "gsap";

/**
 * Creates a smooth parallax effect on layered elements within a container.
 * Uses gsap.quickTo for jank-free interpolation — no rAF loop, no manual lerp.
 * Pointer listener is scoped to window so it responds even when the cursor
 * is on fixed overlays (e.g. navbar). Visibility is gated by IntersectionObserver.
 *
 * @param {object} config
 * @param {HTMLElement} config.container - Element whose center is used as the parallax origin
 * @param {Array<{el: HTMLElement, strength: number, rotStrength?: number}>} config.layers - Layer elements with movement strength in px and optional rotation strength in deg
 * @param {number} [config.duration=1.2] - GSAP tween duration for smooth interpolation
 * @param {boolean} [config.reducedMotion=false] - Skip if true
 * @returns {() => void} Cleanup function
 */
export function createParallax({
	container,
	layers,
	duration = 1.2,
	reducedMotion = false
}) {
	if (reducedMotion || !container || !layers.length) return () => {};

	let isInView = false;

	// Cache container rect to avoid forced layout reads per pointermove
	let cachedRect = container.getBoundingClientRect();
	const ro = new ResizeObserver(() => { cachedRect = container.getBoundingClientRect(); });
	ro.observe(container);
	function onScroll() { cachedRect = container.getBoundingClientRect(); }
	window.addEventListener("scroll", onScroll, { passive: true });

	const observer = new IntersectionObserver(
		([entry]) => {
			isInView = entry.isIntersecting;
			if (!isInView) {
				for (const p of pairs) {
					p.toPX(0);
					p.toPY(0);
					p.toRY(0);
					p.toRX(0);
				}
			}
		},
		{ threshold: 0 }
	);
	observer.observe(container);

	// Animate CSS custom properties so the inline transform (with perspective)
	// stays intact — avoids GSAP overwriting the transform string.
	const tweenOpts = { duration, ease: "power3.out" };

	const pairs = layers.map((l) => ({
		toPX: gsap.quickTo(l.el, "--px", tweenOpts),
		toPY: gsap.quickTo(l.el, "--py", tweenOpts),
		toRY: gsap.quickTo(l.el, "--ry", tweenOpts),
		toRX: gsap.quickTo(l.el, "--rx", tweenOpts),
		strength: l.strength,
		rotStrength: l.rotStrength ?? 0
	}));

	/**
	 * @param {PointerEvent} e
	 */
	function onPointerMove(e) {
		if (!isInView) return;
		const rect = cachedRect;
		const cx = rect.width / 2;
		const cy = rect.height / 2;
		const nx = (e.clientX - rect.left - cx) / cx;
		const ny = (e.clientY - rect.top - cy) / cy;

		for (const p of pairs) {
			p.toPX(nx * p.strength);
			p.toPY(ny * p.strength);
			p.toRY(nx * p.rotStrength);
			p.toRX(-ny * p.rotStrength);
		}
	}

	window.addEventListener("pointermove", onPointerMove, { passive: true });

	function resetLayers() {
		for (const p of pairs) {
			p.toPX(0);
			p.toPY(0);
			p.toRY(0);
			p.toRX(0);
		}
	}

	return () => {
		window.removeEventListener("pointermove", onPointerMove);
		window.removeEventListener("scroll", onScroll);
		observer.disconnect();
		ro.disconnect();
		resetLayers();
	};
}
