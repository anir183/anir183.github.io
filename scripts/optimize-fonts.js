import { readFile, writeFile, readdir, stat, mkdir } from "node:fs/promises";
import { join, extname, relative, dirname } from "node:path";
import ttf2woff2 from "ttf2woff2";

const FONTS_DIR = new URL("../static/fonts", import.meta.url).pathname;

/** Font families declared in layout.css — skip italic variants not in any @font-face */
const DECLARED = new Set([
  "BebasNeue-Regular.ttf",
  "JetBrainsMono-VariableFont_wght.ttf",
  "UbuntuSans-VariableFont_wdth,wght.ttf",
  "Unbounded-VariableFont_wght.ttf"
]);

async function walk(dir) {
  const entries = [];
  for (const name of await readdir(dir)) {
    const path = join(dir, name);
    const s = await stat(path);
    if (s.isDirectory()) {
      entries.push(...await walk(path));
    } else if (extname(name).toLowerCase() === ".ttf" && DECLARED.has(name)) {
      entries.push(path);
    }
  }
  return entries;
}

async function main() {
  const files = await walk(FONTS_DIR);
  let converted = 0;
  let errors = 0;

  for (const file of files) {
    const rel = relative(FONTS_DIR, file);
    const outPath = file.replace(/.ttf$/i, ".woff2");

    try {
      const input = await readFile(file);
      const output = ttf2woff2(input);
      await writeFile(outPath, output);
      const inSize = (await stat(file)).size;
      const outSize = (await stat(outPath)).size;
      const pct = ((1 - outSize / inSize) * 100).toFixed(1);
      console.log(`${rel}  ${(inSize / 1024).toFixed(0)}K → ${(outSize / 1024).toFixed(0)}K  (${pct}% smaller)`);
      converted++;
    } catch (err) {
      console.error(`FAILED: ${rel} — ${err.message}`);
      errors++;
    }
  }

  console.log(`\nDone: ${converted} converted, ${errors} errors`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
