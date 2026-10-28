<script>
  import { createEventDispatcher } from 'svelte';
  import mapa from '@svg-maps/mexico';
  import { ENTIDADES } from '../utils/data.js';

  export let selectedState = '';
  export let interactive = false;

  const dispatch = createEventDispatcher();

  const CVE_A_ID = {
    '01': 'agu', '02': 'bcn', '03': 'bcs', '04': 'cam', '05': 'coa', '06': 'col',
    '07': 'chp', '08': 'chh', '09': 'cmx', '10': 'dur', '11': 'gua', '12': 'gro',
    '13': 'hid', '14': 'jal', '15': 'mex', '16': 'mic', '17': 'mor', '18': 'nay',
    '19': 'nle', '20': 'oax', '21': 'pue', '22': 'que', '23': 'roo', '24': 'slp',
    '25': 'sin', '26': 'son', '27': 'tab', '28': 'tam', '29': 'tla', '30': 'ver',
    '31': 'yuc', '32': 'zac'
  };
  const ID_A_LOC = Object.fromEntries(mapa.locations.map((l) => [l.id, l]));

  const ESTADOS = Object.entries(CVE_A_ID).map(([cve, id]) => ({
    cve,
    nombre: ENTIDADES.find((e) => e.cve === cve)?.nombre ?? ID_A_LOC[id].name,
    d: ID_A_LOC[id].path
  }));

  function handleSelect(cve) {
    selectedState = cve;
    dispatch('select', { state: cve });
  }

  function handleKeydown(event, cve) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSelect(cve);
    }
  }

  $: nombreEstadoSeleccionado = ESTADOS.find((e) => e.cve === selectedState)?.nombre ?? '';
</script>

<div class="map-container" role="region" aria-label="Mapa de la República Mexicana">
  <div class="fallback-selector" id="state-status" role="status">
    {#if selectedState}
      <p class="fallback-state">Estado seleccionado:</p>
      <p class="estado-nombre">{nombreEstadoSeleccionado}</p>
    {:else}
      <p class="fallback-state">Aún no has elegido tu estado. Selecciónalo en el formulario para verlo aquí.</p>
    {/if}
  </div>

  <svg
    viewBox={mapa.viewBox}
    class="map-svg"
    aria-hidden="false"
    focusable="false"
  >
    {#each ESTADOS as estado}
      {#if interactive}
        <path
          d={estado.d}
          id="state-{estado.cve}"
          class="state-path"
          class:active={selectedState === estado.cve}
          tabindex="0"
          role="button"
          aria-label={`${estado.nombre}. Haz clic o presiona Enter para seleccionar.`}
          aria-pressed={selectedState === estado.cve}
          aria-controls="state-status"
          on:click={() => handleSelect(estado.cve)}
          on:keydown={(e) => handleKeydown(e, estado.cve)}
        />
      {:else}
        <path
          d={estado.d}
          id="state-{estado.cve}"
          class="state-path"
          class:active={selectedState === estado.cve}
        />
      {/if}
    {/each}
  </svg>
</div>

<style>
  .map-container {
    position: relative;
    width: 100%;
    max-width: none;
    margin: 0;
  }

  .map-svg {
    width: 100%;
    height: auto;
    display: block;
    overflow: visible;
  }

  .state-path {
    fill: var(--bg-card);
    stroke: var(--rule-strong);
    stroke-width: 1.1;
    stroke-linejoin: round;
    cursor: default;
    transition: fill 0.3s ease;
  }

  .state-path[role='button'] {
    cursor: pointer;
  }

  .state-path[role='button']:hover {
    fill: var(--bg-card-hover);
  }

  .state-path:focus-visible {
    outline: 3px solid var(--border-focus);
    outline-offset: 2px;
  }

  .state-path.active {
    fill: var(--accent-pink);
    stroke: var(--rule-strong);
    stroke-width: 2;
  }

  .fallback-selector {
    margin-bottom: 0.75rem;
    text-align: right;
    min-height: 4.5rem;
  }

  .fallback-state {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.5;
    color: var(--text-secondary);
  }

  .estado-nombre {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(2rem, 3.2vw, 3rem);
    font-weight: 800;
    line-height: 1.05;
    color: var(--text-primary);
  }

  @media (prefers-reduced-motion: reduce) {
    .state-path {
      transition: none;
    }
  }
</style>
