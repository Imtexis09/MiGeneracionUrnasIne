<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { seg } from '../../utils/animacion.js';

  export let duracion = 8;
  export let clave = 0;
  export let listo = true;

  const dispatch = createEventDispatcher();

  let t = 0;
  let reducido = false;
  let raf = 0;
  let ultimo = 0;
  let mq;

  $: {
    clave;
    t = reducido ? duracion * 0.8 : 0;
    ultimo = 0;
  }

  $: opacidad = listo ? 1 : 0;

  function frame(ahora) {
    if (!ultimo) ultimo = ahora;
    const dt = Math.min((ahora - ultimo) / 1000, 0.1);
    ultimo = ahora;
    if (listo) {
      const siguiente = t + dt;
      if (siguiente >= duracion) {
        t = 0;
        dispatch('vuelta');
      } else {
        t = siguiente;
      }
    }
    raf = requestAnimationFrame(frame);
  }

  function iniciar() {
    detener();
    ultimo = 0;
    raf = requestAnimationFrame(frame);
  }

  function detener() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function alCambiarPreferencia(e) {
    reducido = e.matches;
    if (reducido) detener();
    else iniciar();
  }

  onMount(() => {
    mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducido = mq.matches;
    mq.addEventListener?.('change', alCambiarPreferencia);
    if (!reducido) iniciar();
  });

  onDestroy(() => {
    detener();
    mq?.removeEventListener?.('change', alCambiarPreferencia);
  });
</script>

<div class="demo-stage">
  <div class="demo-contenido" aria-hidden="true" style="opacity: {opacidad}">
    <slot {t} {reducido} />
  </div>

  {#if !reducido}
    <div class="demo-progreso" aria-hidden="true">
      <span style="transform: scaleX({t / duracion})"></span>
    </div>
  {/if}

</div>

<style>
  .demo-stage {
    position: relative;
    aspect-ratio: 5 / 4;
    overflow: hidden;
    background: var(--bg-card);
    border: 1.5px solid var(--rule-strong);
    border-radius: var(--radius-md);
    user-select: none;
  }

  .demo-contenido {
    position: absolute;
    inset: 0;
  }

  .demo-progreso {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 3px;
    background: color-mix(in srgb, var(--rule-strong) 45%, transparent);
    z-index: 3;
  }

  .demo-progreso span {
    display: block;
    height: 100%;
    background: var(--accent-pink);
    transform-origin: left center;
  }

  @media (max-width: 480px) {
    .demo-stage {
      aspect-ratio: 4 / 5;
    }
  }
</style>
