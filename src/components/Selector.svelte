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

  // ===== Fase 1: Indicador de pasos requeridos =====
  $: pasoActual = selectedYear && selectedEntidad ? 3 : (selectedYear || selectedEntidad ? 2 : 1);
  $: pasosCompletados = (selectedYear && !yearError ? 1 : 0) + (selectedEntidad ? 1 : 0);
  $: mensajePaso = pasosCompletados === 0
    ? 'Paso 1 de 2 — Año de nacimiento'
    : pasosCompletados === 1
      ? (selectedYear && !yearError ? 'Paso 2 de 2 — Entidad' : 'Paso 1 de 2 — Año de nacimiento')
      : 'Listo — revisa tus resultados abajo';
  
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
      `Selección actualizada: nacido en ${selectedYear}, entidad ${entidad?.nombre}`,
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
          bind:value={selectedEntidad}
          on:change={handleEntidadChange}
          required
          aria-required="true"
          aria-describedby="selector-help steps-current"
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
          Elige las dos opciones y los resultados aparecen solos. No guardamos tus datos.
        {:else if !selectedYear}
          Paso 1 de 2 completado ({pasosCompletados}/2). Falta elegir tu año de nacimiento.
        {:else if !selectedEntidad}
          Paso 1 de 2 completado ({pasosCompletados}/2). Falta elegir tu estado.
        {:else}
          ¡Listo! 2 de 2 pasos completados. Mira tus resultados abajo. Puedes cambiar tu respuesta cuando quieras.
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
    background: var(--color-bg-section);
    border: 2px solid var(--color-border);
    border-radius: var(--border-radius-lg);
    padding: 2rem;
    transition: all var(--transition-base);
  }
  
  .mad-libs-form:focus-within {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 4px rgba(217, 0, 108, 0.1);
  }
  
  .mad-libs-input {
    display: inline-block;
    padding: 0.5rem 1rem;
    font-size: clamp(1rem, 2.5vw, 1.25rem);
    font-weight: 600;
    font-family: 'Outfit', sans-serif;
    border: 2px solid var(--color-primary);
    border-radius: var(--border-radius-sm);
    background: var(--color-bg);
    color: var(--color-primary);
    cursor: pointer;
    transition: all var(--transition-base);
    min-width: 100px;
    text-align: center;
  }
  
  .mad-libs-input:hover {
    background: rgba(217, 0, 108, 0.05);
    border-color: var(--color-primary-light);
  }
  
  .mad-libs-input:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 4px rgba(217, 0, 108, 0.15);
    background: var(--color-bg);
  }
  
  .mad-libs-input option {
    background: var(--color-bg-section);
    color: var(--color-text);
    padding: 0.5rem;
  }
  
  .mad-libs-input option:disabled {
    color: var(--color-text-muted);
  }
  
  .form-error {
    background-color: rgba(239, 68, 68, 0.1);
    border: 1px solid var(--color-error);
    color: var(--color-error);
    padding: var(--spacing-md);
    border-radius: var(--border-radius-sm);
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
  .field-label { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; font-size: 1.05rem; color: var(--color-text); }
  .step-num { display: inline-flex; align-items: center; justify-content: center; width: 1.6rem; height: 1.6rem; border-radius: 50%; background: var(--color-primary); color: #fff; font-size: 0.85rem; font-weight: 700; flex-shrink: 0; }
  .fields .mad-libs-input { width: 100%; min-height: 52px; font-size: 1.125rem; text-align: left; color: var(--color-text); }
  .selector-help { margin-top: 1.25rem; text-align: center; font-size: 0.95rem; color: var(--color-text-secondary); }
  @media (max-width: 640px) { .fields { grid-template-columns: 1fr; } .mad-libs-form { padding: 1.25rem; } }

  /* ===== Fase 1: indicador de pasos ===== */
  .steps-header { margin-bottom: 1.5rem; display: grid; gap: 0.6rem; }
  .steps-title { font-size: 1rem; color: var(--color-text-secondary); }
  .steps-title strong { color: var(--color-text); }
  .steps-counter { display: flex; align-items: baseline; gap: 0.5rem; }
  .counter-value { font-size: 1.75rem; font-weight: 700; color: var(--color-primary); line-height: 1; }
  .counter-label { font-size: 0.9rem; color: var(--color-text-secondary); }
  .steps-bar { height: 8px; border-radius: 999px; background: rgba(217, 0, 108, 0.15); overflow: hidden; }
  .steps-bar-fill { display: block; height: 100%; background: var(--color-primary); border-radius: 999px; transition: width var(--transition-base); }
  .steps-current { font-size: 0.95rem; font-weight: 600; color: var(--color-primary); }
  @media (prefers-reduced-motion: reduce) { .steps-bar-fill { transition: none; } }

  .step-num.done { background: var(--color-success, #16a34a); }
</style>
