<script>
  import { createEventDispatcher } from 'svelte';
  import { ENTIDADES, YEAR_RANGE, validateYearOfBirth } from '../utils/data.js';
  import { generateYearRange } from '../utils/formato.js';
  import { announceToScreenReader } from '../utils/a11y.js';
  
  const dispatch = createEventDispatcher();
  
  export let initialYear = null;
  export let initialEntidad = null;

  let selectedYear = initialYear;
  let selectedEntidad = initialEntidad;
  let yearError = '';
  const years = generateYearRange(YEAR_RANGE.min, YEAR_RANGE.max);

  $: if (initialYear === null && initialEntidad === null) {
    selectedYear = null;
    selectedEntidad = null;
    yearError = '';
  }

  $: pasosCompletados = (selectedYear && !yearError ? 1 : 0) + (selectedEntidad ? 1 : 0);
  $: mensajePaso = pasosCompletados === 0
    ? 'Empieza por tu año de nacimiento'
    : pasosCompletados === 1
      ? (selectedYear && !yearError ? 'Ahora elige tu estado' : 'Empieza por tu año de nacimiento')
      : 'Ya está: mira tu resultado';
  $: entidadDisabled = !(selectedYear && !yearError);
  
  function handleYearChange(event) {
    const year = parseInt(event.target.value);
    selectedYear = year;
    
    const validation = validateYearOfBirth(year);
    yearError = validation.valid ? '' : validation.message;
    
    if (validation.valid && selectedEntidad) {
      emitSelection();
    }
  }
  
  function handleEntidadChange(event) {
    const cve = event.target.value;
    selectedEntidad = cve;
    
    if (selectedYear && !yearError) {
      emitSelection();
    }
  }
  
  function emitSelection() {
    const entidad = ENTIDADES.find(e => e.cve === selectedEntidad);
    
    dispatch('select', {
      year: selectedYear,
      entidad: selectedEntidad,
      nombre: entidad ? entidad.nombre : ''
    });
    
    announceToScreenReader(
      `Selección actualizada: nacido en ${selectedYear}, estado ${entidad?.nombre}`,
      'polite'
    );
  }
</script>

<div class="selector-container">
  <form class="mad-libs-form hoja" on:submit|preventDefault>
    <div class="steps-header">
      <p class="steps-title">Marca tus dos datos para ver tu resultado</p>
      <div class="steps-counter" role="status" aria-live="polite" id="steps-counter">
        <span class="casilla" class:marcada={selectedYear && !yearError} aria-hidden="true"></span>
        <span class="casilla" class:marcada={selectedEntidad} aria-hidden="true"></span>
        <span class="sr-only">{pasosCompletados} de 2 datos completados</span>
      </div>
    </div>
    <p class="steps-current" id="steps-current">{mensajePaso}</p>

    <div class="fields">
      <div class="field">
        <label for="year-select" class="field-label">¿En qué año naciste?</label>
        <select
          id="year-select"
          class="mad-libs-input"
          bind:value={selectedYear}
          on:change={handleYearChange}
          required
          aria-required="true"
          aria-invalid={yearError ? 'true' : 'false'}
          aria-describedby={yearError ? 'year-error steps-current' : 'selector-help steps-current'}
        >
          <option value={null} disabled selected>Elige tu año</option>
          {#each years as year}
            <option value={year}>{year}</option>
          {/each}
        </select>
      </div>

      <div class="field">
        <label for="entidad-select" class="field-label">¿En qué estado vives?</label>
        <select
          id="entidad-select"
          class="mad-libs-input"
          class:disabled={entidadDisabled}
          bind:value={selectedEntidad}
          on:change={handleEntidadChange}
          disabled={entidadDisabled}
          required
          aria-required="true"
          aria-describedby="selector-help steps-current"
          aria-disabled={entidadDisabled}
        >
          <option value={null} disabled selected>Elige tu estado</option>
          {#each ENTIDADES as entidad}
            <option value={entidad.cve}>{entidad.nombre}</option>
          {/each}
        </select>
      </div>
    </div>

    {#if yearError}
      <div class="form-error" id="year-error" role="alert">{yearError}</div>
    {:else}
      <p class="selector-help" id="selector-help" aria-live="polite">
        {#if !selectedYear && !selectedEntidad}
          Elige las dos opciones y tu historia aparece al instante. No guardamos tus datos.
        {:else if !selectedYear}
          Falta tu año de nacimiento.
        {:else if !selectedEntidad}
          Falta tu estado.
        {:else}
          Listo. Puedes cambiar tu respuesta cuando quieras.
        {/if}
      </p>
    {/if}

    {#if pasosCompletados === 2}
      <div class="sello" aria-hidden="true">
        <span class="sello-texto">Registrado</span>
      </div>
    {/if}
  </form>
</div>

<style>
  .selector-container {
    max-width: 46rem;
  }

  .mad-libs-form {
    position: relative;
    padding: 1.5rem 1.75rem 1.5rem;
  }

  .sello {
    --d: clamp(6rem, 8.5vw, 7.75rem);
    position: absolute;
    right: calc(var(--d) * -0.38);
    bottom: calc(var(--d) * -0.45);
    z-index: 3;
    width: var(--d);
    height: var(--d);
    pointer-events: none;
    transform: rotate(-14deg);
    transform-origin: center;
    animation: sellar 0.55s cubic-bezier(0.2, 0.9, 0.3, 1.1) both;
  }

  .sello-texto {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    border: 4px solid var(--accent-pink);
    outline: 2px solid var(--accent-pink);
    outline-offset: -11px;
    border-radius: 50%;
    color: var(--accent-pink);
    font-family: var(--font-display);
    font-weight: 900;
    font-size: calc(var(--d) * 0.19);
    line-height: 1;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    text-align: center;
    opacity: 0.9;
  }

  @media (max-width: 600px) {
    .sello {
      --d: 5.75rem;
      right: -0.4rem;
      bottom: -2.5rem;
    }
  }

  @keyframes sellar {
    0% {
      opacity: 0;
      transform: translate(5rem, 5rem) scale(2.6) rotate(-2deg);
    }
    55% {
      opacity: 1;
      transform: translate(0, 0) scale(0.9) rotate(-16deg);
    }
    75% {
      transform: scale(1.05) rotate(-13deg);
    }
    100% {
      opacity: 1;
      transform: scale(1) rotate(-14deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .sello {
      animation: none;
    }
  }

  .steps-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .steps-title {
    font-family: var(--font-display);
    font-size: 1.75rem;
    font-weight: 800;
    line-height: 1;
    color: var(--text-primary);
    max-width: 18ch;
  }

  .steps-counter {
    display: flex;
    gap: 0.4rem;
  }

  .steps-counter .casilla {
    --casilla-size: 1.75rem;
  }

  .steps-current {
    margin: 0.6rem 0 1.4rem;
    padding-bottom: 1.1rem;
    border-bottom: 1px solid var(--line);
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--accent-pink);
  }

  .fields {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
    gap: 1.25rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .field-label {
    font-size: 0.975rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .mad-libs-input {
    appearance: none;
    -webkit-appearance: none;
    width: 100%;
    min-height: 54px;
    padding: 0.5rem 2.75rem 0.5rem 0.9rem;
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--text-primary);
    background-color: var(--bg-main);
    border: 1.5px solid var(--rule-strong);
    border-radius: var(--radius-sm);
    cursor: pointer;
    text-align: left;
    transition: background-color var(--transition-fast);
    background-image:
      linear-gradient(currentColor, currentColor);
    background-size: 0 0;
  }

  .field {
    position: relative;
  }

  .field::after {
    content: '';
    position: absolute;
    right: 0.9rem;
    bottom: 1.1rem;
    width: 1rem;
    height: 1rem;
    pointer-events: none;
    background: var(--text-primary);
    -webkit-mask: var(--caret) center / contain no-repeat;
    mask: var(--caret) center / contain no-repeat;
  }

  .mad-libs-input:hover:not(:disabled) {
    background-color: var(--bg-card-hover);
  }

  .mad-libs-input:focus {
    border-color: var(--accent-pink);
  }

  .mad-libs-input option {
    background: var(--bg-card);
    color: var(--text-primary);
    font-weight: 400;
  }

  .mad-libs-input.disabled {
    color: var(--text-muted);
    border-style: dashed;
    border-color: var(--text-muted);
    cursor: not-allowed;
    background-image: repeating-linear-gradient(
      135deg,
      transparent 0 6px,
      var(--line) 6px 7px
    );
    background-size: auto;
  }

  .field:has(.disabled)::after {
    opacity: 0.4;
  }

  .form-error {
    margin-top: 1.25rem;
    padding: 0.8rem 1rem;
    background: var(--bg-warning);
    border-left: 3px solid var(--status-error);
    color: var(--text-primary);
  }

  .selector-help {
    margin-top: 1.1rem;
    font-size: 0.925rem;
    color: var(--text-secondary);
  }

  @media (max-width: 640px) {
    .mad-libs-form {
      padding: 1.25rem;
    }

    .fields {
      grid-template-columns: 1fr;
    }
  }
</style>
