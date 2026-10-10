<script>
	/**
	 * External-link arrow (up-right), rendered as inline SVG so it looks
	 * identical on every OS — the "↗" text glyph it replaces was rendered
	 * from system fonts and differed per platform.
	 * Canonical artwork: static/assets/icons/arrow.svg
	 *
	 * @type {{ size?: string, class?: string }}
	 */
	let { size = "1em", class: klass = "" } = $props();
</script>

<svg
	class={"inline-block shrink-0 align-[-0.15em] leading-none " + klass}
	style={`width: ${size}; height: ${size}`}
	viewBox="0 0 16 16"
	fill="none"
	aria-hidden="true"
	focusable="false"
>
	<path
		d="M5 3.5H12.5V11"
		stroke="currentColor"
		stroke-width="1.5"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
	<path
		d="M12 4L4 12"
		stroke="currentColor"
		stroke-width="1.5"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
</svg>