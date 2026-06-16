import { readFile, mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { join, extname, relative, dirname } from "node:path";
import sharp from "sharp";

const EXTENSIONS = new Set([".png", ".jpg", ".jpeg"]);
const QUALITY = 90;

const SRC_DIR = new URL("../static", import.meta.url).pathname;
const DIMS_OUT = new URL("../src/lib/generated/image-dimensions.json", import.meta.url).pathname;

async function walk(dir) {
  const entries = [];
  for (const name of await readdir(dir)) {
    const path = join(dir, name);
    const s = await stat(path);
    if (s.isDirectory()) {
      entries.push(...await walk(path));
    } else if (EXTENSIONS.has(extname(name).toLowerCase())) {
      entries.push(path);
    }
  }
  return entries;
}

async function main() {
  const files = await walk(SRC_DIR);
  let converted = 0;
  let errors = 0;

  /** @type {Record<string, { w: number, h: number }>} */
  const dimensions = {};

  for (const file of files) {
    const rel = relative(SRC_DIR, file);
    if (!rel.startsWith("assets")) continue;

    const outPath = file
      .replace(/\.(png|jpg|jpeg)$/i, ".webp")
      .replace(/\/([^/]+)$/, "/webp/$1");
    const outDir = dirname(outPath);

    try {
      await mkdir(outDir, { recursive: true });
      const img = sharp(await readFile(file));
      const meta = await img.metadata();
      await img
        .webp({ quality: QUALITY, alphaQuality: QUALITY })
        .toFile(outPath);
      const inSize = meta.size ?? 0;
      const outStat = await stat(outPath);
      const pct = inSize > 0 ? ((1 - outStat.size / inSize) * 100).toFixed(1) : 0;
      console.log(`${rel}  ${(inSize / 1024).toFixed(0)}K → ${(outStat.size / 1024).toFixed(0)}K  (${pct}% smaller)`);
      converted++;

      if (meta.width && meta.height) {
        dimensions["/" + rel] = { w: meta.width, h: meta.height };
      }
    } catch (err) {
      console.error(`FAILED: ${rel} — ${err.message}`);
      errors++;
    }
  }

  await mkdir(dirname(DIMS_OUT), { recursive: true });
  await writeFile(DIMS_OUT, JSON.stringify(dimensions, null, 2));
  console.log(`\nDone: ${converted} converted, ${errors} errors`);
  console.log(`Dimensions manifest written to src/lib/generated/image-dimensions.json (${Object.keys(dimensions).length} entries)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
