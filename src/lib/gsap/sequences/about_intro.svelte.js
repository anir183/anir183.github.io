import { gsap } from "gsap";

/**
 * @param {{
 *   sceneContainer?: HTMLElement | null | undefined,
 *   headline?: HTMLElement | null | undefined,
 *   subtitle?: HTMLElement | null | undefined,
 *   ctaGroup?: HTMLElement | null | undefined,
 *   reducedMotion?: boolean
 * }} config
 * @returns {gsap.core.Timeline | null}
 */
export function aboutEntrySequence(config) {
	const {
		sceneContainer,
		headline,
		subtitle,
		ctaGroup,
		reducedMotion = false
	} = config ?? {};

	if (!sceneContainer && !headline) return null;

	const dur = reducedMotion ? 0 : undefined;

	const tl = gsap.timeline();

	if (sceneContainer) {
		gsap.set(sceneContainer, { scale: 0.93, opacity: 0 });
		tl.to(sceneContainer, {
			scale: 1,
			opacity: 1,
			duration: dur ?? 0.8,
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

	if (subtitle) {
		gsap.set(subtitle, { y: 24, opacity: 0 });
		tl.to(
			subtitle,
			{
				y: 0,
				opacity: 1,
				duration: dur ?? 0.6,
				ease: "power3.out"
			},
			"-=0.35"
		);
	}

	if (ctaGroup) {
		gsap.set(ctaGroup, { y: 16, opacity: 0 });
		tl.to(
			ctaGroup,
			{
				y: 0,
				opacity: 1,
				duration: dur ?? 0.5,
				ease: "power3.out"
			},
			"-=0.25"
		);
	}

	return tl;
}
