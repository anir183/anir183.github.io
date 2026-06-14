const WEBP_RE = /\.(png|jpg|jpeg)$/i;

/**
 * Maps an asset URL to its WebP equivalent.
 * `/assets/...` → `/.webp/assets/...` with `.webp` extension.
 * @param {string} src
 * @returns {string}
 */
export function webpSrc(src) {
  return src.replace("/assets/", "/.webp/assets/").replace(WEBP_RE, ".webp");
}
