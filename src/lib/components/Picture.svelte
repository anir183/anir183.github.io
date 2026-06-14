<script>
  import { webpSrc } from "$lib";

  let { src, webp = webpSrc(src), alt = "", class: className = "", ...rest } = $props();
</script>

<picture>
  <source srcset={webp} type="image/webp" />
  <img {src} {alt} class={className} {...rest} />
</picture>
