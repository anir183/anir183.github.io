import { gsap } from "gsap";

/**
 * Creates a smooth parallax effect on layered elements within a container.
 * Uses gsap.quickTo for jank-free interpolation — no rAF loop, no manual lerp.
 * Pointer listener is scoped to the container element only.
 *
 * @param {object} config
 * @param {HTMLElement} config.container - Element to listen for pointer events on
 * @param {Array<{el: HTMLElement, strength: number}>} config.layers - Layer elements with movement strength in px
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

	const pairs = layers.map((l) => ({
		toX: gsap.quickTo(l.el, "x", { duration, ease: "power3.out" }),
		toY: gsap.quickTo(l.el, "y", { duration, ease: "power3.out" }),
		strength: l.strength
	}));

	/**
	 * @param {PointerEvent} e
	 */
	function onPointerMove(e) {
		const rect = container.getBoundingClientRect();
		const cx = rect.width / 2;
		const cy = rect.height / 2;
		const nx = (e.clientX - rect.left - cx) / cx;
		const ny = (e.clientY - rect.top - cy) / cy;

		for (const p of pairs) {
			p.toX(nx * p.strength);
			p.toY(ny * p.strength);
		}
	}

	function onPointerLeave() {
		for (const p of pairs) {
			p.toX(0);
			p.toY(0);
		}
	}

	container.addEventListener("pointermove", onPointerMove, { passive: true });
	container.addEventListener("pointerleave", onPointerLeave, { passive: true });

	return () => {
		container.removeEventListener("pointermove", onPointerMove);
		container.removeEventListener("pointerleave", onPointerLeave);
		for (const p of pairs) {
			p.toX(0);
			p.toY(0);
		}
	};
}
