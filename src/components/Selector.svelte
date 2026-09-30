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
  <div class="selector-intro">
    <h2>Descubre Tu Generación</h2>
    <p>Selecciona tu año de nacimiento y tu entidad para conocer la historia de tu generación en las urnas.</p>
  </div>
  
  <form class="selector-form" on:submit|preventDefault>
    <div class="form-row">
      <!-- Selector de Año -->
      <div class="form-group">
        <label for="year-select">
          ¿En qué año naciste?
          <span class="required" aria-label="requerido">*</span>
        </label>
        <select
          id="year-select"
          bind:value={selectedYear}
          on:change={handleYearChange}
          required
          aria-required="true"
          aria-invalid={yearError ? 'true' : 'false'}
          aria-describedby={yearError ? 'year-error' : null}
        >
          <option value={null} disabled selected>Selecciona un año</option>
          {#each years as year}
            <option value={year}>{year}</option>
          {/each}
        </select>
        
        {#if yearError}
          <div class="form-error" id="year-error" role="alert">
            {yearError}
          </div>
        {/if}
      </div>
      
      <!-- Selector de Entidad -->
      <div class="form-group">
        <label for="entidad-select">
          ¿En qué entidad vives?
          <span class="required" aria-label="requerido">*</span>
        </label>
        <select
          id="entidad-select"
          bind:value={selectedEntidad}
          on:change={handleEntidadChange}
          required
          aria-required="true"
        >
          <option value={null} disabled selected>Selecciona tu estado</option>
          {#each ENTIDADES as entidad}
            <option value={entidad.cve}>{entidad.nombre}</option>
          {/each}
        </select>
      </div>
    </div>
    
    <div class="selector-hint">
      <small>
        📊 Veremos cómo participó tu generación en las elecciones federales 2009–2024
      </small>
    </div>
  </form>
</div>

<style>
  .selector-container {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
    color: white;
    padding: var(--spacing-2xl) var(--spacing-lg);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-lg);
  }
  
  .selector-intro {
    text-align: center;
    margin-bottom: var(--spacing-xl);
  }
  
  .selector-intro h2 {
    color: white;
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    margin-bottom: var(--spacing-md);
  }
  
  .selector-intro p {
    font-size: var(--font-size-lg);
    opacity: 0.95;
    max-width: 600px;
    margin: 0 auto;
  }
  
  .selector-form {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .form-row {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }
  
  @media (min-width: 768px) {
    .form-row {
      flex-direction: row;
    }
    
    .form-row .form-group {
      flex: 1;
    }
  }
  
  .form-group label {
    color: white;
    font-weight: 600;
    font-size: var(--font-size-lg);
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-sm);
  }
  
  .required {
    color: var(--color-accent);
    font-weight: bold;
  }
  
  select {
    width: 100%;
    padding: var(--spacing-md);
    font-size: var(--font-size-base);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: var(--border-radius-sm);
    background-color: white;
    color: var(--color-text);
    cursor: pointer;
    transition: all var(--transition-base);
  }
  
  select:hover {
    border-color: rgba(255, 255, 255, 0.6);
  }
  
  select:focus {
    outline: none;
    border-color: white;
    box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.3);
  }
  
  select:invalid {
    border-color: var(--color-error);
  }
  
  .form-error {
    background-color: rgba(200, 35, 51, 0.9);
    color: white;
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--border-radius-sm);
    font-size: var(--font-size-sm);
    margin-top: var(--spacing-sm);
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }
  
  .form-error::before {
    content: '⚠️';
    font-size: 1.2em;
  }
  
  .selector-hint {
    text-align: center;
    margin-top: var(--spacing-lg);
    opacity: 0.9;
  }
  
  .selector-hint small {
    font-size: var(--font-size-sm);
    line-height: 1.4;
  }
  
  /* Accesibilidad: aumentar contraste de opciones */
  select option {
    background-color: white;
    color: var(--color-text);
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
  
  /* Modo oscuro */
  @media (prefers-color-scheme: dark) {
    .selector-container {
      background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-secondary-dark) 100%);
    }
  }
</style>
