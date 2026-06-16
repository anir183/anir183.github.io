<script>
  import { webpSrc } from "$lib";
  import { getImageDimensions } from "$lib/utils/image-dimensions.js";

  let { src, alt = "", class: className = "", loading = /** @type {"lazy" | "eager" | undefined} */ ("eager"), ...rest } = $props();

  let dims = $derived(getImageDimensions(src));

  function handleError(/** @type {Event} */ ev) {
    const img = /** @type {HTMLImageElement} */ (ev.target);
    if (img.dataset.fallback !== undefined) return;
    img.dataset.fallback = "";
    img.src = src;
  }
</script>

<img src={webpSrc(src)} {alt} {loading} class={className} onerror={handleError} width={dims?.w} height={dims?.h} {...rest} />
