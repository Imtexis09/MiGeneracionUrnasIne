<script>
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import DemoStage from './demo/DemoStage.svelte';
  import DemoPantalla from './demo/DemoPantalla.svelte';

  export let yearOfBirth = null;
  export let entidadNombre = '';
  export let participacion = null;
  export let anioEleccion = null;

  const dispatch = createEventDispatcher();
  const STORAGE_KEY = 'welcome-tour-completado';
  const TOTAL = 5;

  const DURACION_VIVA = [10, 7, 10, 11.5, 11.5];

  let vivo = true;
  let demoListo = false;
  let pantalla;

  function alFallo() {
    vivo = false;
  }

  function alVuelta() {
    pantalla?.reiniciar();
  }

  let paso = 0;
  let dialogoEl;
  let botonCerrarEl;
  let elementoPrevio = null;

  const ESPERA_MAX_MS = 1500;
  let visible = false;
  let temporizador;

  function mostrar() {
    if (visible) return;
    visible = true;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => botonCerrarEl?.focus());
  }

  $: if (demoListo || !vivo) mostrar();

  onMount(() => {
    elementoPrevio = document.activeElement;
    temporizador = setTimeout(mostrar, ESPERA_MAX_MS);
    window.addEventListener('keydown', onKeydown);
  });

  onDestroy(() => {
    clearTimeout(temporizador);
    document.body.style.overflow = '';
    window.removeEventListener('keydown', onKeydown);
  });

  function onKeydown(event) {
    if (!visible) return;
    if (event.key === 'Escape') {
      cerrar();
    } else if (event.key === 'Tab') {
      trapFoco(event);
    } else if (event.key === 'ArrowRight' && paso < TOTAL - 1) {
      siguiente();
    } else if (event.key === 'ArrowLeft' && paso > 0) {
      anterior();
    }
  }

  function trapFoco(event) {
    if (!dialogoEl) return;
    const focusables = dialogoEl.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusables.length === 0) return;
    const primero = focusables[0];
    const ultimo = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === primero) {
      event.preventDefault();
      ultimo.focus();
    } else if (!event.shiftKey && document.activeElement === ultimo) {
      event.preventDefault();
      primero.focus();
    }
  }

  function marcarVisto() {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch (e) { }
  }

  function siguiente() {
    if (paso < TOTAL - 1) {
      paso += 1;
      anunciarPaso();
    } else {
      cerrar();
    }
  }

  function anterior() {
    if (paso > 0) {
      paso -= 1;
      anunciarPaso();
    }
  }

  function cerrar() {
    marcarVisto();
    dispatch('close');
    requestAnimationFrame(() => {
      if (elementoPrevio && elementoPrevio.isConnected !== false) {
        elementoPrevio.focus?.();
      }
    });
  }

  function saltar() {
    marcarVisto();
    dispatch('close');
    requestAnimationFrame(() => {
      if (elementoPrevio && elementoPrevio.isConnected !== false) {
        elementoPrevio.focus?.();
      }
    });
  }

  function anunciarPaso() {
    requestAnimationFrame(() => dialogoEl?.focus());
  }

  $: hayPreview = participacion !== null && anioEleccion !== null;

  $: titulos = [
    'Paso 1 de 5: tu año y tu estado',
    'Paso 2 de 5: el choque',
    'Paso 3 de 5: la silla vacía',
    'Paso 4 de 5: cómo ha cambiado',
    'Paso 5 de 5: compártelo'
  ];

  $: cuerpos = [
    'Elige tu año de nacimiento y tu estado. Con eso te ubicamos en tu generación: grupos de 3 años de los conteos censales del Instituto Nacional Electoral (INE), no personas individuales.',
    'Primero ves cuántas de cada 100 personas de tu generación votaron en la última elección, y cómo se compara con la elección anterior y con el promedio del país.',
    'Cada casilla es una persona de tu generación. Las marcadas votaron; las vacías se quedaron en casa.',
    'Una línea muestra qué porcentaje de tu generación votó en cada elección, y tu credencial resume tus datos. Abre «Tu generación a la misma edad» para compararla con otras.',
    'Se genera en tu navegador una imagen con tus datos, lista para compartir en X, Facebook, Instagram o WhatsApp. También hay material para profesores y talleres. No se envía nada a ningún servidor.'
  ];
</script>

<div class="tour-backdrop" class:oculto={!visible} on:click|self={saltar} role="presentation">
  <div
    class="tour-dialog hoja"
    class:sin-demo={!vivo}
    bind:this={dialogoEl}
    role="dialog"
    aria-modal="true"
    aria-labelledby="tour-title"
    aria-describedby="tour-desc"
    tabindex="-1"
  >
    <button class="tour-close" bind:this={botonCerrarEl} on:click={saltar} aria-label="Cerrar la guía">
      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" aria-hidden="true">
        <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round"/>
      </svg>
    </button>

    <div class="tour-dots" aria-hidden="true">
      {#each Array(TOTAL) as _, i}
        <span class="tour-dot" class:active={i === paso}></span>
      {/each}
    </div>
    <p class="sr-only" aria-live="polite">Paso {paso + 1} de {TOTAL} de la guía</p>

    <h2 class="tour-title" id="tour-title">{titulos[paso]}</h2>

    {#if vivo}
      <div class="tour-demo">
        <DemoStage
          duracion={DURACION_VIVA[paso]}
          clave={paso}
          bind:listo={demoListo}
          on:vuelta={alVuelta}
          let:t
          let:reducido
        >
          <DemoPantalla
            bind:this={pantalla}
            {t}
            {paso}
            {reducido}
            on:listo={() => (demoListo = true)}
            on:fallo={alFallo}
          />
        </DemoStage>
      </div>
    {/if}

    <p class="tour-text" id="tour-desc">{cuerpos[paso]}</p>

    <div class="tour-extra">
    {#if paso === 1}
      <div class="tour-preview" id="tour-desc-preview">
        {#if hayPreview}
          <p class="preview-main">
            De cada 100 personas nacidas en {yearOfBirth} que viven en {entidadNombre},
            aproximadamente <strong>{Math.round(participacion)}</strong> votaron en {anioEleccion}.
          </p>
        {:else}
          <p class="preview-placeholder">Tu resultado aparecerá aquí en cuanto elijas tus 2 datos.</p>
        {/if}
      </div>

      <p class="tour-note">
        Seguimos <strong>grupos de edad</strong> entre elecciones, no a las mismas personas.
      </p>
    {/if}
    </div>

    <div class="tour-actions">
      <button class="btn-skip" on:click={saltar}>Omitir guía</button>
      <div class="tour-nav">
        {#if paso > 0}
          <button class="btn-back" on:click={anterior}>Atrás</button>
        {/if}
        <button class="btn-primary btn-next" on:click={siguiente}>
          {paso === TOTAL - 1 ? 'Empezar' : 'Siguiente'}
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .tour-backdrop {
    position: fixed;
    inset: 0;
    background: var(--backdrop);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    z-index: 2000;
  }

  .tour-backdrop:not(.oculto) {
    animation: fadeIn 0.2s ease-out;
  }

  .tour-backdrop.oculto {
    visibility: hidden;
    pointer-events: none;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .tour-dialog {
    --tour-pad-y: 2rem;
    position: relative;
    padding: var(--tour-pad-y) 2rem;
    max-width: 34rem;
    width: 100%;
    max-height: calc(100dvh - 3rem);
    overflow-y: auto;
  }

  .tour-dialog:focus {
    outline: none;
  }

  .tour-close {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    min-width: 44px;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    line-height: 0;
  }

  .tour-close:hover {
    color: var(--accent-pink);
  }

  .tour-dots {
    display: flex;
    gap: 0.4rem;
    margin-bottom: 1.25rem;
  }

  .tour-dot {
    width: 1rem;
    height: 1rem;
    border: 1.5px solid var(--text-muted);
    border-radius: 2px;
    transition: background-color var(--transition-base);
  }

  .tour-dot.active {
    border: 2px solid var(--accent-pink);
    background: color-mix(in srgb, var(--accent-pink) 25%, transparent);
  }

  .tour-demo {
    margin-bottom: 1.25rem;
  }

  .tour-title {
    font-size: clamp(2rem, 5vw, 2.6rem);
    line-height: 0.98;
    margin-bottom: 0.9rem;
    max-width: 20ch;
  }

  .tour-text {
    margin-bottom: 1.5rem;
    line-height: 1.6;
  }

  .tour-preview {
    margin-bottom: 1rem;
    padding: 1.1rem 1.25rem;
    background: var(--bg-main);
    border-left: 3px solid var(--accent-pink);
  }

  .preview-main {
    font-size: 1.0625rem;
    line-height: 1.5;
    color: var(--text-primary);
  }

  .preview-main strong {
    color: var(--accent-pink);
    font-family: var(--font-display);
    font-size: 1.6em;
    line-height: 1;
  }

  .preview-placeholder {
    margin: 0;
    color: var(--text-muted);
  }

  .tour-note {
    margin-bottom: 1.5rem;
    font-size: 0.875rem;
    color: var(--text-muted);
    line-height: 1.5;
  }

  .tour-actions {
    position: sticky;
    bottom: calc(var(--tour-pad-y) * -1);
    z-index: 4;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: calc(var(--tour-pad-y) * -1);
    padding: 0.6rem 0 var(--tour-pad-y);
    background: var(--bg-card);
  }

  .tour-nav {
    display: flex;
    gap: 0.5rem;
  }

  .btn-skip {
    min-height: 44px;
    padding: 0.5rem 0;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-secondary);
    text-decoration: underline;
    text-underline-offset: 0.25em;
  }

  .btn-skip:hover {
    color: var(--text-primary);
  }

  .btn-next {
    width: auto;
    min-height: 48px;
    padding: 0.6rem 1.5rem;
  }

  @media (min-width: 900px) {
    .tour-dialog {
      max-width: 70rem;
      display: grid;
      grid-template-columns: minmax(0, 22rem) minmax(0, 1fr);
      grid-template-rows: auto auto auto auto 1fr auto;
      column-gap: 2rem;
      align-content: start;
    }

    .tour-dialog > .tour-demo {
      grid-column: 2;
      grid-row: 1 / -1;
      align-self: center;
      margin-bottom: 0;
      padding: 1.5rem;
    }

    .tour-dialog > :not(.tour-demo):not(.tour-close) {
      grid-column: 1;
    }

    .tour-dialog.sin-demo {
      max-width: 34rem;
      display: block;
    }

    .tour-dialog.sin-demo .tour-actions {
      position: sticky;
      margin-bottom: calc(var(--tour-pad-y) * -1);
      padding: 0.6rem 0 var(--tour-pad-y);
    }

    .tour-actions {
      position: static;
      margin-bottom: 0;
      padding: 0.6rem 0 0;
      align-self: end;
    }
  }

  @media (max-width: 480px) {
    .tour-dialog {
      --tour-pad-y: 1.5rem;
      padding: var(--tour-pad-y) 1.25rem;
    }

    .tour-actions {
      flex-direction: column-reverse;
      align-items: stretch;
    }

    .tour-nav {
      justify-content: space-between;
    }

    .btn-next {
      flex: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .tour-backdrop {
      animation: none;
    }
  }
</style>
