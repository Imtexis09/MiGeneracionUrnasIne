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
    <p class="mad-libs-sentence">
      <span class="mad-libs-text">Nací en</span>
      <label for="year-select" class="sr-only">Año de nacimiento</label>
      <select
        id="year-select"
        class="mad-libs-input"
        bind:value={selectedYear}
        on:change={handleYearChange}
        required
        aria-required="true"
        aria-invalid={yearError ? 'true' : 'false'}
        aria-describedby={yearError ? 'year-error' : null}
      >
        <option value={null} disabled selected>año</option>
        {#each years as year}
          <option value={year}>{year}</option>
        {/each}
      </select>
      
      <span class="mad-libs-text">y vivo en</span>
      <label for="entidad-select" class="sr-only">Entidad federativa</label>
      <select
        id="entidad-select"
        class="mad-libs-input mad-libs-input-wide"
        bind:value={selectedEntidad}
        on:change={handleEntidadChange}
        required
        aria-required="true"
      >
        <option value={null} disabled selected>estado</option>
        {#each ENTIDADES as entidad}
          <option value={entidad.cve}>{entidad.nombre}</option>
        {/each}
      </select>
    </p>
    
    {#if yearError}
      <div class="form-error" id="year-error" role="alert">
        {yearError}
      </div>
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
  
  .mad-libs-sentence {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    font-size: clamp(1.125rem, 2.5vw, 1.5rem);
    font-weight: 500;
    line-height: 1.6;
  }
  
  .mad-libs-text {
    color: var(--color-text);
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
  
  .mad-libs-input-wide {
    min-width: 180px;
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
    content: '⚠️';
    font-size: 1.2em;
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
    .mad-libs-sentence {
      font-size: 1.125rem;
      text-align: center;
    }
    
    .mad-libs-input {
      min-width: 120px;
    }
    
    .mad-libs-input-wide {
      min-width: 150px;
    }
  }
</style>
