const WEBP_RE = /\.(png|jpg|jpeg)$/i;

/**
 * Maps an asset URL to its WebP equivalent.
 * `/assets/foo/bar.png` → `/assets/foo/webp/bar.webp`
 * Non-convertible URLs (e.g. SVGs) are returned unchanged.
 * @param {string} src
 * @returns {string}
 */
export function webpSrc(src) {
  if (!WEBP_RE.test(src)) return src;
  return src.replace(WEBP_RE, ".webp").replace(/\/([^/]+)$/, "/webp/$1");
}
