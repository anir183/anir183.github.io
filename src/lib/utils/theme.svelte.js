/** @typedef {"dark" | "light"} ThemeMode */

import { assert } from "$lib/utils/assert.svelte";

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

	const root = document.documentElement;
	root.classList.remove(themes.LIGHT, themes.DARK);
	root.classList.add(mode);

	theme.current = mode;
	localStorage.setItem("theme", mode);
}

export function toggleTheme() {
	applyTheme(theme.current !== themes.DARK ? themes.DARK : themes.LIGHT);
}

export function initTheme() {
	const saved = localStorage.getItem("theme");

	const prefersLight = window.matchMedia(
		"(prefers-color-scheme: light)"
	).matches;
	const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

	if (saved === themes.LIGHT || prefersLight) {
		applyTheme(themes.LIGHT);
		return;
	}

	if (saved === themes.DARK || prefersDark) {
		applyTheme(themes.DARK);
		return;
	}

	applyTheme(themes.DARK);
}
