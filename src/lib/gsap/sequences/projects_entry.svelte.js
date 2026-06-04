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

	/** @type {HTMLElement[]} */
	let tiles = [];
	if (gridContainer) {
		tiles = /** @type {HTMLElement[]} */ ([...gridContainer.querySelectorAll("[data-tile-index]")]);
		gsap.set(tiles, { rotationY: 180 });
	}

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
				ease: "power4.out"
			},
			"-=0.15"
		);
	}

	if (tiles.length) {
		tl.to(
			tiles,
			{
				rotationY: 0,
				duration: dur ?? 2,
				ease: "power4.out",
				stagger: reducedMotion ? 0 : { amount: 0.5, from: "random" }
			},
			"-=0.2"
		);
	}

	ScrollTrigger.create({
		trigger: sectionEl,
		start: "top 20%",
		once: true,
		animation: tl
	});
}
