import { gsap } from "gsap";

/**
 * @param {{
 *   title: HTMLElement,
 *   subtitle: HTMLElement,
 *   timeline?: gsap.core.Timeline
 * }} elements
 */
export function fadeUpTitleSubtitle({ title, subtitle, timeline }) {
	const tl = timeline || gsap.timeline();

	tl
	.from(title, {
		y: 80,
		opacity: 0,
		duration: 1,
		ease: "power3.out"
	})
	.from(
		subtitle,
		{
			y: 30,
			opacity: 0,
			duration: 0.8,
			ease: "power2.out"
		},
		"-=0.5"
	);

	return tl;
}
