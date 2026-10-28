<script>
  import { onMount, onDestroy, tick } from 'svelte';
  import { fade, slide } from 'svelte/transition';
  import Slide1Onboarding from './components/slides/Slide1Onboarding.svelte';
  import Slide2Realidad from './components/slides/Slide2Realidad.svelte';
  import Slide3SillaVacia from './components/slides/Slide3SillaVacia.svelte';
  import Slide4Contexto from './components/slides/Slide4Contexto.svelte';
  import Slide5Compartir from './components/slides/Slide5Compartir.svelte';
  import WelcomeTour from './components/WelcomeTour.svelte';
  import Metodologia from './components/Metodologia.svelte';
  import ReporteValidacion from './components/ReporteValidacion.svelte';
  import FichaEducativa from './components/FichaEducativa.svelte';
  import { loadData, ENTIDADES, YEAR_RANGE } from './utils/data.js';
  import { findCohortData, getLatestElection, calculateFilledSeats } from './utils/calculos.js';
  import { getNarrative } from './utils/narrativeEngine.js';
  import { formatExactPercent } from './utils/formato.js';
  import { getAnimationDuration } from './utils/a11y.js';
  import { currentSlide, goToSlide, totalSlides } from './stores/navigation.js';

  const urlParams = typeof location !== 'undefined'
    ? new URLSearchParams(location.search)
    : new URLSearchParams();
  const modoDemo = urlParams.has('demo');

  function ejemploDemo() {
    const anio = parseInt(urlParams.get('anio'), 10);
    const cve = urlParams.get('entidad');
    if (anio && cve) {
      const c = findCohortData(allData, anio, cve);
      if (c && !c._isNational) return { anio, cve };
    }
    const valido = (c) => c.year_of_birth_min + 1 >= YEAR_RANGE.min && c.year_of_birth_min + 1 <= YEAR_RANGE.max;
    const mejor = (allData?.cohorts || [])
      .filter((c) => c.entidad_cve !== '00' && c.elections?.length && valido(c))
      .sort((a, b) =>
        b.elections.length - a.elections.length ||
        Math.abs(a.year_of_birth_min - 1990) - Math.abs(b.year_of_birth_min - 1990))[0];
    return mejor ? { anio: mejor.year_of_birth_min + 1, cve: mejor.entidad_cve } : null;
  }

  let claveDemo = 0;

  function aplicarDemo(slide, conSeleccion) {
    redPendiente = null;
    showFicha = false;
    shareStatus = '';
    yearOfBirth = null;
    entidadCve = null;
    entidadNombre = '';
    cohortData = null;

    const ej = ejemploDemo();
    if (ej) {
      document.documentElement.dataset.demoAnio = String(ej.anio);
      document.documentElement.dataset.demoEntidad = ej.cve;
      if (conSeleccion) {
        const ent = ENTIDADES.find((e) => e.cve === ej.cve);
        handleSelection({ detail: { year: ej.anio, entidad: ej.cve, nombre: ent ? ent.nombre : '' } });
      }
    }
    claveDemo += 1;
    goToSlide(slide || 1);
  }

  function prepararDemo() {
    aplicarDemo(parseInt(urlParams.get('slide'), 10) || 1, urlParams.get('sel') === '1');
    window.__demoReiniciar = async (slide, conSeleccion) => {
      aplicarDemo(slide, conSeleccion);
      await tick();
      window.scrollTo(0, 0);
    };
  }

  const DUR_FADE = getAnimationDuration(250);
  const DUR_SLIDE = getAnimationDuration(200);

  $: esNacional = !!cohortData?._isNational;
  $: lugarNombre = esNacional ? 'México (dato nacional)' : entidadNombre;

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

  $: narrative = yearOfBirth ? getNarrative(yearOfBirth) : null;

  $: filledCount = participacion !== null ? calculateFilledSeats(participacion) : 0;


  $: copyChoque = (votosRedondeados !== null && latestElection)
    ? (votosRedondeados < 50
        ? `De 100 personas de tu edad en ${lugarNombre}, solo ${votosRedondeados} fueron a votar en ${latestElection.year}.`
        : `De cada 100 personas de tu edad en ${lugarNombre}, ${votosRedondeados} fueron a votar en ${latestElection.year}.`)
    : '';

  $: copyInsight = narrative?.insight ?? '';

  $: copyChoqueSecundario = abstencion !== null
    ? `${Math.round(abstencion)} personas prefirieron no participar.`
    : '';

  $: comparacionFrase = deltaVsNacional === null ? '' :
    Math.abs(deltaVsNacional) < 0.5 ? 'Tu generación participa casi igual que el promedio del país.'
    : deltaVsNacional > 0 ? `Tu generación participa ${deltaVsNacional.toFixed(1)} puntos por encima del promedio del país.`
    : `Tu generación participa ${Math.abs(deltaVsNacional).toFixed(1)} puntos por debajo del promedio del país.`;

  let yearOfBirth = null;
  let entidadCve = null;
  let entidadNombre = '';
  let cohortData = null;
  let dataLoaded = false;
  let dataError = false;
  let allData = null;
  let showMetodologia = false;
  let showValidacion = false;
  let shareStatus = '';
  let showFicha = false;
  let metodoBtn;
  let showTour = false;

  const TOUR_KEY = 'welcome-tour-completado';

  function abrirTour() {
    showTour = true;
  }

  onMount(async () => {
    if (!modoDemo) {
      let visto = false;
      try {
        visto = sessionStorage.getItem(TOUR_KEY) === '1';
      } catch (e) { }
      if (!visto) showTour = true;
    }

    try {
      allData = await loadData();
      dataLoaded = true;
      if (modoDemo) prepararDemo();
    } catch (error) {
      console.error('Error cargando datos:', error);
      dataError = true;
      showTour = false;
    }
  });

  function handleSelection(event) {
    const { year, entidad, nombre } = event.detail;
    yearOfBirth = year;
    entidadCve = entidad;
    entidadNombre = nombre;

    if (allData) {
      cohortData = findCohortData(allData, year, entidad);
    }
  }

  function reiniciarDatos() {
    yearOfBirth = null;
    entidadCve = null;
    entidadNombre = '';
    cohortData = null;
    shareStatus = '';
    redPendiente = null;
    showFicha = false;
    avanzar(1);
  }

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

  let theme = urlParams.get('theme') === 'dark' ? 'dark' : 'light';

  $: if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }

  function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark';
  }

  function toggleMetodologia() {
    showValidacion = false;
    showMetodologia = !showMetodologia;
    if (!showMetodologia) {
      requestAnimationFrame(() => metodoBtn?.focus());
    }
  }

  let validacionBtn;
  function toggleValidacion() {
    showMetodologia = false;
    showValidacion = !showValidacion;
    irArriba();
    if (!showValidacion) {
      requestAnimationFrame(() => validacionBtn?.focus());
    }
  }

  function volverOAbrirMetodologia() {
    if (showValidacion) toggleValidacion();
    else toggleMetodologia();
  }

  function buildShareText() {
    const pct = participacion !== null ? formatExactPercent(participacion) : '';
    return `Mi generación (nacida en ${yearOfBirth}) participó ${pct} en ${latestElection?.year ?? '2024'} en ${lugarNombre}. #MiGeneracionEnLasUrnas`;
  }

  const REDES = {
    x: { nombre: 'X' },
    facebook: { nombre: 'Facebook' },
    whatsapp: { nombre: 'WhatsApp' },
    instagram: { nombre: 'compartir' }
  };

  let redPendiente = null;
  let btnCompartir;

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
      if (e?.name === 'AbortError') {
        setShareStatus('Compartir cancelado.');
      } else {
        setShareStatus('No se pudo compartir. Copia el texto de abajo manualmente.');
      }
    }
  }

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

  <header class="top-bar">
    <div
      class="top-progress"
      role="progressbar"
      aria-label="Progreso de la historia"
      aria-valuemin="1"
      aria-valuemax={totalSlides}
      aria-valuenow={$currentSlide}
      aria-valuetext={`Paso ${$currentSlide} de ${totalSlides}`}
    >
      <span class="top-progress-fill" style={`width: ${($currentSlide / totalSlides) * 100}%`}></span>
    </div>
    <div class="top-bar-content">
      <h1 class="logo-section">
        <img src="/images/logo_inev3.webp" alt="Instituto Nacional Electoral (INE) 2026, Mi Generación en las Urnas" class="logo-ine-img" class:logo-blanco={theme === 'dark'} />
      </h1>

      <div class="top-bar-actions">
        <button
          class="btn-link"
          bind:this={metodoBtn}
          on:click={volverOAbrirMetodologia}
          aria-label={(showMetodologia || showValidacion) ? "Volver a mi resultado" : "Ver metodología y fuentes"}
        >
          {(showMetodologia || showValidacion) ? '← Volver a mi resultado' : 'Cómo se calculó'}
        </button>
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
      </div>
    </div>
  </header>

  {#if dataError}
    <main id="main-content" class="main-content" tabindex="-1">
      <div class="error-state" role="alert">
        <h2>No pudimos cargar los datos</h2>
        <p>Verifica tu conexión e intenta recargar la página. Los datos provienen de un archivo estático del Instituto Nacional Electoral (INE).</p>
        <button class="btn-retry" on:click={() => location.reload()}>Reintentar</button>
      </div>
    </main>
  {:else if !dataLoaded}
    <div id="main-content" class="loading-screen" role="status" aria-live="polite" tabindex="-1">
      <div class="loading-spinner" aria-hidden="true">
        <span class="casilla"></span><span class="casilla"></span><span class="casilla"></span><span class="casilla"></span>
      </div>
      <p>Cargando datos del Instituto Nacional Electoral (INE)… esto toma solo unos segundos.</p>
    </div>
  {:else if showValidacion}
    <main id="main-content" class="main-content" tabindex="-1">
      <ReporteValidacion on:close={toggleValidacion} />
    </main>
  {:else if showMetodologia}
    <main id="main-content" class="main-content" tabindex="-1">
      <Metodologia on:close={toggleMetodologia} />
    </main>
  {:else}
    {#key claveDemo}
    <main id="main-content" class="main-content" tabindex="-1">
      {#if $currentSlide > 1 && cohortData}
        <div class="context-bar">
          <div class="context-info">
            <span class="context-label">Tu generación</span>
            <span class="context-value">{yearOfBirth}</span>
            <span class="context-divider" aria-hidden="true"></span>
            <span class="context-value">{lugarNombre}</span>
          </div>
          <button class="btn-change" on:click={reiniciarDatos}>Cambiar mis datos</button>
        </div>
        {#if esNacional}
          <p class="aviso-nacional" role="note">
            No hay datos suficientes para {entidadNombre} con tu año de nacimiento; se muestran los datos nacionales.
          </p>
        {/if}
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
            numero={votosRedondeados}
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
            entidadNombre={lugarNombre}
            shareStatus={shareStatus}
            on:share={(e) => pedirConfirmacion(e.detail.red, e.detail.boton)}
            on:copy={copiarTextoManual}
            on:back={() => avanzar(4)}
            on:openficha={() => (showFicha = true)}
          />
        </div>
      {/if}
    </main>
    {/key}
  {/if}

  <footer class="app-footer">
    <div class="footer-content">
      <div class="footer-left">
        <a href="#reporte-validacion" bind:this={validacionBtn} on:click|preventDefault={toggleValidacion}>Reporte de Validación</a>
      </div>
      <div class="footer-right">
        <button class="footer-btn-tour" on:click={abrirTour}>¿Cómo funciona? Ver la guía</button>
        <span class="footer-div" aria-hidden="true"></span>
        <span>Proyecto de Datos Abiertos. Fuente: Instituto Nacional Electoral (INE)</span>
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

{#if showFicha}
  <FichaEducativa
    cohortData={cohortData}
    entidad={lugarNombre}
    yearOfBirth={yearOfBirth}
    deltaVsNacional={deltaVsNacional}
    on:close={() => (showFicha = false)}
  />
{/if}

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
  .aviso-nacional {
    margin: 0.5rem 0 1rem;
    padding: 0.6rem 0.9rem;
    background: var(--bg-warning);
    border-left: 3px solid var(--accent-pink);
    font-size: 0.95rem;
  }

  .footer-div {
    width: 1px;
    height: 0.9rem;
    background: currentColor;
    opacity: 0.35;
    display: inline-block;
  }
</style>
