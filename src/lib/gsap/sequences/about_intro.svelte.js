import { gsap } from "gsap";

/**
 * @param {{
 *   layers?: HTMLElement[],
 *   headline?: HTMLElement | null | undefined,
 *   subtitle?: HTMLElement | null | undefined,
 *   ctaGroup?: HTMLElement | null | undefined,
 *   reducedMotion?: boolean
 * }} config
 * @returns {gsap.core.Timeline | null}
 */
export function aboutEntrySequence(config) {
	const {
		layers = [],
		headline,
		subtitle,
		ctaGroup,
		reducedMotion = false
	} = config ?? {};

	if (!subtitle && !ctaGroup && !layers.length && !headline) return null;

	const dur = reducedMotion ? 0 : undefined;

	const tl = gsap.timeline();

	if (subtitle) {
		gsap.set(subtitle, { y: 19, opacity: 0 });
		tl.to(subtitle, {
			y: 0,
			opacity: 1,
			duration: dur ?? 0.6,
			ease: "power3.out"
		});
	}

	if (headline) {
		gsap.set(headline, { y: 40, opacity: 0 });
		tl.to(
			headline,
			{
				y: 0,
				opacity: 1,
				duration: dur ?? 0.7,
				ease: "power3.out"
			},
			"-=0.4"
		);
	}

	if (ctaGroup) {
		gsap.set(ctaGroup, { y: 13, opacity: 0 });
		tl.to(
			ctaGroup,
			{
				y: 0,
				opacity: 1,
				duration: dur ?? 0.5,
				ease: "power3.out"
			},
			"-=0.15"
		);
	}

	if (layers.length) {
		gsap.set(layers, { "--entry-scale": 0.93, opacity: 0 });
		tl.to(
			layers,
			{
				"--entry-scale": 1,
				opacity: 1,
				duration: dur ?? 1.5,
				stagger: reducedMotion ? 0 : 0.5,
				ease: "power2.out"
			},
			"-=0.2"
		);
	}

	return tl;
}
