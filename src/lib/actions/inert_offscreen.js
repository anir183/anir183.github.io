/**
 * @param {HTMLElement} element
 * @returns {{ destroy: () => void }}
 */
export function inertOffscreen(element) {
	let isInert = false;

	const observer = new IntersectionObserver(
		([entry]) => {
			isInert = !entry.isIntersecting;
			element.inert = isInert;
		},
		{ threshold: 0 }
	);
	observer.observe(element);

	function onScroll() {
		if (isInert) {
			const rect = element.getBoundingClientRect();
			const vh = window.innerHeight;
			if (rect.top < vh && rect.bottom > 0) {
				element.inert = false;
				isInert = false;
			}
		}
	}
	window.addEventListener("scroll", onScroll, { passive: true });

	requestAnimationFrame(() => {
		if (isInert) {
			const rect = element.getBoundingClientRect();
			const vh = window.innerHeight;
			if (rect.top < vh && rect.bottom > 0) {
				element.inert = false;
				isInert = false;
			}
		}
	});

	return {
		destroy() {
			observer.disconnect();
			window.removeEventListener("scroll", onScroll);
		}
	};
}
