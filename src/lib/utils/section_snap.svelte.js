/**
 * @param {object} [options]
 * @param {number} [options.threshold=0.3]  - Section edge within this fraction of viewport triggers snap
 * @param {number} [options.snapDelay=150]  - Debounce ms after scroll stops
 * @param {number} [options.cooldown=600]   - Cooldown ms after snap
 * @param {string} [options.selector='section[id]']  - Snap target selector
 * @returns {() => void}
 */
export function createSectionSnap(options = {}) {
	const { threshold = 0.3, snapDelay = 150, cooldown = 600, selector = "section[id], .hero" } =
		options;

	const sections = [...document.querySelectorAll(selector)];
	if (!sections.length) return () => {};

	const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	/** @type {ReturnType<typeof setTimeout> | undefined} */
	let timeout;
	let snapping = false;
	let lastSnap = 0;

	function snap() {
		if (snapping) return;
		const now = Date.now();
		if (now - lastSnap < cooldown) return;

		const vh = window.innerHeight;
		const snapThreshold = vh * threshold;

		for (const section of sections) {
			const r = section.getBoundingClientRect();

			if (r.top > 0 && r.top < snapThreshold) {
				snapping = true;
				lastSnap = now;
				section.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth", block: "start" });
				setTimeout(() => {
					snapping = false;
				}, 500);
				return;
			}

			if (r.bottom > vh - snapThreshold && r.bottom < vh + snapThreshold) {
				// Don't snap at the absolute bottom — allows scrolling past to footer
				const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1;
				if (atBottom) continue;
				snapping = true;
				lastSnap = now;
				section.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth", block: "start" });
				setTimeout(() => {
					snapping = false;
				}, 500);
				return;
			}
		}
	}

	/** @param {Event} _e */
	function onScroll(_e) {
		clearTimeout(timeout);
		timeout = setTimeout(snap, snapDelay);
	}

	window.addEventListener("scroll", onScroll, { passive: true });

	return () => {
		clearTimeout(timeout);
		window.removeEventListener("scroll", onScroll);
	};
}
