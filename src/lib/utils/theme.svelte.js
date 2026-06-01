import { assert } from "$lib";

/** @typedef {"dark" | "light"} ThemeMode */

/** @type {{ DARK: ThemeMode, LIGHT: ThemeMode }} */
export const themes = {
	DARK: "dark",
	LIGHT: "light"
};

/** @type {{ current: ThemeMode }} */
export const theme = $state({
	current: themes.DARK
});

/** @param {ThemeMode} mode */
export function applyTheme(mode) {
	assert(
		mode === themes.DARK || mode === themes.LIGHT,
		`tried to apply invalid theme "${mode}"`
	);

	if (typeof document === "undefined") return;
	const root = document.documentElement;
	root.classList.remove(themes.DARK);

	if (mode === themes.DARK) {
		root.classList.add(themes.DARK);
	}
	theme.current = mode;
}

export function toggleTheme() {
	let mode = theme.current !== themes.DARK ? themes.DARK : themes.LIGHT;
	applyTheme(mode);
	if (typeof localStorage !== "undefined") {
		localStorage.setItem("theme", mode);
	}
}

export function initTheme() {
	if (typeof localStorage === "undefined" || typeof window === "undefined")
		return;
	const saved = localStorage.getItem("theme");
	const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

	if (saved === themes.LIGHT || (!saved && !prefersDark)) {
		applyTheme(themes.LIGHT);
		return;
	}

	if (saved === themes.DARK || (!saved && prefersDark)) {
		applyTheme(themes.DARK);
		return;
	}

	applyTheme(themes.DARK);
}
