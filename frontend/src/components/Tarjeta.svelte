<script>
  import { onMount } from 'svelte';
  import { getLatestElection } from '../utils/calculos.js';
  import { formatCohortRange } from '../utils/formato.js';
  import { dibujarTarjeta } from '../utils/dibujarTarjeta.js';

  export let cohortData = null;
  export let entidad = '';

  let canvas;
  let ctx;

  /* Datos derivados (reactivos) */
  $: latestElection = cohortData ? getLatestElection(cohortData.elections) : null;
  $: participacionPct = latestElection ? latestElection.participacion_pct : 0;
  $: cohortRange = cohortData ? formatCohortRange(cohortData.year_of_birth_min, cohortData.year_of_birth_max) : '';
  $: anioEleccion = latestElection ? latestElection.year : '';
  $: numElecciones = cohortData ? cohortData.elections.length : 2;

  let listo = false;
  let arteImg;

  /* Clave de datos que controla la regeneración (no depende del DOM/canvas) */
  $: claveTarjeta = cohortData
    ? `${cohortData.entidad_cve || ''}-${cohortData.year_of_birth_min || ''}-${cohortData.year_of_birth_max || ''}-${entidad || ''}-${anioEleccion}-${participacionPct}`
    : '';

  let ultimaClaveGenerada = '';

  /* Regenerar cuando cambien los datos (clave de datos, no referencia del DOM) */
  $: if (canvas && claveTarjeta && claveTarjeta !== ultimaClaveGenerada) {
    ultimaClaveGenerada = claveTarjeta;
    render();
  }

  /* ---------- Render ---------- */
  function render() {
    if (!ctx || !listo) return;
    dibujarTarjeta(ctx, {
      arteImg,
      sitio: location.host,
      entidad,
      participacionPct,
      anioEleccion,
      cohortRange,
      numElecciones
    });
  }

  /* ---------- Descarga ---------- */
  function descargar() {
    if (!canvas) return;
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tarjeta-${(entidad || 'datos').toLowerCase().replace(/\s+/g, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  }

  /* ---------- Carga inicial ---------- */
  onMount(async () => {
    ctx = canvas.getContext('2d');

    /* Carga una imagen y devuelve null (con aviso en consola) si no se puede decodificar */
    const cargarImagen = async (src) => {
      const img = new Image();
      img.src = src;
      try {
        await img.decode();
        return img;
      } catch (e) {
        console.warn(`No se pudo cargar la imagen ${src}`, e);
        return null;
      }
    };

    arteImg = await cargarImagen('/images/arte-base.webp');

    try {
      await Promise.all([
        document.fonts.load('900 1em "Big Shoulders Display"'),
        document.fonts.load('700 1em Caveat'),
        document.fonts.load('400 1em "Public Sans"'),
        document.fonts.load('500 1em "Public Sans"'),
        document.fonts.load('600 1em "Public Sans"')
      ]);
    } catch (e) {
      console.warn('No se pudieron cargar las fuentes', e);
    }

    listo = true;
    render();
  });

  /* Re-renderizar al terminar la carga o si cambia la elección/porcentaje mostrado */
  $: if (listo) { claveTarjeta; render(); }
</script>

<div role="img" aria-label="Tarjeta Mi generación en las urnas" class="tarjeta-wrap" aria-busy={!listo}>
  {#if !listo}
    <div class="tarjeta-skeleton" aria-hidden="true"></div>
  {/if}
  <canvas
    bind:this={canvas}
    width="1792"
    height="2400"
    aria-hidden="true"
    class="tarjeta-canvas"
    class:oculto={!listo}
  ></canvas>
</div>

<div class="descarga">
  <button class="btn-download" on:click={descargar} disabled={!listo}>
    Descargar imagen para compartir
  </button>
</div>

<style>
  /* La tarjeta se muestra como una hoja impresa: sin brillos, con la
     placa de color desfasada detrás. */
  .tarjeta-canvas {
    width: 100%;
    max-width: 44rem;
    height: auto;
    display: block;
    border: 1.5px solid var(--rule-strong);
    border-radius: var(--radius-sm);
    box-shadow: 8px 8px 0 var(--sheet-plate);
    background: var(--bg-card);
  }

  .tarjeta-canvas.oculto {
    display: none;
  }

  /* Skeleton mientras se carga el arte, el logo y las tipografías */
  .tarjeta-skeleton {
    width: 100%;
    max-width: 44rem;
    aspect-ratio: 1792 / 2400;
    border: 1.5px solid var(--rule-strong);
    border-radius: var(--radius-sm);
    box-shadow: 8px 8px 0 var(--sheet-plate);
    background: linear-gradient(
      100deg,
      var(--bg-card) 30%,
      rgba(127, 127, 127, 0.22) 50%,
      var(--bg-card) 70%
    );
    background-size: 200% 100%;
    animation: tarjeta-shimmer 1.4s ease-in-out infinite;
  }

  @keyframes tarjeta-shimmer {
    from { background-position: 100% 0; }
    to { background-position: -100% 0; }
  }

  @media (prefers-reduced-motion: reduce) {
    .tarjeta-skeleton { animation: none; }
  }

  .descarga {
    margin-top: 1.75rem;
    max-width: 44rem;
  }

  .btn-download {
    width: 100%;
  }
</style>
