<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { ENTIDADES, YEAR_RANGE, validateYearOfBirth } from '../utils/data.js';
  import { generateYearRange } from '../utils/formato.js';
  import { announceToScreenReader } from '../utils/a11y.js';
  
  const dispatch = createEventDispatcher();
  
  // Estado del selector
  let selectedYear = null;
  let selectedEntidad = null;
  let yearError = '';
  let years = [];

  // Generar array de años al montar
  onMount(() => {
    years = generateYearRange(YEAR_RANGE.min, YEAR_RANGE.max);
  });

  // ===== Flujo: año primero, estado después =====
  // El select de entidad empieza deshabilitado; solo se activa cuando el año
  // es válido. El mapa es solo visual: no sirve para seleccionar.
  $: pasosCompletados = (selectedYear && !yearError ? 1 : 0) + (selectedEntidad ? 1 : 0);
  // El mensaje pide la siguiente acción en vez de numerar campos: es una
  // invitación, no una etiqueta de formulario.
  $: mensajePaso = pasosCompletados === 0
    ? 'Empieza por tu año de nacimiento'
    : pasosCompletados === 1
      ? (selectedYear && !yearError ? 'Ahora elige tu estado' : 'Empieza por tu año de nacimiento')
      : 'Ya está: mira tu resultado';
  $: entidadDisabled = !(selectedYear && !yearError);
  
  // Manejar cambio de año
  function handleYearChange(event) {
    const year = parseInt(event.target.value);
    selectedYear = year;
    
    // Validar año
    const validation = validateYearOfBirth(year);
    yearError = validation.valid ? '' : validation.message;
    
    // Si ambos están seleccionados y son válidos, emitir evento
    if (validation.valid && selectedEntidad) {
      emitSelection();
    }
  }
  
  // Manejar cambio de entidad
  function handleEntidadChange(event) {
    const cve = event.target.value;
    selectedEntidad = cve;
    
    // Si ambos están seleccionados, emitir evento
    if (selectedYear && !yearError) {
      emitSelection();
    }
  }
  
  // Emitir selección completa
  function emitSelection() {
    const entidad = ENTIDADES.find(e => e.cve === selectedEntidad);
    
    dispatch('select', {
      year: selectedYear,
      entidad: selectedEntidad,
      nombre: entidad ? entidad.nombre : ''
    });
    
    // Anunciar a lectores de pantalla
    announceToScreenReader(
      `Selección actualizada: nacido en ${selectedYear}, estado ${entidad?.nombre}`,
      'polite'
    );
  }
</script>

<div class="selector-container">
  <form class="mad-libs-form" on:submit|preventDefault>
    <div class="steps-header">
      <div class="steps-title">
        <strong>Necesitas 2 datos</strong> para ver tus resultados
      </div>
      <div class="steps-counter" role="status" aria-live="polite" id="steps-counter">
        <span class="counter-value">{pasosCompletados}/2</span>
        <span class="counter-label">completados</span>
      </div>
      <div class="steps-bar" aria-hidden="true">
        <span class="steps-bar-fill" style={`width: ${(pasosCompletados / 2) * 100}%`}></span>
      </div>
      <div class="steps-current" id="steps-current">{mensajePaso}</div>
    </div>

    <div class="fields">
      <div class="field">
        <label for="year-select" class="field-label">
          <span class="step-num" class:done={selectedYear && !yearError} aria-hidden="true">
            {selectedYear && !yearError ? '✓' : '1'}
          </span> ¿En qué año naciste?
        </label>
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
        <label for="entidad-select" class="field-label">
          <span class="step-num" class:done={selectedEntidad} aria-hidden="true">
            {selectedEntidad ? '✓' : '2'}
          </span> ¿En qué estado vives?
        </label>
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
  </form>
</div>

<style>
  .selector-container {
    max-width: 900px;
    margin: 0 auto;
  }
  
  .mad-libs-form {
    background: var(--bg-card);
    border: 2px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    padding: 2rem;
    transition: all var(--transition-base);
  }
  
  .mad-libs-form:focus-within {
    border-color: var(--accent-pink);
    box-shadow: 0 0 0 4px rgba(217, 0, 108, 0.1);
  }
  
  .mad-libs-input {
    display: inline-block;
    padding: 0.5rem 1rem;
    font-size: clamp(1rem, 2.5vw, 1.25rem);
    font-weight: 600;
    font-family: 'Outfit', sans-serif;
    border: 2px solid var(--accent-pink);
    border-radius: var(--radius-sm);
    background: var(--bg-main);
    color: var(--accent-pink);
    cursor: pointer;
    transition: all var(--transition-base);
    min-width: 100px;
    text-align: center;
  }
  
  .mad-libs-input:hover {
    background: rgba(217, 0, 108, 0.05);
    border-color: var(--accent-pink-light);
  }
  
  .mad-libs-input:focus {
    border-color: var(--accent-pink);
    background: var(--bg-main);
  }

  .mad-libs-input:focus-visible {
    outline: 3px solid var(--border-focus);
    outline-offset: 2px;
  }
  
  .mad-libs-input option {
    background: var(--bg-card);
    color: var(--text-primary);
    padding: 0.5rem;
  }
  
  .mad-libs-input option:disabled {
    color: var(--text-muted);
  }
  
  .form-error {
    background-color: rgba(239, 68, 68, 0.1);
    border: 1px solid var(--status-error);
    color: var(--status-error);
    padding: var(--spacing-md);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-sm);
    margin-top: var(--spacing-lg);
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }
  
  .form-error::before {
    content: 'Aviso:';
    font-weight: 700;
    flex-shrink: 0;
  }
  
  /* Animación sutil al cargar */
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .selector-container {
    animation: fadeInUp 0.5s ease-out;
  }
  
  @media (prefers-reduced-motion: reduce) {
    .selector-container {
      animation: none;
    }
  }
  
  /* Responsive */
  @media (max-width: 640px) {
    .mad-libs-input {
      min-width: 120px;
    }
  }

  .fields { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; text-align: left; }
  .field { display: flex; flex-direction: column; gap: 0.5rem; }
  .field-label { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; font-size: 1.05rem; color: var(--text-primary); }
  .step-num { display: inline-flex; align-items: center; justify-content: center; width: 1.6rem; height: 1.6rem; border-radius: 50%; background: var(--accent-pink); color: #fff; font-size: 0.85rem; font-weight: 700; flex-shrink: 0; }
  .fields .mad-libs-input { width: 100%; min-height: 52px; font-size: 1.125rem; text-align: left; color: var(--text-primary); }
  .fields .mad-libs-input.disabled {
    background: var(--bg-card-hover);
    border-color: var(--border-subtle);
    color: var(--text-muted);
    cursor: not-allowed;
    opacity: 0.6;
  }
  .fields .mad-libs-input.disabled:hover {
    background: var(--bg-card-hover);
    border-color: var(--border-subtle);
  }
  .selector-help { margin-top: 1.25rem; text-align: center; font-size: 0.95rem; color: var(--text-secondary); }
  @media (max-width: 640px) { .fields { grid-template-columns: 1fr; } .mad-libs-form { padding: 1.25rem; } }

  /* ===== Fase 1: indicador de pasos ===== */
  .steps-header { margin-bottom: 1.5rem; display: grid; gap: 0.6rem; }
  .steps-title { font-size: 1rem; color: var(--text-secondary); }
  .steps-title strong { color: var(--text-primary); }
  .steps-counter { display: flex; align-items: baseline; gap: 0.5rem; }
  .counter-value { font-size: 1.75rem; font-weight: 700; color: var(--accent-pink); line-height: 1; }
  .counter-label { font-size: 0.9rem; color: var(--text-secondary); }
  .steps-bar { height: 8px; border-radius: 999px; background: rgba(217, 0, 108, 0.15); overflow: hidden; }
  .steps-bar-fill { display: block; height: 100%; background: var(--accent-pink); border-radius: 999px; transition: width var(--transition-base); }
  .steps-current { font-size: 0.95rem; font-weight: 600; color: var(--accent-pink); }
  @media (prefers-reduced-motion: reduce) { .steps-bar-fill { transition: none; } }

  .step-num.done { background: var(--status-success, #16a34a); }
</style>
