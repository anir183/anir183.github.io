<script>
  import { webpSrc } from "$lib";

  let { src, alt = "", class: className = "", ...rest } = $props();

  function handleError(/** @type {Event} */ ev) {
    const img = /** @type {HTMLImageElement} */ (ev.target);
    if (img.dataset.fallback !== undefined) return;
    img.dataset.fallback = "";
    img.src = src;
  }
</script>

<img src={webpSrc(src)} {alt} class={className} onerror={handleError} {...rest} />
