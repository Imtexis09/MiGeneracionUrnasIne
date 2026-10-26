<script>
  /**
   * Slide 4 — El contexto histórico.
   * Línea de vida cívica (D3) con el promedio nacional y, en detalle
   * desplegable, la comparación con otras generaciones a la misma edad.
   *
   * Si es la primera elección del usuario (18-20 años), no hay histórico
   * propio: se muestra una variante "primera elección" sin gráfica ni
   * comparación generacional.
   */
  import { createEventDispatcher, onMount } from 'svelte';
  import LineaDeVida from '../LineaDeVida.svelte';
  import Comparacion from '../Comparacion.svelte';
  import CredencialINE from '../CredencialINE.svelte';
  import { focusTitle } from '../../utils/focusTitle.js';

  export let cohortData = null;
  export let entidadNombre = '';
  export let allData = null;
  export let yearOfBirth = null;
  /** Cuando es la primera elección del usuario, no hay línea de vida posible. */
  export let primeraVez = false;

  const dispatch = createEventDispatcher();

  let seccion;
  let cabecera;
  let credencial;
  let cabeceraGrafica;

  /**
   * La credencial flota arriba a la derecha. Titular y entradilla le dejan su
   * hueco; de la gráfica para abajo el contenido usa todo el ancho, así que se
   * baja justo lo necesario para que la credencial nunca quede encima.
   */
  function medir() {
    if (!seccion || !cabecera || !credencial) return;
    const ancha = window.matchMedia('(min-width: 1000px)').matches;
    const hueco = ancha
      ? Math.max(0, credencial.getBoundingClientRect().bottom - cabecera.getBoundingClientRect().bottom + 24)
      : 0;
    seccion.style.setProperty('--cred-hueco', `${Math.round(hueco)}px`);
  }

  onMount(() => {
    medir();
    const ro = new ResizeObserver(medir);
    [seccion, cabecera, credencial].forEach((n) => n && ro.observe(n));
    window.addEventListener('resize', medir);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', medir);
    };
  });
</script>

<section class="slide slide-historia" bind:this={seccion}>
  <div class="historia-main">
  <div class="historia-cabecera" bind:this={cabecera}>
  <h2 class="slide-title" data-titulo-slide="4" tabindex="-1" use:focusTitle>
    ¿Cómo ha cambiado la asistencia a las urnas?
  </h2>

  <p class="slide-lead">
    Comparamos las últimas elecciones para ver si tu generación está votando más o menos que antes.
  </p>

  {#if primeraVez}
    <p class="slide-insight slide-lead-primera">
      Tu generación votó por primera vez en 2024, así que todavía no hay elecciones
      anteriores con las que comparar su participación. Esta es su marca de
      referencia: la próxima elección verás si sube o baja.
    </p>
  {/if}

  {#if !primeraVez}
    <!-- Aquí aterriza el encabezado de la gráfica (junto a la credencial) -->
    <div class="historia-grafica-cabecera" bind:this={cabeceraGrafica}></div>
  {/if}
  </div>

  <div class="historia-cuerpo">
  {#if !primeraVez}
    <div class="slide-card">
      <LineaDeVida
        data={cohortData}
        entidad={entidadNombre}
        nacional={allData?.meta?.nacional_participacion || {}}
        cabeceraDestino={cabeceraGrafica}
      />
    </div>

    <!-- Detalle secundario: comparación generacional (progressive disclosure) -->
    <details class="slide-details">
      <summary>Tu generación a la misma edad</summary>
      <div class="slide-details-body">
        <Comparacion
          data={cohortData}
          allData={allData}
          yearOfBirth={yearOfBirth}
        />
      </div>
    </details>
  {/if}

  <div class="slide-actions">
    <button class="btn-primary" on:click={() => dispatch('next')}>¿Qué podemos hacer?</button>
    <button class="btn-back" on:click={() => dispatch('back')} aria-label="Volver al paso anterior">Volver</button>
  </div>
  </div>
  </div>

  <aside class="historia-aside" aria-label="Tu credencial para votar" bind:this={credencial}>
    <CredencialINE
      cohortData={cohortData}
      entidad={entidadNombre}
      yearOfBirth={yearOfBirth}
    />
  </aside>
</section>
