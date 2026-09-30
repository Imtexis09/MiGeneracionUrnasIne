<script>
  import { onMount } from 'svelte';
  import Selector from './components/Selector.svelte';
  import LineaDeVida from './components/LineaDeVida.svelte';
  import Comparacion from './components/Comparacion.svelte';
  import SillaVacia from './components/SillaVacia.svelte';
  import Tarjeta from './components/Tarjeta.svelte';
  import Metodologia from './components/Metodologia.svelte';
  import { loadData } from './utils/data.js';
  import { findCohortData } from './utils/calculos.js';

  // Estado de la aplicación
  let yearOfBirth = null;
  let entidadCve = null;
  let entidadNombre = '';
  let cohortData = null;
  let dataLoaded = false;
  let allData = null;
  let showMetodologia = false;

  // Cargar datos al montar
  onMount(async () => {
    try {
      allData = await loadData();
      dataLoaded = true;
    } catch (error) {
      console.error('Error cargando datos:', error);
      dataLoaded = false;
    }
  });

  // Manejar selección del usuario
  function handleSelection(event) {
    const { year, entidad, nombre } = event.detail;
    yearOfBirth = year;
    entidadCve = entidad;
    entidadNombre = nombre;
    
    // Encontrar datos de la cohorte
    if (allData) {
      cohortData = findCohortData(allData, year, entidad);
    }
  }

  // Alternar vista de metodología
  function toggleMetodologia() {
    showMetodologia = !showMetodologia;
  }
</script>

<svelte:head>
  <title>Mi Generación en las Urnas | INE 2026</title>
</svelte:head>

<main class="app-container" role="main">
  <!-- Header -->
  <header class="app-header">
    <h1 class="app-title">Mi Generación en las Urnas</h1>
    <p class="app-subtitle">Descubre la historia de tu generación 2009–2024</p>
    <button 
      class="btn-metodologia" 
      on:click={toggleMetodologia}
      aria-label="Ver metodología y fuentes"
    >
      {showMetodologia ? 'Volver' : 'Ver Metodología'}
    </button>
  </header>

  {#if !dataLoaded}
    <!-- Loading state -->
    <div class="loading-container" role="status" aria-live="polite">
      <p>Cargando datos del INE...</p>
    </div>
  {:else if showMetodologia}
    <!-- Vista de Metodología -->
    <Metodologia on:close={toggleMetodologia} />
  {:else}
    <!-- Vista principal -->
    <div class="content-wrapper">
      <!-- F1: Selector -->
      <section class="section-selector" aria-label="Selección de año y entidad">
        <Selector on:select={handleSelection} />
      </section>

      {#if cohortData}
        <!-- Secciones con datos -->
        <div class="results-container">
          <!-- F2: Línea de Vida -->
          <section class="section-linea" aria-label="Línea de vida cívica">
            <h2>Tu Línea de Vida Cívica</h2>
            <LineaDeVida 
              data={cohortData} 
              yearOfBirth={yearOfBirth}
              entidad={entidadNombre}
            />
          </section>

          <!-- F3: Comparación -->
          <section class="section-comparacion" aria-label="Comparación generacional">
            <Comparacion 
              data={cohortData}
              allData={allData}
              yearOfBirth={yearOfBirth}
              entidad={entidadNombre}
            />
          </section>

          <!-- F4: Silla Vacía -->
          <section class="section-silla" aria-label="Visualización de participación">
            <h2>Silla Vacía: Tu Generación en 2024</h2>
            <SillaVacia 
              data={cohortData}
              entidad={entidadNombre}
            />
          </section>

          <!-- F6: Tarjeta Compartible -->
          <section class="section-tarjeta" aria-label="Descargar tarjeta compartible">
            <Tarjeta 
              cohortData={cohortData}
              yearOfBirth={yearOfBirth}
              entidad={entidadNombre}
            />
          </section>
        </div>
      {:else if yearOfBirth && entidadCve}
        <!-- Estado: datos no encontrados -->
        <div class="no-data-message" role="alert">
          <p>No se encontraron datos suficientes para tu selección.</p>
          <p class="hint">Intenta con otra entidad o año de nacimiento.</p>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Footer -->
  <footer class="app-footer">
    <p>
      <strong>Fuente:</strong> INE, Conteos Censales de Proceso Constitucional (CCPC) 2009–2024
    </p>
    <p class="footer-note">
      Hackathon INE 2026 · Reto 3: Storytelling con Datos
    </p>
  </footer>
</main>

<style>
  .app-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 1rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .app-header {
    text-align: center;
    margin-bottom: 2rem;
    padding: 2rem 1rem;
  }

  .app-title {
    font-size: clamp(1.75rem, 5vw, 3rem);
    margin-bottom: 0.5rem;
    color: var(--color-primary);
  }

  .app-subtitle {
    font-size: clamp(1rem, 3vw, 1.25rem);
    color: var(--color-text-secondary);
    margin-bottom: 1.5rem;
  }

  .btn-metodologia {
    padding: 0.75rem 1.5rem;
    background-color: var(--color-secondary);
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .btn-metodologia:hover,
  .btn-metodologia:focus {
    background-color: var(--color-secondary-dark);
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }

  .loading-container {
    text-align: center;
    padding: 4rem 1rem;
    font-size: 1.25rem;
    color: var(--color-text-secondary);
  }

  .content-wrapper {
    flex: 1;
  }

  .section-selector {
    margin-bottom: 3rem;
  }

  .results-container {
    display: flex;
    flex-direction: column;
    gap: 3rem;
  }

  .results-container section {
    padding: 2rem;
    background-color: var(--color-bg-section);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .results-container h2 {
    font-size: clamp(1.5rem, 4vw, 2rem);
    margin-bottom: 1.5rem;
    color: var(--color-primary);
  }

  .no-data-message {
    text-align: center;
    padding: 3rem 1rem;
    background-color: var(--color-bg-warning);
    border-radius: 8px;
    margin: 2rem 0;
  }

  .no-data-message p {
    font-size: 1.125rem;
    margin-bottom: 0.5rem;
  }

  .hint {
    font-size: 1rem;
    color: var(--color-text-secondary);
  }

  .app-footer {
    margin-top: 4rem;
    padding: 2rem 1rem;
    text-align: center;
    border-top: 1px solid var(--color-border);
    color: var(--color-text-secondary);
    font-size: 0.875rem;
  }

  .app-footer p {
    margin: 0.5rem 0;
  }

  .footer-note {
    font-size: 0.75rem;
    opacity: 0.8;
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
</style>
