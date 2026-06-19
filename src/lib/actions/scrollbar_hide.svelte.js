/**
 * Adds `.scrollbar-active` while the element is being scrolled,
 * removes it after 4s of inactivity.
 * @param {HTMLElement} el
 * @returns {{ destroy: () => void }}
 */
export function autoHideScrollbar(el) {
	/** @type {ReturnType<typeof setTimeout> | undefined} */
	let timer;
	function onScroll() {
		el.classList.add("scrollbar-active");
		clearTimeout(timer);
		timer = setTimeout(() => {
			el.classList.remove("scrollbar-active");
		}, 4000);
	}
	el.addEventListener("scroll", onScroll, { passive: true });
	return {
		destroy() {
			el.removeEventListener("scroll", onScroll);
			clearTimeout(timer);
		}
	};
}
