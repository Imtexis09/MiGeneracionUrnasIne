<script>
  /**
   * Orquestador de la Web Story.
   *
   * La app se compone de 5 slides secuenciales (ver `components/slides/`).
   * Este archivo mantiene el estado global (datos del INE, tema, modal de
   * compartir, guía) y decide qué slide se muestra; el store de navegación
   * (`stores/navigation.js`) es la fuente de verdad del slide activo.
   */
  import { onMount, onDestroy, tick } from 'svelte';
  import { fade, slide } from 'svelte/transition';
  import Slide1Onboarding from './components/slides/Slide1Onboarding.svelte';
  import Slide2Realidad from './components/slides/Slide2Realidad.svelte';
  import Slide3SillaVacia from './components/slides/Slide3SillaVacia.svelte';
  import Slide4Contexto from './components/slides/Slide4Contexto.svelte';
  import Slide5Compartir from './components/slides/Slide5Compartir.svelte';
  import WelcomeTour from './components/WelcomeTour.svelte';
  import Metodologia from './components/Metodologia.svelte';
  import FichaEducativa from './components/FichaEducativa.svelte';
  import { loadData } from './utils/data.js';
  import { findCohortData, getLatestElection, calculateFilledSeats } from './utils/calculos.js';
  import { getNarrative } from './utils/narrativeEngine.js';
  import { formatExactPercent } from './utils/formato.js';
  import { getAnimationDuration } from './utils/a11y.js';
  import { currentSlide, goToSlide, totalSlides } from './stores/navigation.js';

  // Duración de las transiciones entre slides (0 si el usuario pidió menos movimiento)
  const DUR_FADE = getAnimationDuration(250);
  const DUR_SLIDE = getAnimationDuration(200);

  // ================= Datos derivados =================

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
  $: votosRedondeados = participacion !== null ? Math.round(participacion) : null;

  // Motor narrativo dinámico según el año de nacimiento (sección 2 del plan).
  $: narrative = yearOfBirth ? getNarrative(yearOfBirth) : null;

  // Asientos (100) equivalentes a la participación, para el copy del slide 3
  $: filledCount = participacion !== null ? calculateFilledSeats(participacion) : 0;


  // ================= Copy de la historia =================

  // Slide 2: el choque de realidad
  $: copyChoque = (votosRedondeados !== null && latestElection)
    ? (votosRedondeados < 50
        ? `De 100 personas de tu edad en ${entidadNombre}, solo ${votosRedondeados} fueron a votar en ${latestElection.year}.`
        : `De cada 100 personas de tu edad en ${entidadNombre}, ${votosRedondeados} fueron a votar en ${latestElection.year}.`)
    : '';

  $: copyInsight = narrative?.insight ?? '';

  $: copyChoqueSecundario = abstencion !== null
    ? `${Math.round(abstencion)} personas prefirieron no participar.`
    : '';

  // Comparación con el promedio nacional (texto legible, ciudadano)
  $: comparacionFrase = deltaVsNacional === null ? '' :
    Math.abs(deltaVsNacional) < 0.5 ? 'Tu generación participa casi igual que el promedio del país.'
    : deltaVsNacional > 0 ? `Tu generación participa ${deltaVsNacional.toFixed(1)} puntos por encima del promedio del país.`
    : `Tu generación participa ${Math.abs(deltaVsNacional).toFixed(1)} puntos por debajo del promedio del país.`;

  // ================= Estado de la aplicación =================

  let yearOfBirth = null;
  let entidadCve = null;
  let entidadNombre = '';
  let cohortData = null;
  let dataLoaded = false;
  let dataError = false;
  let allData = null;
  let showMetodologia = false;
  let shareStatus = '';
  let showFicha = false;
  let metodoBtn;
  let showTour = false;

  const TOUR_KEY = 'welcome-tour-completado';

  // Mostrar el recorrido guiado solo en la primera visita de la sesión.
  // Se activa DESPUÉS de cargar los datos para que el preview del paso 3 no
  // caiga en el placeholder (ver onMount de carga de datos).
  function abrirTour() {
    showTour = true;
  }

  // Cargar datos al montar
  onMount(async () => {
    try {
      allData = await loadData();
      dataLoaded = true;

      let visto = false;
      try {
        visto = sessionStorage.getItem(TOUR_KEY) === '1';
      } catch (e) { /* modo privado: mostrar siempre */ }
      if (!visto) showTour = true;
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

  // ================= Navegación entre slides =================

  /** Avanza al siguiente slide y devuelve la vista al inicio. */
  function avanzar(destino) {
    goToSlide(destino);
    irArriba();
  }

  function irArriba() {
    tick().then(() => {
      const reduce = typeof window !== 'undefined'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  }

  // ================= Tema claro/oscuro =================
  let theme = 'dark';

  try {
    theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  } catch (e) { /* noop */ }

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

  // ================= Compartir =================
  function buildShareText() {
    const pct = participacion !== null ? formatExactPercent(participacion) : '';
    return `Mi generación (nacida en ${yearOfBirth}) participó ${pct} en ${latestElection?.year ?? '2024'} en ${entidadNombre}. #MiGeneracionEnLasUrnas`;
  }

  // 4.1 Preview del texto antes de abrir cualquier red social
  const REDES = {
    x: { nombre: 'X' },
    facebook: { nombre: 'Facebook' },
    whatsapp: { nombre: 'WhatsApp' },
    instagram: { nombre: 'compartir' }
  };

  let redPendiente = null;
  let btnCompartir;

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
      <!-- El h1 de la página es la marca: así cada vista tiene un único h1
           y los títulos de cada slide pueden ser h2 sin perder jerarquía. -->
      <h1 class="logo-section">
        <img src={theme === 'dark' ? '/images/logo_ine2026.png' : '/images/logo_inev3.webp'} alt="INE 2026, Mi Generación en las Urnas" class="logo-ine-img" />
      </h1>

      <!-- Progreso de la historia (sustituye a la barra de scroll) -->
      <div class="story-progress">
        <span class="story-progress-label">Paso {$currentSlide} de {totalSlides}</span>
        <div class="story-dots" aria-hidden="true">
          {#each Array(totalSlides) as _, i}
            <span class="story-dot" class:active={$currentSlide === i + 1} class:done={$currentSlide > i + 1}></span>
          {/each}
        </div>
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
        <button
          class="btn-link btn-ficha-header"
          on:click={() => (showFicha = true)}
          aria-label="Material para profesores y talleres"
        >
          Material para profesores y talleres
        </button>
      </div>
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
    <!-- ================= Web Story ================= -->
    <main id="main-content" class="main-content" tabindex="-1">
      <!-- Contexto: qué datos está viendo el usuario -->
      {#if $currentSlide > 1 && cohortData}
        <div class="context-bar">
          <div class="context-info">
            <span class="context-label">Tu generación</span>
            <span class="context-value">{yearOfBirth}</span>
            <span class="context-divider">·</span>
            <span class="context-value">{entidadNombre}</span>
          </div>
          <button class="btn-change" on:click={() => avanzar(1)}>Cambiar mis datos</button>
        </div>
      {/if}

      {#if $currentSlide === 1}
        <div in:fade={{ duration: DUR_FADE }} out:slide={{ duration: DUR_SLIDE }}>
          <Slide1Onboarding
            yearOfBirth={yearOfBirth}
            entidadNombre={entidadNombre}
            tieneDatos={!!cohortData}
            on:select={handleSelection}
            on:advance={() => avanzar(2)}
          />
        </div>
      {:else if $currentSlide === 2 && cohortData}
        <div in:fade={{ duration: DUR_FADE }} out:slide={{ duration: DUR_SLIDE }}>
          <Slide2Realidad
            copyPrincipal={copyChoque}
            copySecundario={copyChoqueSecundario}
            copyInsight={copyInsight}
            comparacionFrase={comparacionFrase}
            abstencion={abstencion}
            deltaVsPrev={deltaVsPrev}
            prevAnio={prevElection ? prevElection.year : null}
            nacionalPct={nacionalLatest}
            on:next={() => avanzar(3)}
            on:back={() => avanzar(1)}
          />
        </div>
      {:else if $currentSlide === 3 && cohortData}
        <div in:fade={{ duration: DUR_FADE }} out:slide={{ duration: DUR_SLIDE }}>
          <Slide3SillaVacia
            cohortData={cohortData}
            entidadNombre={entidadNombre}
            on:next={() => avanzar(4)}
            on:back={() => avanzar(2)}
          />
        </div>
      {:else if $currentSlide === 4 && cohortData}
        <div in:fade={{ duration: DUR_FADE }} out:slide={{ duration: DUR_SLIDE }}>
          <Slide4Contexto
            cohortData={cohortData}
            entidadNombre={entidadNombre}
            allData={allData}
            yearOfBirth={yearOfBirth}
            primeraVez={narrative?.primeraVez ?? false}
            on:next={() => avanzar(5)}
            on:back={() => avanzar(3)}
          />
        </div>
      {:else if $currentSlide === 5 && cohortData}
        <div in:fade={{ duration: DUR_FADE }} out:slide={{ duration: DUR_SLIDE }}>
          <Slide5Compartir
            cohortData={cohortData}
            entidadNombre={entidadNombre}
            shareStatus={shareStatus}
            on:share={(e) => pedirConfirmacion(e.detail.red, e.detail.boton)}
            on:copy={copiarTextoManual}
            on:back={() => avanzar(4)}
            on:openficha={() => (showFicha = true)}
          />
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
        <span class="footer-div" aria-hidden="true"></span>
        <a href="/data/reporte_validacion.md" target="_blank" rel="noopener">Reporte de Validación</a>
      </div>
      <div class="footer-right">
        <button class="footer-btn-tour" on:click={abrirTour}>¿Cómo funciona? Ver la guía</button>
        <span class="footer-div" aria-hidden="true"></span>
        <span>Proyecto de Datos Abiertos. Fuente: INE</span>
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

<!-- Modal de la Ficha Educativa para docentes y talleres -->
{#if showFicha}
  <FichaEducativa
    cohortData={cohortData}
    entidad={entidadNombre}
    yearOfBirth={yearOfBirth}
    nacionalPct={nacionalLatest}
    deltaVsNacional={deltaVsNacional}
    on:close={() => (showFicha = false)}
  />
{/if}

<!-- 4.1 Preview del texto antes de abrir la red social.
     IMPORTANTE: este modal vive fuera de la Web Story a propósito: el
     contenedor de los slides usa transiciones con `transform`, que crearían
     un contexto de apilamiento y dejarían el `z-index` atrapado. -->
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
  /* El App solo aporta estilos propios; el sistema de diseño vive en
     `src/styles/global.css` (tokens + clases compartidas de la Web Story). */

  /* Separador del footer: un filete, no un punto medio entre palabras */
  .footer-div {
    width: 1px;
    height: 0.9rem;
    background: var(--line);
    display: inline-block;
  }
</style>
