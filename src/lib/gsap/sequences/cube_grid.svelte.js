import { gsap } from "gsap";

/**
 * Stagger-rotate all cube tiles 180° around Y axis from center outward.
 * @param {HTMLElement[]} tiles
 * @param {number} cols
 * @param {number} rows
 * @param {() => void} [onComplete]
 * @param {boolean} [reducedMotion]
 * @returns {gsap.core.Tween}
 */
export function staggerRotateTiles(tiles, cols, rows, onComplete, reducedMotion = false) {
	if (reducedMotion) {
		return gsap.to(tiles, { rotationY: "+=180", duration: 0, onComplete });
	}
	return gsap.to(tiles, {
		rotationY: "+=180",
		duration: 0.9,
		ease: "power4.inOut",
		stagger: {
			grid: [cols, rows],
			from: "random",
			amount: 0.5
		},
		onComplete
	});
}
