import { gsap } from "gsap";

/**
 * @param {{
 *   sectionEl: HTMLElement,
 *   wavePath: SVGPathElement | null | undefined,
 *   nodeEls: SVGElement[],
 *   connectorEls?: HTMLElement[],
 *   cardEls: HTMLElement[],
 *   reducedMotion?: boolean
 * }} config
 */
export async function experiencesEntrySequence(config) {
	const {
		sectionEl,
		wavePath,
		nodeEls = [],
		connectorEls = [],
		cardEls = [],
		reducedMotion = false
	} = config ?? {};

	if (!sectionEl) return;

	const pathLength = wavePath ? wavePath.getTotalLength() : 0;

	if (wavePath) gsap.set(wavePath, { strokeDasharray: pathLength, strokeDashoffset: pathLength });
	gsap.set(nodeEls, { opacity: 0, scale: 0 });
	if (connectorEls.length) gsap.set(connectorEls, { scaleX: 0, transformOrigin: "left center" });
	gsap.set(cardEls, { opacity: 0, y: 30, scale: 0.92 });

	if (reducedMotion) {
		if (wavePath) gsap.set(wavePath, { strokeDashoffset: 0 });
		gsap.set(nodeEls, { opacity: 1, scale: 1 });
		if (connectorEls.length) gsap.set(connectorEls, { scaleX: 1 });
		gsap.set(cardEls, { opacity: 1, y: 0, scale: 1 });
		return;
	}

	const { ScrollTrigger } = await import("gsap/ScrollTrigger");
	gsap.registerPlugin(ScrollTrigger);

	ScrollTrigger.create({
		trigger: sectionEl,
		start: "top 10%",
		end: "bottom 60%",
		scrub: 1,
		animation: wavePath ? gsap.to(wavePath, { strokeDashoffset: 0, ease: "none" }) : gsap.timeline()
	});

	for (let i = 0; i < cardEls.length; i++) {
		const tl = gsap.timeline();

		tl.to(nodeEls[i], { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }, 0);
		if (connectorEls[i]) tl.to(connectorEls[i], { scaleX: 1, duration: 0.35, ease: "power2.out" }, "-=0.05");
		tl.to(cardEls[i], { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power3.out" }, "-=0.15");

		ScrollTrigger.create({
			trigger: cardEls[i],
			start: "top 85%",
			once: true,
			animation: tl
		});
	}
}
