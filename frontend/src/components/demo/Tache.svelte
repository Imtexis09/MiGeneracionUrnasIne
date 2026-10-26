<script>
  /**
   * Tache dibujado a mano: dos trazos que se revelan uno tras otro.
   * El padre debe ser `position: relative` y fijar `color`.
   * p: 0 (nada) → 1 (completo)
   */
  export let p = 0;

  $: p1 = Math.min(1, p * 2);
  $: p2 = Math.max(0, Math.min(1, p * 2 - 1));
</script>

{#if p > 0}
  <span class="tache" aria-hidden="true">
    <span class="trazo t1" style="clip-path: inset(0 {(1 - p1) * 100}% 0 0)"></span>
    <span class="trazo t2" style="clip-path: inset(0 0 0 {(1 - p2) * 100}%)"></span>
  </span>
{/if}

<style>
  .tache {
    position: absolute;
    inset: 8%;
    pointer-events: none;
  }

  .trazo {
    position: absolute;
    inset: 0;
    background: currentColor;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    -webkit-mask-position: center;
    mask-position: center;
    -webkit-mask-size: contain;
    mask-size: contain;
  }

  .t1 {
    -webkit-mask-image: var(--tache-1);
    mask-image: var(--tache-1);
  }

  .t2 {
    -webkit-mask-image: var(--tache-2);
    mask-image: var(--tache-2);
  }
</style>
