import { gsap } from "gsap";

/**
 * @param {object} opts
 * @param {HTMLElement | HTMLElement[]} opts.targets
 * @param {"bottom" | "top" | "left" | "right"} [opts.from="bottom"]
 * @param {number} [opts.stagger=0.08]
 * @param {number} [opts.duration=0.6]
 * @param {string} [opts.ease="power3.out"]
 * @param {number} [opts.delay=0]
 * @param {boolean} [opts.reducedMotion=false]
 * @returns {gsap.core.Tween}
 */
export function staggerWipeIn({
	targets,
	from = "bottom",
	stagger = 0.08,
	duration = 0.6,
	ease = "power3.out",
	delay = 0,
	reducedMotion = false
}) {
	const els = Array.isArray(targets) ? targets : [targets];

	if (reducedMotion) {
		gsap.set(els, { y: "0%", x: "0%", opacity: 1 });
		const tl = gsap.timeline();
		return /** @type {gsap.core.Tween} */ (/** @type {unknown} */ (tl));
	}

	/** @type {Record<string, string | number>} */
	const fromProps = { opacity: 0 };
	if (from === "bottom") fromProps.y = "100%";
	else if (from === "top") fromProps.y = "-100%";
	else if (from === "left") fromProps.x = "-100%";
	else if (from === "right") fromProps.x = "100%";

	return gsap.fromTo(els, fromProps, {
		y: "0%",
		x: "0%",
		opacity: 1,
		duration,
		stagger,
		ease,
		delay
	});
}
