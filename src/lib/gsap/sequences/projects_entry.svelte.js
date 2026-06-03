import { gsap } from "gsap";

/**
 * @param {{
 *   projectItems: HTMLElement[],
 *   ctaButton: HTMLElement | null | undefined,
 *   gridContainer: HTMLElement | null | undefined,
 *   sectionEl: HTMLElement | null | undefined,
 *   reducedMotion?: boolean
 * }} config
 */
export async function projectsEntrySequence(config) {
	const {
		projectItems = [],
		ctaButton = null,
		gridContainer = null,
		sectionEl = null,
		reducedMotion = false
	} = config ?? {};

	if (!sectionEl) return;

	const { ScrollTrigger } = await import("gsap/ScrollTrigger");
	gsap.registerPlugin(ScrollTrigger);

	gsap.set(projectItems, { y: 30, x: -15, opacity: 0 });
	if (ctaButton) gsap.set(ctaButton, { y: 20, opacity: 0 });
	if (gridContainer) gsap.set(gridContainer, { scale: 0.93, opacity: 0 });

	const dur = reducedMotion ? 0 : undefined;

	const tl = gsap.timeline();

	tl.to(projectItems, {
		y: 0,
		x: 0,
		opacity: 1,
		duration: dur ?? 0.7,
		stagger: reducedMotion ? 0 : 0.1,
		ease: "power3.out"
	});

	if (ctaButton) {
		tl.to(
			ctaButton,
			{
				y: 0,
				opacity: 1,
				duration: dur ?? 0.5,
				ease: "power3.out"
			},
			"-=0.15"
		);
	}

	if (gridContainer) {
		tl.to(
			gridContainer,
			{
				scale: 1,
				opacity: 1,
				duration: dur ?? 0.8,
				ease: "power3.out"
			},
			"<"
		);
	}

	ScrollTrigger.create({
		trigger: sectionEl,
		start: "top 55%",
		once: true,
		animation: tl
	});
}
