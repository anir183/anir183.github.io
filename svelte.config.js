import adapter from "@sveltejs/adapter-static";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// force runes mode for the project, except for libraries. can be removed in svelte 6.
		runes: ({ filename }) =>
			filename.split(/[/\\]/).includes("node_modules") ? undefined : true
	},
	// https://svelte.dev/docs/kit/adapter-static#Usage
	kit: {
		adapter: adapter({
			// default options are shown. On some platforms
			// these options are set automatically — see below
			pages: "build",
			assets: "build",
			fallback: "404.html", // modified from https://svelte.dev/docs/kit/adapter-static#GitHub-Pages
			precompress: false,
			strict: true
		}),
		// https://svelte.dev/docs/kit/adapter-static#GitHub-Pages
		paths: {
			base: process.argv.includes("dev") ? "" : process.env.BASE_PATH
		}
	}
};

export default config;
