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
  import { createEventDispatcher } from 'svelte';
  import LineaDeVida from '../LineaDeVida.svelte';
  import Comparacion from '../Comparacion.svelte';
  import { focusTitle } from '../../utils/focusTitle.js';

  export let cohortData = null;
  export let entidadNombre = '';
  export let allData = null;
  export let yearOfBirth = null;
  /** Cuando es la primera elección del usuario, no hay línea de vida posible. */
  export let primeraVez = false;

  const dispatch = createEventDispatcher();
</script>

<section class="slide slide-historia">
  <h2 class="slide-title" data-titulo-slide="4" tabindex="-1" use:focusTitle>
    ¿Cómo ha cambiado la asistencia a las urnas?
  </h2>

  <p class="slide-lead">
    Comparamos las últimas elecciones para ver si tu generación está votando más o menos que antes.
  </p>

  {#if primeraVez}
    <div class="slide-card slide-card-primera">
      <p class="slide-lead slide-lead-primera">
        Tu generación votó por primera vez en 2024, así que todavía no hay elecciones
        anteriores con las que comparar su participación. Esta es su marca de
        referencia: la próxima elección verás si sube o baja.
      </p>
    </div>
  {:else}
    <div class="slide-card">
      <LineaDeVida
        data={cohortData}
        entidad={entidadNombre}
        nacional={allData?.meta?.nacional_participacion || {}}
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
</section>
