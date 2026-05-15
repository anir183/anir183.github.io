export const theme = $state({
	current: "dark"
});

/**
 * @param {"dark" | "light"} mode
 */
export function applyTheme(mode) {
	theme.current = mode;
	document.documentElement.classList.toggle("light", mode === "light");
	localStorage.setItem("theme", mode);
}

export function toggleTheme() {
	applyTheme(theme.current === "dark" ? "light" : "dark");
}

export function initTheme() {
	const saved = localStorage.getItem("theme");
	const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";

	if (saved === "dark" || saved === "light") {
		applyTheme(saved);
	} else {
		applyTheme(preferred);
	}
}
