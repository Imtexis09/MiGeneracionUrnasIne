<script>
  import { onMount, onDestroy } from 'svelte';
  import Selector from './components/Selector.svelte';
  import WelcomeTour from './components/WelcomeTour.svelte';
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

  $: resumenFrase = (participacion !== null && latestElection)
    ? `De cada 100 personas nacidas en ${yearOfBirth} que viven en ${entidadNombre}, aproximadamente ${Math.round(participacion)} votaron en ${latestElection.year}.`
    : '';
  $: comparacionFrase = deltaVsNacional === null ? '' :
    Math.abs(deltaVsNacional) < 0.5 ? 'Tu generación participa casi igual que el promedio del país.'
    : deltaVsNacional > 0 ? `Tu generación participa más que el promedio del país (${deltaVsNacional.toFixed(1)} puntos arriba).`
    : `Tu generación participa menos que el promedio del país (${Math.abs(deltaVsNacional).toFixed(1)} puntos abajo).`;

  // Estado de la aplicación
  let yearOfBirth = null;
  let entidadCve = null;
  let entidadNombre = '';
  let cohortData = null;
  let dataLoaded = false;
  let dataError = false;
  let allData = null;
  let showMetodologia = false;
  let shareStatus = '';
  let metodoBtn;
  let showTour = false;
  let mostrarKpiDetalle = false;

  const TOUR_KEY = 'welcome-tour-completado';

  // Mostrar el recorrido guiado solo en la primera visita de la sesión
  onMount(() => {
    let visto = false;
    try {
      visto = sessionStorage.getItem(TOUR_KEY) === '1';
    } catch (e) { /* modo privado: mostrar siempre */ }
    if (!visto) {
      // Esperar a que los datos estén listos para que el preview del paso 3 tenga sentido
      showTour = true;
    }
  });

  function abrirTour() {
    showTour = true;
  }

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
    mostrarKpiDetalle = false;
    
    // Encontrar datos de la cohorte
    if (allData) {
      cohortData = findCohortData(allData, year, entidad);
      if (cohortData) {
        setTimeout(() => {
          const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          document.getElementById('resultados')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        }, 150);
      }
    }
  }

  // Tema claro/oscuro
  let theme = 'dark';
  let progress = 0;
  try {
    theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  } catch (e) { /* noop */ }

  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress = max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0;
    }, { passive: true });
  }

  $: if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }

  function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark';
  }

  // Alternar vista de metodología
  function toggleMetodologia() {
    showMetodologia = !showMetodologia;
    if (!showMetodologia) {
      // Devolver el foco al botón que abrió Metodología (WCAG 2.4.3)
      requestAnimationFrame(() => metodoBtn?.focus());
    }
  }

  // Compartir
  function buildShareText() {
    const pct = participacion !== null ? formatExactPercent(participacion) : '';
    return `Mi generación (nacida en ${yearOfBirth}) participó ${pct} en ${latestElection?.year ?? '2024'} en ${entidadNombre}. #MiGeneracionEnLasUrnas`;
  }

  // 4.1 Preview del texto antes de abrir cualquier red social
  const REDES = {
    x: { nombre: 'X', icono: '𝕏' },
    facebook: { nombre: 'Facebook', icono: 'f' },
    whatsapp: { nombre: 'WhatsApp', icono: '✆' },
    instagram: { nombre: 'compartir', icono: '⤴' }
  };

  let redPendiente = null;

  // Complemento 1: mientras el modal de compartir está abierto, bloquear el
  // scroll de fondo para que la página no se desplace detrás del diálogo.
  $: bloquearScrollFondo(redPendiente !== null);

  function bloquearScrollFondo(bloquear) {
    document.body.style.overflow = bloquear ? 'hidden' : '';
  }

  onDestroy(() => bloquearScrollFondo(false));

  function pedirConfirmacion(red, boton) {
    redPendiente = red;
    btnCompartir = boton;
    requestAnimationFrame(() => document.getElementById('share-confirm')?.focus());
  }

  function confirmarCompartir() {
    const red = redPendiente;
    redPendiente = null;
    if (!red) return;

    const texto = buildShareText();

    if (red === 'x') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(texto)}`, '_blank', 'noopener');
      setShareStatus('Abriendo X con tu texto.');
    } else if (red === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href)}&quote=${encodeURIComponent(texto)}`, '_blank', 'noopener');
      setShareStatus('Abriendo Facebook con tu texto.');
    } else if (red === 'whatsapp') {
      // 4.2 Confirmar siempre el resultado de WhatsApp
      window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank', 'noopener');
      setShareStatus('Abriendo WhatsApp con tu texto. Si no se abre, copia el texto de abajo.');
    } else {
      compartirNativo(texto);
    }
  }

  function cancelarCompartir() {
    redPendiente = null;
    requestAnimationFrame(() => btnCompartir?.focus());
  }

  async function compartirNativo(texto) {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Mi Generación en las Urnas', text: texto, url: location.href });
        setShareStatus('Panel de compartir abierto con tu texto.');
      } else {
        await navigator.clipboard.writeText(texto);
        setShareStatus('Texto copiado al portapapeles. Pégalo en Instagram u otra app.');
      }
    } catch (e) {
      // Usuario canceló o error
      if (e?.name === 'AbortError') {
        setShareStatus('Compartir cancelado.');
      } else {
        setShareStatus('No se pudo compartir. Copia el texto de abajo manualmente.');
      }
    }
  }

  // 4.3 Patrón único de confirmación para los 4 botones
  function setShareStatus(msg) {
    shareStatus = msg;
    clearTimeout(timerShareStatus);
    timerShareStatus = setTimeout(() => (shareStatus = ''), 6000);
  }

  let timerShareStatus;
  let btnCompartir;

  async function copiarTextoManual() {
    try {
      await navigator.clipboard.writeText(buildShareText());
      setShareStatus('Texto copiado al portapapeles.');
    } catch (e) {
      setShareStatus('No se pudo copiar. Selecciona el texto y cópialo a mano.');
    }
  }

  </script>

<svelte:head>
  <title>Mi Generación en las Urnas</title>
</svelte:head>

<svelte:window on:keydown={(e) => e.key === 'Escape' && redPendiente && cancelarCompartir()} />

<div class="app-wrapper">
  <a href="#main-content" class="skip-link">Saltar al contenido principal</a>

  <!-- Header con logo INE -->
  <header class="top-bar">
    <div class="top-bar-content">
      <div class="logo-section">
        <img src={theme === 'dark' ? '/images/logo_ine2026.png' : '/images/logo_inev3.webp'} alt="INE 2026" class="logo-ine-img" />
      </div>
      <div class="top-bar-actions">
        <button
          class="btn-link theme-toggle"
          on:click={toggleTheme}
          aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
        >
          {#if theme === 'dark'}
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          {:else}
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          {/if}
        </button>
        <button
          class="btn-link"
          bind:this={metodoBtn}
          on:click={toggleMetodologia}
          aria-label={showMetodologia ? "Volver a mi resultado" : "Ver metodología y fuentes"}
        >
          {showMetodologia ? '← Volver a mi resultado' : 'Cómo se calculó'}
        </button>
      </div>
    </div>
    <div class="scroll-progress" aria-hidden="true">
      <div class="scroll-progress-bar" style="width: {progress}%"></div>
    </div>
  </header>

  {#if dataError}
    <main id="main-content" class="main-content" tabindex="-1">
      <div class="error-state" role="alert">
        <h2>No pudimos cargar los datos</h2>
        <p>Verifica tu conexión e intenta recargar la página. Los datos provienen de un archivo estático del INE.</p>
        <button class="btn-retry" on:click={() => location.reload()}>Reintentar</button>
      </div>
    </main>
  {:else if !dataLoaded}
    <!-- Loading state (lleva el id de destino para que el skip-link funcione
         también mientras se cargan los datos) -->
    <div id="main-content" class="loading-screen" role="status" aria-live="polite" tabindex="-1">
      <div class="loading-spinner"></div>
      <p>Cargando datos del INE… esto toma solo unos segundos.</p>
    </div>
  {:else if showMetodologia}
    <!-- Vista de Metodología -->
    <main id="main-content" class="main-content" tabindex="-1">
      <Metodologia on:close={toggleMetodologia} />
    </main>
  {:else}
    <!-- Vista principal -->
    <main id="main-content" class="main-content" tabindex="-1">
      <!-- Hero Section -->
      <section class="hero-section">
        <h1 class="hero-title">
          <span class="gradient-text">Mi Generación en las Urnas</span>
        </h1>
        <p class="hero-subtitle">
          Descubre cuántas personas de tu edad votan en México y cómo te comparas con el resto del país (elecciones 2009–2024).
        </p>

        <!-- Mad Libs Interactive Form -->
        <div class="mad-libs-container">
          <p class="mad-libs-text">
            <span class="mad-libs-label">Responde dos preguntas rápidas:</span>
          </p>
          <Selector on:select={handleSelection} />
        </div>

        {#if !cohortData}
          <ol class="how-it-works" aria-label="Cómo funciona">
            <li><strong>Elige</strong> tu año de nacimiento y tu estado.</li>
            <li><strong>Mira</strong> cuántas personas de tu edad votaron.</li>
            <li><strong>Compara</strong> y comparte tu resultado.</li>
          </ol>
        {/if}
      </section>

      {#if cohortData}
        <!-- KPI Cards Section -->
        <section id="resultados" class="kpi-section" aria-live="polite" tabindex="-1">
          <div class="resumen">
            <h2 class="resumen-title">Tu resultado</h2>
            <p class="resumen-main">{resumenFrase}</p>
          </div>

          <nav class="section-nav" aria-label="Ir a una sección">
            <a href="#grafica">Cómo cambia con la edad</a>
            <a href="#comparacion">Comparar con otras edades</a>
            <a href="#silla-vacia">Quiénes faltan en las urnas</a>
            <a href="#tarjeta">Crear imagen para compartir</a>
          </nav>

          <div class="kpi-grid">
            <!-- KPI Principal (siempre visible) -->
            <div class="kpi-card card-teal kpi-primary">
              <div class="kpi-label">
                Participaron en {latestElection ? latestElection.year : ''}
                <span class="tooltip-wrap">
                  <button class="tooltip-trigger" aria-label="¿Qué significa este número?" aria-describedby="tip-kpi1">?</button>
                  <span class="tooltip" id="tip-kpi1" role="tooltip">
                    Porcentaje de personas de tu generación en {entidadNombre} que dejaron su voto en la urna en {latestElection ? latestElection.year : '—'}.
                  </span>
                </span>
              </div>
              <div class="kpi-value">{participacion !== null ? formatExactPercent(participacion) : '—'}</div>
              <div class="kpi-meta">
                {#if deltaVsPrev !== null}
                  <span class="badge-success" class:badge-down={deltaVsPrev < 0}>
                    {deltaVsPrev >= 0 ? '▲ Subió' : '▼ Bajó'} {Math.abs(deltaVsPrev).toFixed(1)} puntos desde {prevElection.year}
                  </span>
                {:else}
                  <span>de las personas de tu edad</span>
                {/if}
              </div>
            </div>

            </div>

          <!-- 3.3 comparacionFrase a primer plano, destacado -->
          {#if comparacionFrase}
            <p class="comparacion-destacada">{comparacionFrase}</p>
          {/if}

          <!-- 3.1 Progressive disclosure: detalle secundario oculto por defecto -->
          <div class="kpi-detail">
            <button
              class="btn-reveal"
              on:click={() => (mostrarKpiDetalle = !mostrarKpiDetalle)}
              aria-expanded={mostrarKpiDetalle}
              aria-controls="kpi-secundarios"
            >
              {mostrarKpiDetalle ? 'Ocultar los otros indicadores' : 'Ver los otros 2 indicadores'}
              <span class="chevron" class:open={mostrarKpiDetalle} aria-hidden="true">▾</span>
            </button>

            <div class="kpi-grid kpi-grid-sec" id="kpi-secundarios" hidden={!mostrarKpiDetalle}>
              <!-- Card 2: Abstencionismo -->
              <div class="kpi-card card-red">
                <div class="kpi-label">
                  No votar
                  <span class="tooltip-wrap">
                    <button class="tooltip-trigger" aria-label="¿Qué significa este número?" aria-describedby="tip-kpi2">?</button>
                    <span class="tooltip" id="tip-kpi2" role="tooltip">
                      El complemento del indicador principal: la parte de tu generación que no votó en {latestElection ? latestElection.year : '—'}.
                    </span>
                  </span>
                </div>
                <div class="kpi-value">{abstencion !== null ? formatExactPercent(abstencion) : '—'}</div>
                <div class="kpi-meta">
                  <span>se quedaron sin votar en {latestElection ? latestElection.year : '—'}</span>
                </div>
              </div>

              <!-- Card 3: vs Promedio Nacional -->
              <div class="kpi-card card-blue">
                <div class="kpi-label">
                  {entidadNombre} vs. todo México
                  <span class="tooltip-wrap">
                    <button class="tooltip-trigger" aria-label="¿Qué significa este número?" aria-describedby="tip-kpi3">?</button>
                    <span class="tooltip" id="tip-kpi3" role="tooltip">
                      Diferencia en puntos porcentuales entre tu generación en {entidadNombre} y el promedio de todo el país, en la misma elección.
                    </span>
                  </span>
                </div>
                <div class="kpi-value">
                  {#if deltaVsNacional !== null}
                    {deltaVsNacional >= 0 ? '+' : ''}{deltaVsNacional.toFixed(1)} puntos
                  {:else}
                    —
                  {/if}
                </div>
                <div class="kpi-meta">
                  <span>
                    {#if nacionalLatest != null}
                      respecto al promedio nacional ({formatExactPercent(nacionalLatest)})
                    {:else}
                      Sin referencia nacional disponible
                    {/if}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Dashboard Interactivo -->
        <section class="dashboard-section">
          <div class="dashboard-container">
            <!-- Filtros Activos (Sidebar en desktop) -->
            <aside class="filters-sidebar">
              <h3 class="filters-title">Tu selección</h3>
              <div class="filter-group">
                <div class="filter-item">
                  <span class="filter-label">Año de nacimiento</span>
                  <span class="filter-value">{yearOfBirth ?? '—'}</span>
                </div>
                <div class="filter-item">
                  <span class="filter-label">Estado</span>
                  <span class="filter-value">{entidadNombre || '—'}</span>
                </div>
                <div class="filter-item">
                  <span class="filter-label">Generación comparada</span>
                  <span class="filter-value">
                    {cohortData ? `nacidos entre ${cohortData.year_of_birth_min} y ${cohortData.year_of_birth_max}` : '—'}
                  </span>
                </div>
              </div>

              <!-- Hallazgos Clave -->
              <div class="insights-box">
                <h4>Dato curioso</h4>
                <p class="insight-text">
                  Muchas personas votan por primera vez a los 18 y después dejan de hacerlo en sus 20s.
                </p>
                <button class="btn-insight" on:click={toggleMetodologia}>Ver cómo se calculó</button>
              </div>

              <!-- Compartir -->
              <div class="share-box">
                <h4>Compartir mi resultado</h4>
                <p class="share-text">Envíalo a tus amigos y familia.</p>
                <div class="social-buttons">
                  <button class="btn-social twitter" aria-label="Compartir en X" on:click={(e) => pedirConfirmacion('x', e.currentTarget)}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg><span class="social-label">X</span>
                  </button>
                  <button class="btn-social facebook" aria-label="Compartir en Facebook" on:click={(e) => pedirConfirmacion('facebook', e.currentTarget)}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/></svg><span class="social-label">Facebook</span>
                  </button>
                  <button class="btn-social instagram" aria-label="Compartir en Instagram" on:click={(e) => pedirConfirmacion('instagram', e.currentTarget)}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077"/></svg><span class="social-label">Instagram</span>
                  </button>
                  <button class="btn-social whatsapp" aria-label="Compartir en WhatsApp" on:click={(e) => pedirConfirmacion('whatsapp', e.currentTarget)}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg><span class="social-label">WhatsApp</span>
                  </button>
                </div>
                <button class="btn-generate-story" on:click={() => document.getElementById('tarjeta')?.scrollIntoView({ behavior: 'smooth' })}>Generar y descargar tarjeta PNG 1080×1350</button>

                <!-- 4.4 Confirmación visible (no solo para lectores de pantalla) -->
                {#if shareStatus}
                  <p class="share-feedback" role="status" aria-live="polite">
                    {shareStatus}
                  </p>
                {/if}

                <button class="btn-copy-text" on:click={copiarTextoManual}>
                  Copiar texto del resultado
                </button>
              </div>
            </aside>

            <!-- Gráfica Principal -->
            <div class="chart-main" id="grafica">
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
        <a href="/data/reporte_validacion.md" target="_blank" rel="noopener">Reporte de Validación</a>
      </div>
      <div class="footer-right">
        <button class="footer-btn-tour" on:click={abrirTour}>¿Cómo funciona? Ver la guía</button>
        <span class="separator">•</span>
        <span>Proyecto de Datos Abiertos · Fuente: INE</span>
      </div>
    </div>
  </footer>

  {#if showTour}
    <WelcomeTour
      yearOfBirth={yearOfBirth}
      entidadNombre={entidadNombre}
      participacion={participacion}
      anioEleccion={latestElection ? latestElection.year : null}
      on:close={() => (showTour = false)}
    />
  {/if}
</div>

<!-- 4.1 Preview del texto antes de abrir la red social.
     IMPORTANTE: este modal vive fuera de `.filters-sidebar` a propósito.
     `.filters-sidebar` usa `position: sticky`, que crea un contexto de
     apilamiento; si el modal estuviera dentro, su `z-index` quedaría
     atrapado y la gráfica (con elementos posicionados posteriores en el
     árbol) lo taparía. -->
{#if redPendiente}
  <div class="share-modal-backdrop" role="presentation" on:click|self={cancelarCompartir}>
    <div
      class="share-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      id="share-confirm"
    >
      <h4 id="share-modal-title">Compartir en {REDES[redPendiente].nombre}</h4>
      <p class="share-modal-desc">
        Este es el texto exacto que se publicará. Puedes cancelarlo si no quieres compartirlo.
      </p>
      <blockquote class="share-preview" id="share-preview-text">
        {buildShareText()}
      </blockquote>
      <div class="share-modal-actions">
        <button class="btn-cancel" on:click={cancelarCompartir}>Cancelar</button>
        <button class="btn-confirm" on:click={confirmarCompartir}>
          Continuar a {REDES[redPendiente].nombre}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* App Wrapper - Fondo oscuro */
  .app-wrapper {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    background-color: var(--color-bg);
    color: var(--color-text);
    /* La top-bar ahora es `sticky` (participa del flujo), así que ya no se
       reserva espacio con un padding hard-codeado. Esto evita que la barra
       tape contenido cuando la barra pasa a dos líneas en pantallas angostas. */
    transition: background-color var(--transition-base), color var(--transition-base);
  }

  /* Los hijos de un contenedor flex tienen `min-width: auto`, que se resuelve
     al tamaño mínimo de contenido del elemento. Sin esta red de seguridad,
     cualquier descendiente con un ancho mínimo grande (por ejemplo una
     retícula con pistas de 200px) estiraba `main` por encima del viewport y
     `overflow-x: clip` recortaba el resto sin dejar forma de verlo.
     `min-width: 0` desactiva ese mínimo automático. */
  .app-wrapper > * {
    min-width: 0;
  }

  /* Top Bar */
  .top-bar {
    background-color: var(--color-bg-section);
    border-bottom: 1px solid var(--color-border);
    padding: 1rem 0;
    /* `sticky` en vez de `fixed`: participa del flujo, su altura es dinámica
       (puede envolver en pantallas angostas) y no requiere reservar espacio
       con un padding fijo que se desincroniza. */
    position: sticky;
    top: 0;
    z-index: 1100;
    box-shadow: var(--shadow-md);
  }

  .scroll-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: transparent;
  }


  .scroll-progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #D8005F, #4F46E5);
    transition: width 0.1s linear;
  }

  .top-bar-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem 1rem;
  }

  .logo-section {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .logo-ine-img {
    height: 36px;
    width: auto;
    max-width: 180px;
    object-fit: contain;
  }

  .top-bar-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    align-items: center;
    gap: 0.5rem;
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
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .theme-toggle {
    color: var(--color-text);
    border: 1px solid var(--color-border);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    padding: 0;
  }

  .btn-link:hover {
    color: var(--color-text);
    background-color: rgba(255, 255, 255, 0.05);
  }

  /* Foco visible explícito en botones con estilos scoped (WCAG 2.4.7) */
  .btn-link:focus-visible,
  .theme-toggle:focus-visible,
  .btn-insight:focus-visible,
  .btn-social:focus-visible,
  .btn-retry:focus-visible,
  .btn-generate-story:focus-visible {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }

  /* Main Content */
  .main-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
    flex: 1 0 auto;
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
    background: var(--gradient-hero);
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
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
    gap: 1.5rem;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
  }

  .kpi-card {
    background: var(--gradient-card);
    border-radius: 12px;
    padding: 2rem;
    border: 1px solid var(--color-border);
    /* Es un grid item: su `min-width: auto` equivale al ancho mínimo de su
       contenido, que aquí fija el `.kpi-value` de 3rem. Sin `min-width: 0` la
       pista no puede encogerse y las tarjetas de "los otros indicadores"
       ensanchaban el documento entero al mostrarse. */
    min-width: 0;
    transition: transform 0.2s, box-shadow 0.2s, background-color var(--transition-base);
  }

  .section-card {
    background: var(--gradient-card);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    box-shadow: var(--shadow-md);
    animation: fadeInUp 0.4s ease-out;
    transition: background-color var(--transition-base), border-color var(--transition-base);
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .kpi-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
  }

  .card-teal { border-left: 4px solid #14B8A6; }
  .card-red { border-left: 4px solid #DC2626; }
  .card-blue { border-left: 4px solid #3B82F6; }

  /* ===== Fase 3: progressive disclosure + tooltips ===== */
  .kpi-primary { max-width: 560px; margin: 0 auto; text-align: center; padding: 2.5rem 2rem; }
  .kpi-primary .kpi-label { display: inline-flex; align-items: center; gap: 0.5rem; }
  .kpi-primary .kpi-value { font-size: clamp(3rem, 9vw, 4.5rem); }
  .kpi-primary .kpi-meta { justify-content: center; }

  .kpi-grid-sec { margin-top: 1.5rem; }
  .kpi-detail { max-width: 1200px; margin: 1.5rem auto 0; text-align: center; }

  .btn-reveal {
    background: var(--color-bg-section);
    border: 1px solid var(--color-border);
    color: var(--color-text);
    padding: 0.7rem 1.4rem;
    min-height: 44px;
    border-radius: 999px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }
  .btn-reveal:hover { border-color: var(--color-primary); }
  .btn-reveal:focus-visible { outline: 3px solid var(--color-focus); outline-offset: 2px; }
  .chevron { display: inline-block; transition: transform 0.2s; }
  .chevron.open { transform: rotate(180deg); }

  .comparacion-destacada {
    max-width: 760px;
    margin: 1.25rem auto 0;
    padding: 1.1rem 1.4rem;
    text-align: center;
    font-size: clamp(1.05rem, 2.2vw, 1.3rem);
    font-weight: 600;
    line-height: 1.45;
    color: var(--color-text);
    background: var(--color-bg-section);
    border: 1px solid var(--color-border);
    border-left: 4px solid #3B82F6;
    border-radius: 12px;
  }

  /* Tooltips */
  .tooltip-wrap { position: relative; display: inline-flex; vertical-align: middle; }
  .tooltip-trigger {
    width: 1.15rem;
    height: 1.15rem;
    border-radius: 50%;
    border: 1px solid var(--color-text-muted);
    background: transparent;
    color: var(--color-text-muted);
    font-size: 0.7rem;
    font-weight: 700;
    line-height: 1;
    cursor: help;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .tooltip-trigger:hover { color: var(--color-text); border-color: var(--color-text); }
  .tooltip-trigger:focus-visible { outline: 3px solid var(--color-focus); outline-offset: 2px; }
  .tooltip {
    position: absolute;
    bottom: calc(100% + 0.6rem);
    left: 50%;
    transform: translateX(-50%);
    width: max-content;
    max-width: min(280px, 70vw);
    background: var(--color-bg-alt);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 0.6rem 0.8rem;
    font-size: 0.8rem;
    font-weight: 400;
    line-height: 1.45;
    text-transform: none;
    letter-spacing: normal;
    box-shadow: var(--shadow-md);
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.15s ease;
    z-index: 10;
    pointer-events: none;
  }
  .tooltip-wrap:hover .tooltip,
  .tooltip-trigger:focus-visible + .tooltip {
    opacity: 1;
    visibility: visible;
  }

  /* En pantallas angostas el tooltip centrado (translateX(-50%)) puede
     salirse del viewport si el disparador está junto a un borde. Se ancla a
     la izquierda del disparador y se limita al ancho visible. */
  @media (max-width: 640px) {
    .tooltip { left: 0; transform: none; max-width: min(280px, 85vw); }
  }

  @media (prefers-reduced-motion: reduce) {
    .tooltip { transition: none; }
    .chevron { transition: none; }
  }

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
    background-color: var(--color-badge-success-bg);
    color: var(--color-badge-success);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-weight: 600;
  }

  .badge-down {
    background-color: var(--color-badge-down-bg);
    color: var(--color-badge-down);
  }

  /* Dashboard Section */
  .dashboard-section {
    margin-bottom: 3rem;
  }

  .dashboard-container {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 2rem;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
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
    width: 44px;
    height: 44px;
    border-radius: 6px;
    border: 1px solid var(--color-border);
    background: var(--color-bg-alt);
    color: var(--color-text);
    cursor: pointer;
    font-size: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s, background-color 0.2s;
  }

  .btn-social:hover {
    transform: scale(1.1);
    background: var(--color-primary);
    color: #fff;
  }

  .social-buttons svg {
    display: block;
    width: 18px;
    height: 18px;
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

  .how-it-works { list-style: none; counter-reset: paso; display: grid; grid-template-columns: 1fr; gap: 1rem; max-width: 900px; margin: 2rem auto 0; text-align: left; }
  /* Las 3 columnas de 200px necesitan 632px (3×200 + 2×16 de gap). Por debajo
     de 768px no caben: con `repeat(auto-fit, minmax(200px, 1fr))` sin
     condicionar, el mínimo de contenido era 632px y estiraba toda la página.
     En móvil, una sola columna. Mismo breakpoint `md` que responsive.css. */
  @media (min-width: 768px) { .how-it-works { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); } }
  .how-it-works li { counter-increment: paso; display: flex; gap: 0.75rem; align-items: flex-start; padding: 1rem; background: var(--color-bg-section); border: 1px solid var(--color-border); border-radius: 10px; color: var(--color-text-secondary); }
  .how-it-works li::before { content: counter(paso); flex-shrink: 0; width: 1.75rem; height: 1.75rem; border-radius: 50%; background: var(--color-primary); color: #fff; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; }
  .resumen { max-width: 1200px; margin: 0 auto 1.5rem; padding: 1.5rem; border-radius: 12px; background: var(--color-bg-section); border: 1px solid var(--color-border); border-left: 4px solid var(--color-primary); }
  .resumen-title { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-text-muted); margin-bottom: 0.5rem; }
  .resumen-main { font-size: clamp(1.15rem, 2.5vw, 1.6rem); font-weight: 700; line-height: 1.35; color: var(--color-text); }
  .section-nav { max-width: 1200px; margin: 0 auto 1.5rem; display: flex; flex-wrap: wrap; gap: 0.5rem; }
  .section-nav a { padding: 0.55rem 1rem; min-height: 44px; display: inline-flex; align-items: center; border: 1px solid var(--color-border); border-radius: 999px; color: var(--color-text); text-decoration: none; font-size: 0.9rem; font-weight: 500; background: var(--color-bg-section); }
  .section-nav a:hover { border-color: var(--color-primary); }
  .section-nav a:focus-visible { outline: 3px solid var(--color-focus); outline-offset: 2px; }
  .btn-social { width: auto; min-width: 44px; padding: 0 0.75rem; gap: 0.4rem; }
  .social-label { font-size: 0.8rem; font-weight: 600; }
  .social-buttons { flex-wrap: wrap; }
  .btn-generate-story { padding: 0.8rem; font-size: 0.9rem; min-height: 44px; }
  .btn-insight { font-size: 0.85rem; min-height: 32px; }
  .insight-text, .share-text { font-size: 0.875rem; }
  .btn-link { min-height: 44px; font-size: 0.95rem; }
  .filters-sidebar { position: static; }
  @media (min-width: 1025px) { .filters-sidebar { position: sticky; } }
  @media (max-width: 640px) { .top-bar-content, .main-content { padding-left: 1rem; padding-right: 1rem; } .top-bar-content { justify-content: center; } .hero-section { padding: 2rem 0.5rem; } .kpi-value { font-size: 2.5rem; } }

  /* Chart Main */
  .chart-main {
    background: var(--color-bg-section);
    border-radius: 12px;
    padding: 1.5rem;
    border: 1px solid var(--color-border);
    /* En un grid, el item tiene min-width:auto por defecto y puede
       expandirse por encima de `1fr` si su contenido es ancho,
       provocando scroll horizontal. min-width:0 lo impide. */
    min-width: 0;
  }

  /* Additional Sections */
  .additional-sections {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    align-items: center;
    width: 100%;
  }

  .additional-sections .section-card {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
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
    padding: 1.5rem 2rem;
    flex-shrink: 0;
  }

  .footer-content {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem 1rem;
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  .footer-left,
  .footer-right {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
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

  /* En pantallas angostas los dos grupos del footer se apilan y se centran
     para que el ancho del documento no crezca por el texto más largo. */
  @media (max-width: 640px) {
    .app-footer {
      padding: 1.5rem 1rem;
    }

    .footer-content {
      flex-direction: column;
      text-align: center;
    }
  }

  .separator {
    opacity: 0.5;
  }

  /* ===== Plan Tarjeta: preview y confirmación de compartir ===== */
  .share-feedback {
    margin-top: 0.75rem;
    padding: 0.6rem 0.8rem;
    background: rgba(16, 185, 129, 0.12);
    border: 1px solid var(--color-success);
    border-radius: 6px;
    font-size: 0.85rem;
    line-height: 1.45;
    color: var(--color-text);
  }

  .btn-copy-text {
    margin-top: 0.6rem;
    width: 100%;
    background: none;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    padding: 0.5rem;
    min-height: 36px;
    font-size: 0.8rem;
    color: var(--color-text-secondary);
    cursor: pointer;
  }
  .btn-copy-text:hover { color: var(--color-text); border-color: var(--color-primary); }
  .btn-copy-text:focus-visible { outline: 3px solid var(--color-focus); outline-offset: 2px; }

  .share-modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    /* Por encima de la barra superior fija (1100) y del WelcomeTour (2000) */
    z-index: 2500;
  }

  .share-modal {
    background: var(--color-bg-section);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    padding: 1.5rem;
    max-width: 460px;
    width: 100%;
    /* Complemento 2: en pantallas cortas el texto no debe salirse del viewport */
    max-height: calc(100vh - 3rem);
    max-height: calc(100dvh - 3rem);
    overflow-y: auto;
    box-shadow: var(--shadow-md);
  }

  .share-modal:focus { outline: none; }

  .share-modal h4 {
    font-size: 1.1rem;
    color: var(--color-text);
    margin-bottom: 0.5rem;
  }

  .share-modal-desc {
    font-size: 0.85rem;
    color: var(--color-text-secondary);
    line-height: 1.5;
    margin-bottom: 1rem;
  }

  .share-preview {
    margin: 0 0 1.25rem;
    padding: 1rem;
    background: var(--color-bg-alt);
    border: 1px solid var(--color-border);
    border-left: 4px solid var(--color-primary);
    border-radius: 8px;
    font-size: 0.95rem;
    line-height: 1.5;
    color: var(--color-text);
  }

  .share-modal-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
    flex-wrap: wrap;
  }

  .btn-cancel {
    background: none;
    border: 1px solid var(--color-border);
    color: var(--color-text);
    padding: 0.65rem 1.25rem;
    min-height: 44px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
  }

  .btn-confirm {
    background: var(--gradient-primary);
    border: none;
    color: #fff;
    padding: 0.65rem 1.5rem;
    min-height: 44px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
  }

  .btn-cancel:focus-visible,
  .btn-confirm:focus-visible {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }

  .footer-btn-tour {
    background: none;
    border: none;
    padding: 0.5rem 0.25rem;
    color: var(--color-text-secondary);
    font-size: 0.75rem;
    cursor: pointer;
    text-decoration: underline;
    font-family: inherit;
  }

  .footer-btn-tour:hover {
    color: var(--color-text);
  }

  .footer-btn-tour:focus-visible {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }

  /* Loading Screen */
  .loading-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    min-height: 100dvh;
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
