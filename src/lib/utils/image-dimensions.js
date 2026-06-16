/** @type {Record<string, { w: number, h: number }> | null} */
let _dims = null;

function load() {
  if (_dims) return _dims;
  try {
    _dims = JSON.parse(/* @vite-ignore */ require("fs").readFileSync("./src/lib/generated/image-dimensions.json", "utf-8"));
  } catch {
    _dims = {};
  }
  return _dims;
}

/**
 * @param {string} src
 * @returns {{ w: number, h: number } | null}
 */
export function getImageDimensions(src) {
  const dims = load();
  if (!dims) return null;
  return dims[src] ?? null;
}
