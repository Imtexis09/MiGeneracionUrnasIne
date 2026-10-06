<script>
  import { onMount } from 'svelte';
  import Selector from './components/Selector.svelte';
  import LineaDeVida from './components/LineaDeVida.svelte';
  import Comparacion from './components/Comparacion.svelte';
  import SillaVacia from './components/SillaVacia.svelte';
  import Tarjeta from './components/Tarjeta.svelte';
  import Metodologia from './components/Metodologia.svelte';
  import { loadData } from './utils/data.js';
  import { findCohortData, getLatestElection } from './utils/calculos.js';
  import { formatExactPercent } from './utils/formato.js';

  // KPIs calculados con datos reales de la cohorte
  $: latestElection = cohortData ? getLatestElection(cohortData.elections) : null;
  $: prevElection = cohortData && latestElection
    ? cohortData.elections
        .filter(e => e.year < latestElection.year && e.type === latestElection.type)
        .sort((a, b) => b.year - a.year)[0] || null
    : null;
  $: nacionalLatest = (allData && latestElection && allData.meta?.nacional_participacion)
    ? allData.meta.nacional_participacion[latestElection.year]
    : null;
  $: participacion = latestElection ? latestElection.participacion_pct : null;
  $: abstencion = participacion !== null ? 100 - participacion : null;
  $: deltaVsPrev = (participacion !== null && prevElection) ? participacion - prevElection.participacion_pct : null;
  $: deltaVsNacional = (participacion !== null && nacionalLatest != null) ? participacion - nacionalLatest : null;

  // Estado de la aplicación
  let yearOfBirth = null;
  let entidadCve = null;
  let entidadNombre = '';
  let cohortData = null;
  let dataLoaded = false;
  let dataError = false;
  let allData = null;
  let showMetodologia = false;

  // Cargar datos al montar
  onMount(async () => {
    try {
      allData = await loadData();
      dataLoaded = true;
    } catch (error) {
      console.error('Error cargando datos:', error);
      dataError = true;
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

  // Compartir
  function buildShareText() {
    const pct = participacion !== null ? formatExactPercent(participacion) : '';
    return `Mi generación (nacida en ${yearOfBirth}) participó ${pct} en ${latestElection?.year ?? '2024'} en ${entidadNombre}. #MiGeneracionEnLasUrnas`;
  }

  function shareX() {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(buildShareText())}`, '_blank', 'noopener');
  }

  function shareWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(buildShareText())}`, '_blank', 'noopener');
  }

  async function shareNative() {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Mi Generación en las Urnas', text: buildShareText(), url: location.href });
      } else {
        await navigator.clipboard.writeText(buildShareText());
        alert('Texto copiado. Pégalo en Instagram u otra app.');
      }
    } catch (e) {
      // Usuario canceló o error: no hacer nada
    }
  }
</script>

<svelte:head>
  <title>Mi Generación en las Urnas | Hackathon INE 2026</title>
</svelte:head>

<div class="app-wrapper">
  <a href="#main-content" class="skip-link">Saltar al contenido principal</a>

  <!-- Header con logo INE -->
  <header class="top-bar">
    <div class="top-bar-content">
      <div class="logo-section">
        <span class="logo-ine">🗳️ INE</span>
        <span class="badge">HACKATHON INE • RETO 3</span>
      </div>
      <button 
        class="btn-link" 
        on:click={toggleMetodologia}
        aria-label="Ver metodología y fuentes"
      >
        {showMetodologia ? '← Volver' : 'Metodología'}
      </button>
    </div>
  </header>

  {#if dataError}
    <main id="main-content" class="main-content">
      <div class="error-state" role="alert">
        <h2>No pudimos cargar los datos</h2>
        <p>Verifica tu conexión e intenta recargar la página. Los datos provienen de un archivo estático del INE.</p>
        <button class="btn-retry" on:click={() => location.reload()}>Reintentar</button>
      </div>
    </main>
  {:else if !dataLoaded}
    <!-- Loading state -->
    <div class="loading-screen" role="status" aria-live="polite">
      <div class="loading-spinner"></div>
      <p>Cargando datos del INE...</p>
    </div>
  {:else if showMetodologia}
    <!-- Vista de Metodología -->
    <main id="main-content" class="main-content">
      <Metodologia on:close={toggleMetodologia} />
    </main>
  {:else}
    <!-- Vista principal -->
    <main id="main-content" class="main-content">
      <!-- Hero Section -->
      <section class="hero-section">
        <h1 class="hero-title">
          <span class="gradient-text">Mi Generación en las Urnas</span>
        </h1>
        <p class="hero-subtitle">
          Descubre el peso electoral y la participación de tu edad (2009—2024)
        </p>

        <!-- Mad Libs Interactive Form -->
        <div class="mad-libs-container">
          <p class="mad-libs-text">
            <span class="mad-libs-label">¿Qué tan activa es tu edad en las urnas?</span>
          </p>
          <Selector on:select={handleSelection} />
        </div>
      </section>

      {#if cohortData}
        <!-- KPI Cards Section -->
        <section class="kpi-section">
          <div class="kpi-grid">
            <!-- Card 1: Tu Cohorte -->
            <div class="kpi-card card-teal">
              <div class="kpi-label">Tu Cohorte · {latestElection ? latestElection.year : ''}</div>
              <div class="kpi-value">{participacion !== null ? formatExactPercent(participacion) : '—'}</div>
              <div class="kpi-meta">
                {#if deltaVsPrev !== null}
                  <span class="badge-success" class:badge-down={deltaVsPrev < 0}>
                    {deltaVsPrev >= 0 ? '+' : ''}{deltaVsPrev.toFixed(1)} pts vs {prevElection.year}
                  </span>
                {/if}
                <span>Participación</span>
              </div>
            </div>

            <!-- Card 2: Abstencionismo -->
            <div class="kpi-card card-red">
              <div class="kpi-label">Abstencionismo</div>
              <div class="kpi-value">{abstencion !== null ? formatExactPercent(abstencion) : '—'}</div>
              <div class="kpi-meta">
                <span>No votó en {latestElection ? latestElection.year : '—'}</span>
              </div>
            </div>

            <!-- Card 3: vs Promedio Nacional -->
            <div class="kpi-card card-blue">
              <div class="kpi-label">Tu Estado: {entidadNombre}</div>
              <div class="kpi-value">
                {#if deltaVsNacional !== null}
                  {deltaVsNacional >= 0 ? '+' : ''}{deltaVsNacional.toFixed(1)} pts
                {:else}
                  —
                {/if}
              </div>
              <div class="kpi-meta">
                <span>
                  {#if nacionalLatest != null}
                    vs promedio nacional ({formatExactPercent(nacionalLatest)})
                  {:else}
                    Sin referencia nacional disponible
                  {/if}
                </span>
              </div>
            </div>
          </div>
        </section>

        <!-- Dashboard Interactivo -->
        <section class="dashboard-section">
          <div class="dashboard-container">
            <!-- Filtros Activos (Sidebar en desktop) -->
            <aside class="filters-sidebar">
              <h3 class="filters-title">Filtros Activos</h3>
              <div class="filter-group">
                <div class="filter-item">
                  <span class="filter-label">Año de nacimiento</span>
                  <span class="filter-value">{yearOfBirth ?? '—'}</span>
                </div>
                <div class="filter-item">
                  <span class="filter-label">Entidad</span>
                  <span class="filter-value">{entidadNombre || '—'}</span>
                </div>
                <div class="filter-item">
                  <span class="filter-label">Cohorte</span>
                  <span class="filter-value">
                    {cohortData ? `${cohortData.year_of_birth_min}–${cohortData.year_of_birth_max}` : '—'}
                  </span>
                </div>
              </div>

              <!-- Hallazgos Clave -->
              <div class="insights-box">
                <h4>Hallazgos Clave</h4>
                <p class="insight-text">
                  ¿Qué pasa a los 20s? La participación cae drásticamente tras la primera elección...
                </p>
                <button class="btn-insight" on:click={toggleMetodologia}>Leer análisis completo</button>
              </div>

              <!-- Compartir -->
              <div class="share-box">
                <h4>Compartir</h4>
                <p class="share-text">¡Haz que se escuche!</p>
                <div class="social-buttons">
                  <button class="btn-social twitter" aria-label="Compartir en X" on:click={shareX}>𝕏</button>
                  <button class="btn-social instagram" aria-label="Compartir en Instagram" on:click={shareNative}>📷</button>
                  <button class="btn-social whatsapp" aria-label="Compartir en WhatsApp" on:click={shareWhatsApp}>💬</button>
                </div>
                <button class="btn-generate-story" on:click={() => document.getElementById('tarjeta')?.scrollIntoView({ behavior: 'smooth' })}>Generar tarjeta para Stories</button>
              </div>
            </aside>

            <!-- Gráfica Principal -->
            <div class="chart-main">
              <LineaDeVida
                data={cohortData}
                entidad={entidadNombre}
              />
            </div>
          </div>
        </section>

        <!-- Secciones adicionales -->
        <div class="additional-sections">
          <section id="comparacion" class="section-card">
            <Comparacion
              data={cohortData}
              allData={allData}
              yearOfBirth={yearOfBirth}
            />
          </section>

          <section id="silla-vacia" class="section-card">
            <SillaVacia
              data={cohortData}
              entidad={entidadNombre}
            />
          </section>

          <section id="tarjeta" class="section-card">
            <Tarjeta
              cohortData={cohortData}
              entidad={entidadNombre}
            />
          </section>
        </div>
      {/if}
    </main>
  {/if}

  <!-- Footer -->
  <footer class="app-footer">
    <div class="footer-content">
      <div class="footer-left">
        <a href="#metodologia" on:click|preventDefault={toggleMetodologia}>
          Datos Abiertos de Conteos Censales del INE
        </a>
        <span class="separator">•</span>
        <a href="#validacion">Reporte de Validación</a>
      </div>
      <div class="footer-right">
        <span>Equipo de 2 Personas • Proyecto de Datos Abiertos</span>
      </div>
    </div>
  </footer>
</div>

<style>
  /* App Wrapper - Fondo oscuro */
  .app-wrapper {
    min-height: 100vh;
    background-color: var(--color-bg);
    color: var(--color-text);
  }

  /* Top Bar */
  .top-bar {
    background-color: var(--color-bg-section);
    border-bottom: 1px solid var(--color-border);
    padding: 1rem 0;
    position: sticky;
    top: 0;
    z-index: 1000;
    backdrop-filter: blur(10px);
  }

  .top-bar-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo-section {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .logo-ine {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text);
  }

  .badge {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .btn-link {
    background: none;
    border: none;
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: all 0.2s;
  }

  .btn-link:hover {
    color: var(--color-text);
    background-color: rgba(255, 255, 255, 0.05);
  }

  /* Main Content */
  .main-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
  }

  /* Hero Section */
  .hero-section {
    text-align: center;
    padding: 4rem 2rem;
    margin-bottom: 3rem;
  }

  .hero-title {
    font-size: clamp(2.5rem, 6vw, 4rem);
    font-weight: 800;
    margin-bottom: 1rem;
    line-height: 1.1;
  }

  .gradient-text {
    background: linear-gradient(135deg, #D946EF 0%, #4F46E5 50%, #06B6D4 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-subtitle {
    font-size: clamp(1rem, 2vw, 1.25rem);
    color: var(--color-text-secondary);
    margin-bottom: 3rem;
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
  }

  /* Mad Libs Container */
  .mad-libs-container {
    max-width: 900px;
    margin: 0 auto;
  }

  .mad-libs-text {
    font-size: 1.125rem;
    color: var(--color-text);
    margin-bottom: 2rem;
  }

  .mad-libs-label {
    color: var(--color-text-secondary);
  }

  /* KPI Section */
  .kpi-section {
    margin-bottom: 3rem;
  }

  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  .kpi-card {
    background: var(--gradient-card);
    border-radius: 12px;
    padding: 2rem;
    border: 1px solid var(--color-border);
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .kpi-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
  }

  .card-teal { border-left: 4px solid #14B8A6; }
  .card-red { border-left: 4px solid #DC2626; }
  .card-blue { border-left: 4px solid #3B82F6; }

  .kpi-label {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .kpi-value {
    font-size: 3rem;
    font-weight: 800;
    font-family: 'Outfit', sans-serif;
    color: var(--color-text);
    line-height: 1;
    margin-bottom: 1rem;
  }

  .kpi-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--color-text-secondary);
  }

  .badge-success {
    background-color: rgba(16, 185, 129, 0.2);
    color: #10B981;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-weight: 600;
  }

  .badge-down {
    background-color: rgba(239, 68, 68, 0.2);
    color: #F87171;
  }

  /* Dashboard Section */
  .dashboard-section {
    margin-bottom: 3rem;
  }

  .dashboard-container {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 2rem;
  }

  @media (max-width: 1024px) {
    .dashboard-container {
      grid-template-columns: 1fr;
    }
  }

  /* Filters Sidebar */
  .filters-sidebar {
    background: var(--color-bg-section);
    border-radius: 12px;
    padding: 1.5rem;
    border: 1px solid var(--color-border);
    height: fit-content;
    position: sticky;
    top: 100px;
  }

  .filters-title {
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-text);
    margin-bottom: 1.5rem;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .filter-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .filter-label {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    text-transform: uppercase;
    font-weight: 600;
  }

  .filter-value {
    color: var(--color-text);
    font-size: 0.95rem;
    font-weight: 600;
  }

  /* Insights Box */
  .insights-box,
  .share-box {
    background: rgba(79, 70, 229, 0.1);
    border: 1px solid rgba(79, 70, 229, 0.3);
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1.5rem;
  }

  .insights-box h4,
  .share-box h4 {
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--color-text);
    margin-bottom: 0.5rem;
  }

  .insight-text,
  .share-text {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    line-height: 1.5;
    margin-bottom: 0.75rem;
  }

  .btn-insight {
    font-size: 0.75rem;
    color: var(--color-secondary);
    background: none;
    border: none;
    cursor: pointer;
    text-decoration: underline;
    padding: 0;
  }

  /* Social Buttons */
  .social-buttons {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .btn-social {
    width: 36px;
    height: 36px;
    border-radius: 6px;
    border: 1px solid var(--color-border);
    background: var(--color-bg);
    cursor: pointer;
    font-size: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s;
  }

  .btn-social:hover {
    transform: scale(1.1);
  }

  .btn-generate-story {
    width: 100%;
    background: var(--gradient-primary);
    color: white;
    border: none;
    padding: 0.625rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .btn-generate-story:hover {
    opacity: 0.9;
  }

  /* Chart Main */
  .chart-main {
    background: var(--color-bg-section);
    border-radius: 12px;
    padding: 2rem;
    border: 1px solid var(--color-border);
  }

  /* Additional Sections */
  .additional-sections {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .section-card {
    background: var(--gradient-card);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    box-shadow: var(--shadow-md);
  }

  /* Error State */
  .error-state {
    text-align: center;
    padding: 4rem 2rem;
  }

  .error-state h2 {
    color: var(--color-error);
    margin-bottom: 1rem;
  }

  .error-state p {
    color: var(--color-text-secondary);
    max-width: 480px;
    margin: 0 auto 1.5rem;
  }

  .btn-retry {
    background: var(--gradient-primary);
    color: white;
    border: none;
    padding: 0.75rem 2rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
  }

  /* Footer */
  .app-footer {
    background: var(--color-bg-section);
    border-top: 1px solid var(--color-border);
    padding: 2rem;
    margin-top: 4rem;
  }

  .footer-content {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  .footer-left,
  .footer-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .footer-left a {
    color: var(--color-text-secondary);
    text-decoration: none;
  }

  .footer-left a:hover {
    color: var(--color-text);
    text-decoration: underline;
  }

  .separator {
    opacity: 0.5;
  }

  /* Loading Screen */
  .loading-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    gap: 1rem;
  }

  .loading-spinner {
    width: 48px;
    height: 48px;
    border: 4px solid rgba(255, 255, 255, 0.1);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
</style>
