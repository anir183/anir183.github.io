import _dims from "$lib/generated/image-dimensions.json";

/** @type {Record<string, { w: number, h: number }>} */
const dims = /** @type {any} */ (_dims);

/**
 * @param {string} src
 * @returns {{ w: number, h: number } | null}
 */
export function getImageDimensions(src) {
  return dims[src] ?? null;
}
