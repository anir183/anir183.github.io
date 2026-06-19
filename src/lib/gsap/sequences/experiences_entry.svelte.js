import { gsap } from "gsap";

/**
 * @param {{
 *   sectionsParent: HTMLElement,
 *   wavePaths: SVGPathElement[],
 *   nodeEls: SVGElement[],
 *   contentWraps: HTMLElement[],
 *   segmentLengths: number[],
 *   reducedMotion?: boolean,
 *   onContentComplete?: (sectionIndex: number) => void
 * }} config
 * @returns {Promise<(() => void) | undefined>}
 */
export async function experiencesEntrySequence(config) {
	const {
		sectionsParent,
		wavePaths = [],
		nodeEls = [],
		contentWraps = [],
		segmentLengths = [],
		reducedMotion = false,
		onContentComplete
	} = config ?? {};

	if (!sectionsParent || !contentWraps.length) return;

	// Create fast setters for strokeDashoffset to bypass GSAP property engine
	const setStrokeOffsets = wavePaths.map((p) => {
		if (!p) return null;
		return gsap.quickSetter(p, "strokeDashoffset");
	});

	// initial state — all paths hidden; corrected to scroll position below (prevents snap)
	for (const p of wavePaths) {
		if (p) gsap.set(p, { strokeDasharray: p.getTotalLength(), strokeDashoffset: p.getTotalLength() });
	}
	gsap.set(nodeEls, { scale: 0, opacity: 0 });
	gsap.set(contentWraps, { y: 0, opacity: 0 });

	if (reducedMotion) {
		for (const p of wavePaths) {
			if (p) gsap.set(p, { strokeDashoffset: 0 });
		}
		gsap.set(nodeEls, { scale: 1, opacity: 1 });
		gsap.set(contentWraps, { opacity: 1, y: 0 });
		return;
	}

	const { ScrollTrigger } = await import("gsap/ScrollTrigger");
	gsap.registerPlugin(ScrollTrigger);
	if (!sectionsParent || !sectionsParent.isConnected) return;

	/** @type {ScrollTrigger[]} */
	const triggers = [];

	// Path draw — per-segment progress mapping so each segment completes
	// exactly when the corresponding section reaches its trigger point
	if (wavePaths.length && segmentLengths.length) {
		const totalSegLen = segmentLengths.reduce((a, b) => a + b, 0);

		// cumulative segment lengths: [0, seg0, seg0+seg1, ..., total]
		/** @type {number[]} */
		const cumSegLens = [0];
		let cum = 0;
		for (const len of segmentLengths) {
			cum += len;
			cumSegLens.push(cum);
		}

		/**
		 * @param {number} value
		 */
		function applyStroke(value) {
			if (setStrokeOffsets.length === 1) {
				const s = setStrokeOffsets[0];
				if (s) s(value);
			} else {
				for (let i = 0; i < setStrokeOffsets.length; i++) {
					const setter = setStrokeOffsets[i];
					if (!setter) continue;
					const segStart = cumSegLens[i] / totalSegLen;
					const segEnd = cumSegLens[i + 1] / totalSegLen;
					const v = value ?? 0;
					let local;
					if (v <= segStart) {
						local = 0;
					} else if (v >= segEnd) {
						local = 1;
					} else {
						local = (v - segStart) / (segEnd - segStart);
					}
					setter(segmentLengths[i] * (1 - local));
				}
			}
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

		/** @param {number} sp */
		function computeDrawProgress(sp) {
			if (sp <= nodeTriggerProgress[0]) return 0;
			if (sp >= nodeTriggerProgress[nodeTriggerProgress.length - 1]) return 1;
			for (let i = 0; i < nodeTriggerProgress.length - 1; i++) {
				if (sp >= nodeTriggerProgress[i] && sp < nodeTriggerProgress[i + 1]) {
					if (i < numSegments) {
						const local = (sp - nodeTriggerProgress[i]) /
							(nodeTriggerProgress[i + 1] - nodeTriggerProgress[i]);
						const drawStart = cumSegLens[i] / totalSegLen;
						const drawEnd = cumSegLens[i + 1] / totalSegLen;
						return drawStart + local * (drawEnd - drawStart);
					}
					return 1;
				}
			}
			return 0;
		}

		const st = ScrollTrigger.create({
			trigger: outerDiv,
			start: "top top",
			end: "bottom bottom",
			scrub: 1,
			onUpdate: () => {
				const sp = Math.max(0, Math.min(1, (window.scrollY - outerPageY) / (endScrollY - outerPageY)));
				const dp = computeDrawProgress(sp);
				if (setStrokeOffsets.length === 1) {
					const s = setStrokeOffsets[0];
					if (s) s(totalSegLen * (1 - dp));
				} else {
					applyStroke(dp);
				}
			}
		});
		triggers.push(st);

		// Initial stroke position from current scroll (prevents snap on first scroll)
		const initialSp = Math.max(0, Math.min(1, (window.scrollY - outerPageY) / (endScrollY - outerPageY)));
		const initialDp = computeDrawProgress(initialSp);
		if (setStrokeOffsets.length === 1) {
			const s = setStrokeOffsets[0];
			if (s) s(totalSegLen * (1 - initialDp));
		} else {
			applyStroke(initialDp);
		}
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
		const company = wrap.querySelector('[data-el="company"]');
		const desc = wrap.querySelector('[data-el="desc"]');
		const tags = wrap.querySelector('[data-el="tags"]');

		const contentTl = gsap.timeline({
				defaults: { ease: "power2.out", duration: 1 },
				onComplete: () => onContentComplete?.(i)
			});
		contentTl.set(wrap, { opacity: 1 }, 0);
		if (company) contentTl.fromTo(company, { y: 24, opacity: 0 }, { y: 0, opacity: 1 }, 0.2);
		if (desc) contentTl.fromTo(desc, { y: 20, opacity: 0 }, { y: 0, opacity: 1 }, 0.3);
		if (tags) contentTl.fromTo(tags, { y: 16, opacity: 0 }, { y: 0, opacity: 1 }, 0.35);

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
