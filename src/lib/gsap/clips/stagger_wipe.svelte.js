import { gsap } from "gsap";

/**
 * @param {object} opts
 * @param {HTMLElement | HTMLElement[]} opts.targets
 * @param {"bottom" | "top" | "left" | "right"} [opts.from="bottom"]
 * @param {number} [opts.stagger=0.08]
 * @param {number} [opts.duration=0.6]
 * @param {string} [opts.ease="power3.out"]
 * @param {number} [opts.delay=0]
 * @returns {gsap.core.Tween}
 */
export function staggerWipeIn({
	targets,
	from = "bottom",
	stagger = 0.08,
	duration = 0.6,
	ease = "power3.out",
	delay = 0
}) {
	const els = Array.isArray(targets) ? targets : [targets];

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
