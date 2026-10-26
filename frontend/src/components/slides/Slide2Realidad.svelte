<script>
  /**
   * Slide 2 — El choque de realidad.
   * El dato principal, en grande y centrado, con los indicadores de apoyo.
   */
  import { createEventDispatcher } from 'svelte';
  import { formatExactPercent } from '../../utils/formato.js';
  import { focusTitle } from '../../utils/focusTitle.js';
  import IlustracionUrna from '../IlustracionUrna.svelte';
  import { ajustarNumero } from '../../utils/ajustarNumero.js';

  /** Cifra redondeada: cuántas de 100 personas votaron */
  export let numero = null;
  export let copyPrincipal = '';
  export let copySecundario = '';
  export let copyInsight = '';
  export let comparacionFrase = '';
  export let abstencion = null;
  export let deltaVsPrev = null;
  export let prevAnio = null;
  export let nacionalPct = null;

  const dispatch = createEventDispatcher();
</script>

<section class="slide slide-shock">
  <div class="shock-hero" use:ajustarNumero={numero}>
    {#if numero !== null}
      <div class="shock-numeral" aria-hidden="true">
        <span class="shock-number">{numero}</span>
      </div>
    {/if}

    <div class="shock-copy">
      <h2 class="slide-title slide-title-xl" data-titulo-slide="2" tabindex="-1" use:focusTitle>
        {copyPrincipal}
      </h2>

      <p class="slide-lead">{copySecundario}</p>

      {#if copyInsight}
        <p class="slide-insight">{copyInsight}</p>
      {/if}

      {#if comparacionFrase}
        <p class="slide-note">{comparacionFrase}</p>
      {/if}
    </div>
  </div>

  <!-- Decorativa: asoma desde el pie de página (ver .shock-art en global.css) -->
  <div class="shock-art" aria-hidden="true">
    <div class="shock-art-inner">
      <IlustracionUrna />
    </div>
  </div>

  <div class="stat-chips">
    <div class="stat-chip">
      <span class="stat-chip-label">Personas que no fueron a votar</span>
      <span class="stat-chip-value">{abstencion !== null ? formatExactPercent(abstencion) : '—'}</span>
    </div>
    {#if deltaVsPrev !== null}
      <div class="stat-chip">
        <span class="stat-chip-label">Cambio desde {prevAnio}</span>
        <span class="stat-chip-value" class:down={deltaVsPrev < 0}>
          {deltaVsPrev < 0 ? '▼' : '▲'} {Math.abs(deltaVsPrev).toFixed(1)} pts
        </span>
      </div>
    {/if}
    {#if nacionalPct != null}
      <div class="stat-chip">
        <span class="stat-chip-label">Promedio del país</span>
        <span class="stat-chip-value">{formatExactPercent(nacionalPct)}</span>
      </div>
    {/if}
  </div>

  <div class="slide-actions">
    <button class="btn-primary" on:click={() => dispatch('next')}>Ver cómo se ve esto</button>
    <button class="btn-back" on:click={() => dispatch('back')} aria-label="Volver al paso anterior">Volver</button>
  </div>
</section>
