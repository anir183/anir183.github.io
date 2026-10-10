import { spawnSync } from "node:child_process";
import {
	mkdtemp,
	readFile,
	writeFile,
	copyFile,
	rm,
	stat
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const TEX_PATH = fileURLToPath(
	new URL("../static/assets/resume.tex", import.meta.url)
);
const PDF_PATH = fileURLToPath(
	new URL("../static/assets/resume.pdf", import.meta.url)
);

/**
 * Tectonic 0.17.x runs XeTeX, which chokes on these pdfTeX-only lines.
 * They must be commented out in a throwaway copy — never edit resume.tex.
 */
const XETEX_ONLY = [
	{ match: /^\\input\{glyphtounicode\}/m, name: "\\input{glyphtounicode}" },
	{ match: /^\\pdfgentounicode=1/m, name: "\\pdfgentounicode=1" }
];

async function main() {
	for (const { name } of XETEX_ONLY) {
		if (!(await readFile(TEX_PATH, "utf8")).includes(name)) {
			throw new Error(
				`resume.tex no longer contains ${name} — update scripts/compile-resume.js`
			);
		}
	}

	const workDir = await mkdtemp(join(tmpdir(), "resume-"));
	const texCopy = join(workDir, "resume.tex");

	try {
		const source = await readFile(TEX_PATH, "utf8");
		let patched = source;
		for (const { match } of XETEX_ONLY) {
			patched = patched.replace(match, "% $&");
		}
		for (const { name } of XETEX_ONLY) {
			if (!patched.includes(`% ${name}`)) {
				throw new Error(`failed to comment ${name} in the temp copy`);
			}
		}
		await writeFile(texCopy, patched);

		console.log(`Compiling resume with tectonic (XeTeX)…`);
		const res = spawnSync("tectonic", ["--outdir", workDir, "resume.tex"], {
			cwd: workDir,
			encoding: "utf8"
		});

		if (res.error) {
			throw new Error(
				`Could not run "tectonic" — is it installed? (e.g. cargo install tectonic, or the prebuilt binary from github.com/tectonic-type/tectonic)\n${res.error.message}`
			);
		}
		if (res.status !== 0) {
			throw new Error(
				`tectonic failed (exit ${res.status}):\n${(res.stdout ?? "") + (res.stderr ?? "")}`
			);
		}

		const out = join(workDir, "resume.pdf");
		if (!existsSync(out)) {
			throw new Error(
				"tectonic finished but no resume.pdf was produced, expected file: " +
					out
			);
		}
		await copyFile(out, PDF_PATH);
		const size = (await stat(PDF_PATH)).size;
		console.log(
			`Resume written to static/assets/resume.pdf (${(size / 1024).toFixed(1)} KiB)`
		);
	} finally {
		await rm(workDir, { recursive: true, force: true });
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
