import { gsap } from "gsap";

/**
 * @param {{
 *   sectionsParent: HTMLElement,
 *   wavePath: SVGPathElement | null | undefined,
 *   nodeEls: SVGElement[],
 *   contentWraps: HTMLElement[],
 *   segmentLengths: number[],
 *   reducedMotion?: boolean
 * }} config
 * @returns {Promise<(() => void) | undefined>}
 */
export async function experiencesEntrySequence(config) {
	const {
		sectionsParent,
		wavePath,
		nodeEls = [],
		contentWraps = [],
		segmentLengths = [],
		reducedMotion = false
	} = config ?? {};

	if (!sectionsParent || !contentWraps.length) return;

	const pathLength = wavePath ? wavePath.getTotalLength() : 0;

	// initial state — path starts at 0% drawn
	if (wavePath) gsap.set(wavePath, { strokeDasharray: pathLength, strokeDashoffset: pathLength });
	gsap.set(nodeEls, { scale: 0, opacity: 0 });
	gsap.set(contentWraps, { y: 0, opacity: 0 });

	if (reducedMotion) {
		if (wavePath) gsap.set(wavePath, { strokeDashoffset: 0 });
		gsap.set(nodeEls, { scale: 1, opacity: 1 });
		gsap.set(contentWraps, { opacity: 1, y: 0 });
		return;
	}

	const { ScrollTrigger } = await import("gsap/ScrollTrigger");
	gsap.registerPlugin(ScrollTrigger);

	/** @type {ScrollTrigger[]} */
	const triggers = [];

	// Path draw — per-segment progress mapping so each segment completes
	// exactly when the corresponding section reaches its trigger point
	if (wavePath && pathLength && segmentLengths.length) {
		const totalSegLen = segmentLengths.reduce((a, b) => a + b, 0);

		// cumulative segment lengths: [0, seg0, seg0+seg1, ..., total]
		/** @type {number[]} */
		const cumSegLens = [0];
		let cum = 0;
		for (const len of segmentLengths) {
			cum += len;
			cumSegLens.push(cum);
		}

		// Compute scroll-trigger progress for each section's content entrance ("top 20%")
		const outerDiv = /** @type {HTMLElement} */ (sectionsParent.parentElement);
		const vh = window.innerHeight;
		const outerRect = outerDiv.getBoundingClientRect();
		const outerPageY = outerRect.top + window.scrollY;
		const endScrollY = outerPageY + outerDiv.offsetHeight - vh;

		/** @type {number[]} */
		const nodeTriggerProgress = [0];
		for (let i = 0; i < contentWraps.length; i++) {
			const section = contentWraps[i].closest("section");
			if (section) {
				const sectionRect = section.getBoundingClientRect();
				const sectionPageY = sectionRect.top + window.scrollY;
				const triggerScrollY = sectionPageY;
				nodeTriggerProgress.push(
					Math.max(0, Math.min(1, (triggerScrollY - outerPageY) / (endScrollY - outerPageY)))
				);
			}
		}
		// ensure last interval maps past all segments
		nodeTriggerProgress.push(1);

		const numSegments = segmentLengths.length;

		const st = ScrollTrigger.create({
			trigger: outerDiv,
			start: "top top",
			end: "bottom bottom",
			scrub: 1,
			onUpdate: () => {
				const sp = st.progress;
				let drawProgress;
				if (sp <= nodeTriggerProgress[0]) {
					drawProgress = 0;
				} else if (sp >= nodeTriggerProgress[nodeTriggerProgress.length - 1]) {
					drawProgress = 1;
				} else {
					for (let i = 0; i < nodeTriggerProgress.length - 1; i++) {
						if (sp >= nodeTriggerProgress[i] && sp < nodeTriggerProgress[i + 1]) {
							if (i < numSegments) {
								const local = (sp - nodeTriggerProgress[i]) /
									(nodeTriggerProgress[i + 1] - nodeTriggerProgress[i]);
								const drawStart = cumSegLens[i] / totalSegLen;
								const drawEnd = cumSegLens[i + 1] / totalSegLen;
								drawProgress = drawStart + local * (drawEnd - drawStart);
							} else {
								drawProgress = 1;
							}
							break;
						}
					}
				}
				gsap.set(wavePath, { strokeDashoffset: totalSegLen * (1 - (drawProgress ?? 0)) });
			}
		});
		triggers.push(st);
	}

	// per-section: node activation + staggered content entrance
	for (let i = 0; i < contentWraps.length; i++) {
		const section = contentWraps[i].closest("section");
		if (!section) continue;

		// node activation — activate once when section enters viewport
		const nodeSt = ScrollTrigger.create({
			trigger: section,
			start: "top 20%",
			once: true,
			onEnter: () => {
				if (!nodeEls[i + 1]) return;
				gsap.to(nodeEls[i + 1], { scale: 1, opacity: 1, duration: 1.2, ease: "power2.out" });
			}
		});
		triggers.push(nodeSt);

		// staggered content entrance — heading first, then company, desc, tags
		const wrap = contentWraps[i];
		const heading = wrap.querySelector("h3");
		const company = wrap.querySelector('[data-el="company"]');
		const desc = wrap.querySelector('[data-el="desc"]');
		const tags = wrap.querySelector('[data-el="tags"]');

		const contentTl = gsap.timeline({ defaults: { ease: "power2.out", duration: 1 } });
		contentTl.set(wrap, { opacity: 1 }, 0);
		if (heading) contentTl.fromTo(heading, { y: 50, opacity: 0 }, { y: 0, opacity: 1 }, 0);
		if (company) contentTl.fromTo(company, { y: 30, opacity: 0 }, { y: 0, opacity: 1 }, 0.2);
		if (desc) contentTl.fromTo(desc, { y: 25, opacity: 0 }, { y: 0, opacity: 1 }, 0.3);
		if (tags) contentTl.fromTo(tags, { y: 20, opacity: 0 }, { y: 0, opacity: 1 }, 0.35);

		const contentSt = ScrollTrigger.create({
			trigger: section,
			start: "top 20%",
			once: true,
			animation: contentTl
		});
		triggers.push(contentSt);
	}

	ScrollTrigger.refresh();

	return () => {
		triggers.forEach((st) => st.kill());
	};
}
