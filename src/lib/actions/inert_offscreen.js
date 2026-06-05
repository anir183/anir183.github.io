/**
 * @param {HTMLElement} element
 * @returns {{ destroy: () => void }}
 */
export function inertOffscreen(element) {
	const observer = new IntersectionObserver(
		([entry]) => {
			element.inert = !entry.isIntersecting;
		},
		{ threshold: 0 }
	);
	observer.observe(element);
	return {
		destroy() {
			observer.disconnect();
		}
	};
}
